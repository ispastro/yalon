import { useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Returns a `logAction` function that inserts a row into audit_log.
 * Failures are swallowed — a logging error should never break the main action.
 *
 * Usage:
 *   const logAction = useAuditLog();
 *   await logAction({
 *     tableName: 'employee_applications',
 *     recordId: id,
 *     action: 'status_change',
 *     oldValue: prevStatus,
 *     newValue: newStatus,
 *   });
 */
export function useAuditLog() {
  const { session } = useAuth();

  const logAction = useCallback(
    async ({ tableName, recordId, action, oldValue, newValue, note }) => {
      if (!session?.user) return; // not signed in, nothing to log

      try {
        await supabase.from('audit_log').insert({
          actor_id: session.user.id,
          actor_email: session.user.email,
          table_name: tableName,
          record_id: recordId,
          action,
          old_value: oldValue != null ? String(oldValue) : null,
          new_value: newValue != null ? String(newValue) : null,
          note: note ?? null,
        });
      } catch (err) {
        // Audit log failures must never break the main request
        console.warn('[audit_log] Failed to write audit entry:', err);
      }
    },
    [session]
  );

  return logAction;
}
