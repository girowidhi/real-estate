import { NextResponse } from 'next/server';
import { requireAdmin } from './auth';
import { logAudit } from './audit';
import { supabaseAdmin } from './db';

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
}

type ApiHandler = (req: Request, session: SessionData, context?: { params: Record<string, string> }) => Promise<NextResponse>;

export function withAdminAuth(handler: ApiHandler) {
  return async (req: Request, routeContext?: { params: Promise<Record<string, string>> | Record<string, string> }) => {
    try {
      const session = await requireAdmin();
      let resolvedParams: Record<string, string> = {};
      if (routeContext?.params) {
        resolvedParams = routeContext.params instanceof Promise ? await routeContext.params : routeContext.params;
      }
      return await handler(req, session, { params: resolvedParams });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized';
      if (message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

async function createNotification(type: string, title: string, message?: string, payload?: Record<string, unknown>) {
  try {
    await supabaseAdmin.from('notifications').insert({ type, title, message, payload: payload || {} }).select('id').single();
  } catch { /* silent */ }
}

export function withAudit(
  entityType: string,
  handler: ApiHandler
) {
  return withAdminAuth(async (req, session, context) => {
    const result = await handler(req, session, context);
    const action = req.method === 'POST' ? 'create' : req.method === 'PATCH' ? 'update' : req.method === 'DELETE' ? 'delete' : 'unknown';
    try {
      const data = result && 'json' in result ? await result.clone().json() : null;
      logAudit(action, entityType, data?.id || null, null, data);
      if (action === 'create' || action === 'delete') {
        const title = action === 'create' ? `New ${entityType.replace(/_/g, ' ')} created` : `${entityType.replace(/_/g, ' ')} deleted`;
        createNotification('admin', title, undefined, { entity_type: entityType, entity_id: data?.id, action });
      }
    } catch { /* silent */ }
    return result;
  });
}

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
