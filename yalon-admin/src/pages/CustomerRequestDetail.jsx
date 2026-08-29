import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';
import Toast, { useToast } from '../components/Toast';
import { useAuditLog } from '../lib/useAuditLog';

const STATUS_OPTIONS = [
  'submitted', 'quoted', 'advance_paid', 'confirmed', 'completed', 'cancelled',
];

const TABS = ['Overview', 'Event Details', 'Payment'];

export default function CustomerRequestDetail() {
  const { id } = useParams();
  const { toast, showToast, hideToast } = useToast();
  const logAction = useAuditLog();

  const [record, setRecord] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const [quotedAmount, setQuotedAmount] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [savingAmounts, setSavingAmounts] = useState(false);

  useEffect(() => {
    supabase.from('customer_requests').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) setLoadError(error.message);
        else {
          setRecord(data);
          setQuotedAmount(data.quoted_amount ?? '');
          setAdvancePaid(data.advance_amount_paid ?? '');
        }
      });
  }, [id]);

  async function updateStatus(newStatus) {
    const prevStatus = record.status;
    setSaving(true);
    const { error } = await supabase
      .from('customer_requests')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      setRecord((r) => ({ ...r, status: newStatus }));
      showToast('Status updated', 'success');
      await logAction({
        tableName: 'customer_requests',
        recordId: id,
        action: 'status_change',
        oldValue: prevStatus,
        newValue: newStatus,
      });
    }
    setSaving(false);
  }

  async function saveAmounts(e) {
    e.preventDefault();
    setSavingAmounts(true);
    const patch = {
      quoted_amount: quotedAmount !== '' ? Number(quotedAmount) : null,
      advance_amount_paid: advancePaid !== '' ? Number(advancePaid) : null,
    };
    const { error } = await supabase
      .from('customer_requests')
      .update(patch)
      .eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      setRecord((r) => ({ ...r, ...patch }));
      showToast('Amounts saved', 'success');
      await logAction({
        tableName: 'customer_requests',
        recordId: id,
        action: 'amount_update',
        note: `quoted=${patch.quoted_amount ?? '—'}, advance=${patch.advance_amount_paid ?? '—'}`,
      });
    }
    setSavingAmounts(false);
  }

  if (loadError) return (
    <div className="inline-error" style={{ margin: 40 }}>{loadError}</div>
  );
  if (!record) return <div className="loading-text">Loading…</div>;

  const staffBreakdownEntries = Object.entries(record.staff_breakdown || {}).filter(([, v]) => Number(v) > 0);

  return (
    <div>
      <Toast {...toast} onHide={hideToast} />

      <Link to="/customer-requests" className="back-link">← Customer Requests</Link>

      <div className="detail-header">
        <div className="detail-header-left">
          <div className="eyebrow">Customer Request</div>
          <h1>{record.company_name}</h1>
        </div>
        <div className="detail-header-right">
          <StatusBadge status={record.status} />
          <select
            className="status-select"
            value={record.status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value)}
            aria-label="Update status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'Overview' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-section-label">Contact Information</div>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="lbl">Contact Person</span>
                <span className="val">{record.contact_person}{record.job_title ? ` · ${record.job_title}` : ''}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Phone</span>
                <span className="val">{record.phone_number}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">WhatsApp</span>
                <span className="val">{record.whatsapp_number || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Email</span>
                <span className="val">{record.email}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Address</span>
                <span className="val">{record.company_address || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">City</span>
                <span className="val">{record.city || '—'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-label">Service Requested</div>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="lbl">Service Types</span>
                <span className="val">
                  {(record.service_types || []).map((s) => s.replace(/_/g, ' ')).join(', ') || '—'}
                </span>
              </div>
              <div className="detail-field">
                <span className="lbl">Positions Requested</span>
                <span className="val">
                  {(record.positions_requested || []).map((p) => p.replace(/_/g, ' ')).join(', ') || '—'}
                </span>
              </div>
            </div>

            {staffBreakdownEntries.length > 0 && (
              <>
                <div className="detail-section-label" style={{ marginTop: 20 }}>Staff Breakdown</div>
                <div className="doc-list">
                  {staffBreakdownEntries.map(([role, count]) => (
                    <span key={role} className="doc-chip">
                      {count} × {role.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {(record.requirements_description || record.special_instructions || record.additional_comments) && (
            <div className="detail-section">
              <div className="detail-section-label">Additional Information</div>
              {record.requirements_description && (
                <div className="detail-field" style={{ marginBottom: 14 }}>
                  <span className="lbl">Requirements</span>
                  <span className="val">{record.requirements_description}</span>
                </div>
              )}
              {record.special_instructions && (
                <div className="detail-field" style={{ marginBottom: 14 }}>
                  <span className="lbl">Special Instructions</span>
                  <span className="val">{record.special_instructions}</span>
                </div>
              )}
              {record.additional_comments && (
                <div className="detail-field">
                  <span className="lbl">Comments</span>
                  <span className="val">{record.additional_comments}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Event Details */}
      {activeTab === 'Event Details' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-panel-dark" style={{ marginBottom: 0 }}>
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="lbl">Event Name</span>
                  <span className="val">{record.event_name || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Date</span>
                  <span className="val">{record.event_date || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Start Time</span>
                  <span className="val">{record.start_time || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">End Time</span>
                  <span className="val">{record.end_time || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Venue</span>
                  <span className="val">{record.event_venue || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Number of Guests</span>
                  <span className="val">{record.number_of_guests ?? '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Total Staff Required</span>
                  <span className="val">{record.total_staff_required ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payment */}
      {activeTab === 'Payment' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-section-label">Payment Details</div>
            <div className="detail-grid" style={{ marginBottom: 24 }}>
              <div className="detail-field">
                <span className="lbl">Preferred Method</span>
                <span className="val">
                  {record.preferred_payment_method
                    ? record.preferred_payment_method.replace(/_/g, ' ')
                    : '—'}
                </span>
              </div>
              {record.other_payment_note && (
                <div className="detail-field">
                  <span className="lbl">Note</span>
                  <span className="val">{record.other_payment_note}</span>
                </div>
              )}
            </div>

            <form onSubmit={saveAmounts}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 20 }}>
                <div>
                  <label className="field-label" htmlFor="quoted_amount">Quoted Amount (ETB)</label>
                  <input
                    id="quoted_amount"
                    className="field-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="advance_paid">Advance Paid (ETB)</label>
                  <input
                    id="advance_paid"
                    className="field-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {quotedAmount && advancePaid && (
                <div style={{
                  background: 'var(--cream-light)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 16px',
                  marginBottom: 20,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ink-muted)',
                }}>
                  Balance due:{' '}
                  <strong style={{ color: 'var(--ink)', fontSize: 14 }}>
                    ETB {(Number(quotedAmount) - Number(advancePaid)).toLocaleString()}
                  </strong>
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={savingAmounts}>
                {savingAmounts ? 'Saving…' : 'Save Amounts'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
