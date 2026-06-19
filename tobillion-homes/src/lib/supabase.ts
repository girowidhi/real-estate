import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'tobillion.db');

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode=WAL');
    db.exec('PRAGMA foreign_keys=ON');
    runMigrations(db);
  }
  return db;
}

function runMigrations(d: DatabaseSync) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT DEFAULT 'admin' CHECK (role IN ('admin','superadmin')), is_2fa_enabled INTEGER DEFAULT 0, last_login_at TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS password_reset_tokens (id TEXT PRIMARY KEY, user_id TEXT REFERENCES admin_users(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, expires_at TEXT NOT NULL, used INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS admin_sessions (token TEXT PRIMARY KEY, data TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, user_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, before_data TEXT DEFAULT '{}', after_data TEXT DEFAULT '{}', ip_address TEXT, user_agent TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT, payload TEXT DEFAULT '{}', delivered_at TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS page_content (id TEXT PRIMARY KEY, page_key TEXT NOT NULL, section_key TEXT NOT NULL, content TEXT NOT NULL DEFAULT '{}', is_published INTEGER DEFAULT 1, version INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), UNIQUE(page_key, section_key));
    CREATE TABLE IF NOT EXISTS site_settings (id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, value TEXT NOT NULL DEFAULT '{}', updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS partners (id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, website TEXT, is_published INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS content_versions (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, version INTEGER NOT NULL, data TEXT NOT NULL, created_by TEXT REFERENCES admin_users(id), created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, price REAL, currency TEXT DEFAULT 'KES', type TEXT, status TEXT DEFAULT 'available', location TEXT, address TEXT, neighborhood TEXT, bedrooms INTEGER, bathrooms INTEGER, area REAL, area_sqm REAL, area_unit TEXT DEFAULT 'sqm', year_built INTEGER, featured INTEGER DEFAULT 0, verified INTEGER DEFAULT 0, images TEXT DEFAULT '[]', amenities TEXT DEFAULT '[]', features TEXT DEFAULT '[]', floor_plans TEXT DEFAULT '[]', lat REAL, lng REAL, agent_id TEXT, rating REAL DEFAULT 0, review_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS price_history (id TEXT PRIMARY KEY, property_id TEXT REFERENCES properties(id) ON DELETE CASCADE, price REAL NOT NULL, date TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, content TEXT, excerpt TEXT, author TEXT, category TEXT DEFAULT 'General', image TEXT, cover_image TEXT, tags TEXT DEFAULT '[]', published INTEGER DEFAULT 0, read_time INTEGER, published_at TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, email TEXT, phone TEXT, bio TEXT, photo TEXT, title TEXT, verified INTEGER DEFAULT 0, rating REAL DEFAULT 0, review_count INTEGER DEFAULT 0, listings INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT, content TEXT NOT NULL, avatar TEXT, rating INTEGER DEFAULT 5, is_published INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS faq_items (id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, category TEXT, sort_order INTEGER DEFAULT 0, is_published INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS neighborhoods (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, image TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS contact_submissions (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, message TEXT, interest TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS valuation_requests (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, property_type TEXT, neighborhood TEXT, size_sqm REAL, bedrooms INTEGER, year_built INTEGER, estimated_value REAL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS saved_searches (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, filters TEXT NOT NULL DEFAULT '{}', alert_enabled INTEGER DEFAULT 0, alert_frequency TEXT DEFAULT 'daily', alert_channels TEXT DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')));
  `);
}

function genId(): string { return crypto.randomUUID(); }

function sanitizeValue(val: any): any {
  if (val === undefined) return null;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return val;
}

function splitSelectParts(selectStr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of selectStr) {
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  const last = current.trim();
  if (last) parts.push(last);
  return parts;
}

function parseJoinColumns(selectStr: string): { mainCols: string[]; joins: { alias: string; table: string; cols: string }[] } {
  const joins: { alias: string; table: string; cols: string }[] = [];
  const parts = splitSelectParts(selectStr);
  const mainCols: string[] = [];
  for (const part of parts) {
    const joinMatch = part.match(/^(\w+):(\w+)\((.*)\)$/);
    if (joinMatch) {
      joins.push({ alias: joinMatch[1], table: joinMatch[2], cols: joinMatch[3] || '*' });
    } else {
      const bareJoin = part.match(/^(\w+)\((.*)\)$/);
      if (bareJoin) {
        joins.push({ alias: bareJoin[1], table: bareJoin[1], cols: bareJoin[2] || '*' });
      } else {
        mainCols.push(part);
      }
    }
  }
  return { mainCols, joins };
}

type FilterDef = [string, string, any];

class QueryBuilder {
  private table: string;
  private mode: 'select' | 'insert' = 'select';
  private columns: string = '*';
  private filters: FilterDef[] = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private singleResult: boolean = false;
  private insertData: any = null;
  private joins: { alias: string; table: string; cols: string }[] = [];
  private limitN: number | null = null;

  constructor(table: string) { this.table = table; }

  select(columns?: string, _options?: any): this {
    this.mode = 'select';
    this.columns = columns || '*';
    const parsed = parseJoinColumns(this.columns);
    this.joins = parsed.joins;
    return this;
  }

  insert(data: any): this { this.mode = 'insert'; this.insertData = data; return this; }

  eq(col: string, val: any): this { this.filters.push([col, '=', val]); return this; }
  neq(col: string, val: any): this { this.filters.push([col, '!=', val]); return this; }
  gte(col: string, val: any): this { this.filters.push([col, '>=', val]); return this; }
  lte(col: string, val: any): this { this.filters.push([col, '<=', val]); return this; }
  in(col: string, vals: any[]): this { if (vals.length > 0) this.filters.push([col, 'IN', vals]); return this; }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderCol = col; this.orderAsc = opts?.ascending !== false; return this;
  }

  single(): this { this.singleResult = true; return this; }

  limit(n: number): this { this.limitN = n; return this; }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    _onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result = this.execute();
    return Promise.resolve(result).then(onfulfilled, _onrejected);
  }

  private buildWhereClause(params: any[], prefixCols = false): string {
    const clauses: string[] = [];
    for (const [col, op, val] of this.filters) {
      const prefixed = prefixCols ? `${this.table}.${col}` : col;
      if (op === 'IN') {
        const ph = (val as any[]).map(() => '?').join(',');
        clauses.push(`${prefixed} IN (${ph})`);
        for (const v of val) params.push(sanitizeValue(v));
      } else {
        clauses.push(`${prefixed} ${op} ?`);
        params.push(sanitizeValue(val));
      }
    }
    return clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
  }

  private doInsert(d: DatabaseSync) {
    const raw = Array.isArray(this.insertData) ? this.insertData[0] : this.insertData;
    if (!raw) return { data: null, error: { message: 'No data' } };
    const cols: string[] = [];
    const ph: string[] = [];
    const vals: any[] = [];
    if (!raw.id) { cols.push('id'); ph.push('?'); vals.push(genId()); }
    for (const [k, v] of Object.entries(raw)) {
      if (k === 'id' && !raw.id) continue;
      cols.push(k); ph.push('?'); vals.push(sanitizeValue(v));
    }
    d.prepare(`INSERT INTO ${this.table} (${cols.join(',')}) VALUES (${ph.join(',')})`).run(...vals);
    const idVal = raw.id || vals[0];
    const row = d.prepare(`SELECT * FROM ${this.table} WHERE id=?`).get(idVal);
    return { data: this.singleResult ? (row || null) : row ? [row] : [], error: null };
  }

  private getTableColumns(d: DatabaseSync, table: string): string[] {
    const info = d.prepare(`PRAGMA table_info(${table})`).all() as any[];
    return info.map((r: any) => r.name);
  }

  private execute(): { data: any; count?: number; error: any } {
    try {
      const d = getDb();
      if (this.mode === 'insert') return this.doInsert(d);

      const params: any[] = [];
      let selectCols = `${this.table}.*`;
      let fromClause = `FROM ${this.table}`;
      for (const j of this.joins) {
        const fkMap: Record<string, string> = { neighborhoods: 'neighborhood', agents: 'agent_id' };
        const fk = fkMap[j.table] || `${j.table.slice(0, -1)}_id`;
        fromClause += ` LEFT JOIN ${j.table} AS ${j.alias} ON ${this.table}.${fk} = ${j.alias}.id`;
        const cols = this.getTableColumns(d, j.table);
        for (const col of cols) {
          selectCols += `, ${j.alias}.${col} AS "${j.alias}_${col}"`;
        }
      }
      const hasJoins = this.joins.length > 0;
      const whereClause = this.buildWhereClause(params, hasJoins);
      const orderCol = hasJoins ? `${this.table}.${this.orderCol}` : this.orderCol;
      const orderClause = this.orderCol ? ` ORDER BY ${orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}` : '';
      const limitClause = this.limitN ? ` LIMIT ${this.limitN}` : '';
      const sql = `SELECT ${selectCols} ${fromClause} ${whereClause}${orderClause}${limitClause}`;
      const rows = d.prepare(sql).all(...params);
      return { data: this.singleResult ? (rows[0] || null) : rows, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message || 'Database error' } };
    }
  }
}

const client = {
  from(table: string) { return new QueryBuilder(table); },
};

export const supabase = client;
export const supabaseAdmin = client;

export async function getProperties(filters?: Record<string, any>) {
  let query = supabase.from('properties').select('*, neighborhood:neighborhoods(*), agent:agents(*)');
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.neighborhood) query = query.eq('neighborhood', filters.neighborhood);
  if (filters?.minPrice) query = query.gte('price', filters.minPrice);
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
  if (filters?.featured) query = query.eq('featured', true);
  if (filters?.status) query = query.eq('status', filters.status);
  query = query.eq('status', 'available').order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPropertyBySlug(slug: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*, neighborhood:neighborhoods(*), agent:agents(*), price_history(*)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function createContactSubmission(submission: {
  name: string; email: string; phone?: string; message?: string; interest?: string;
}) {
  const { data, error } = await supabase.from('contact_submissions').insert([submission]).select().single();
  if (error) throw error;
  return data;
}

export async function createValuationRequest(request: {
  name: string; email: string; phone?: string; property_type?: string;
  neighborhood?: string; size_sqm?: number; bedrooms?: number; year_built?: number; estimated_value?: number;
}) {
  const { data, error } = await supabase.from('valuation_requests').insert([request]).select().single();
  if (error) throw error;
  return data;
}

export async function saveSearch(userId: string, search: {
  name?: string; filters: Record<string, any>; alert_enabled?: boolean;
  alert_frequency?: string; alert_channels?: string[];
}) {
  const { data, error } = await supabase.from('saved_searches').insert([{ user_id: userId, ...search }]).select().single();
  if (error) throw error;
  return data;
}

export async function getSavedSearches(userId: string) {
  const { data, error } = await supabase
    .from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
