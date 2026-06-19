import { supabaseAdmin } from './db';
import { getSession } from './auth';

async function createNotification(type: string, title: string, message?: string, payload?: Record<string, unknown>) {
  try { await supabaseAdmin.from('notifications').insert({ type, title, message, payload: payload || {} }).select('id').single(); } catch { /* silent */ }
}

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  beforeData: object | null,
  afterData: object | null
) {
  try {
    const session = await getSession();
    const { data: audit } = await supabaseAdmin
      .from('audit_log')
      .insert({
        user_id: session?.userId || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        before_data: beforeData || {},
        after_data: afterData || {},
        ip_address: null,
        user_agent: null,
      })
      .select('id')
      .single();

    if (action === 'create' || action === 'delete') {
      const title = action === 'create'
        ? `New ${entityType.replace(/_/g, ' ')}`
        : `${entityType.replace(/_/g, ' ')} removed`;
      const shortId = entityId ? entityId.substring(0, 8) : '';
      createNotification('admin', title, shortId ? `ID: ${shortId}` : undefined);
    }

    return audit?.id;
  } catch {
    return null;
  }
}
