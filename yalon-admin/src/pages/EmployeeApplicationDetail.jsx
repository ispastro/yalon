import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getSignedDocumentUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Toast, { useToast } from '../components/Toast';
import { useAuditLog } from '../lib/useAuditLog';

const STATUS_OPTIONS = ['submitted', 'under_review', 'approved', 'rejected', 'on_hold'];

const TABS = ['Personal', 'Experience', 'Availability', 'Documents & Notes'];

export default function EmployeeApplicationDetail() {
  const { id } = useParams();
  const { session } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const logAction = useAuditLog();

  const [record, setRecord] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Personal');

  const [reviewerNotes, setReviewerNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [docLoading, setDocLoading] = useState(null);

  useEffect(() => {
    supabase
      .from('employee_applications')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setLoadError(error.message);
        else {
          setRecord(data);
          setReviewerNotes(data.reviewer_notes ?? '');
        }
      });

    supabase
      .from('employee_documents')
      .select('*')
      .eq('application_id', id)
      .then(({ data }) => setDocuments(data || []));
  }, [id]);

  async function updateStatus(newStatus) {
    const prevStatus = record.status;
    setSaving(true);
    const { error } = await supabase
      .from('employee_applications')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      setRecord((r) => ({ ...r, status: newStatus }));
      showToast('Status updated', 'success');
      await logAction({
        tableName: 'employee_applications',
        recordId: id,
        action: 'status_change',
        oldValue: prevStatus,
        newValue: newStatus,
      });
    }
    setSaving(false);
  }

  async function saveReviewerNotes(e) {
    e.preventDefault();
    setSavingNotes(true);
    const { error } = await supabase
      .from('employee_applications')
      .update({ reviewer_notes: reviewerNotes || null })
      .eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      setRecord((r) => ({ ...r, reviewer_notes: reviewerNotes || null }));
      showToast('Notes saved', 'success');
      await logAction({
        tableName: 'employee_applications',
        recordId: id,
        action: 'notes_update',
        note: 'Reviewer notes updated',
      });
    }
    setSavingNotes(false);
  }

  async function openDocument(doc) {
    setDocLoading(doc.id);
    try {
      const url = await getSignedDocumentUrl(doc.id, session.access_token);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      showToast('Could not open document: ' + err.message, 'error');
    } finally {
      setDocLoading(null);
    }
  }

  if (loadError) return (
    <div className="inline-error" style={{ margin: 40 }}>{loadError}</div>
  );
  if (!record) return <div className="loading-text">Loading…</div>;

  return (
    <div>
      <Toast {...toast} onHide={hideToast} />

      <Link to="/employee-applications" className="back-link">← Staff Applications</Link>

      <div className="detail-header">
        <div className="detail-header-left">
          <div className="eyebrow">Staff Application</div>
          <h1>{record.full_name}</h1>
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

      {/* ── Tab: Personal ── */}
      {activeTab === 'Personal' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-section-label">Personal Information</div>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="lbl">Position Applied</span>
                <span className="val">{record.position_applied.replace(/_/g, ' ')}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Date of Birth</span>
                <span className="val">{record.date_of_birth}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Gender</span>
                <span className="val">{record.gender || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Nationality</span>
                <span className="val">{record.nationality || '—'}</span>
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
                <span className="lbl">City</span>
                <span className="val">{record.city || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Address</span>
                <span className="val">{record.residential_address || '—'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-label">Emergency Contact</div>
            <div className="detail-panel-dark">
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="lbl">Name</span>
                  <span className="val">{record.emergency_contact_name}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Relationship</span>
                  <span className="val">{record.emergency_contact_relationship || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="lbl">Phone</span>
                  <span className="val">{record.emergency_contact_phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-label">Medical</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                background: record.medically_fit_to_work
                  ? 'rgba(47,107,70,0.08)'
                  : 'rgba(163,68,58,0.08)',
                border: `1px solid ${record.medically_fit_to_work
                  ? 'rgba(47,107,70,0.2)'
                  : 'rgba(163,68,58,0.2)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: record.medically_fit_to_work ? 'var(--status-approved)' : 'var(--maroon)',
              }}
            >
              <span>{record.medically_fit_to_work ? '✓' : '✕'}</span>
              {record.medically_fit_to_work
                ? 'Medically fit to work'
                : `Not fit to work${record.medical_explanation ? ` — ${record.medical_explanation}` : ''}`}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Experience ── */}
      {activeTab === 'Experience' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-section-label">Work Experience</div>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="lbl">Hospitality Experience</span>
                <span className="val">{record.has_hospitality_experience ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Years of Experience</span>
                <span className="val">{record.years_of_experience ?? '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Previous Company</span>
                <span className="val">{record.previous_company || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Previous Position</span>
                <span className="val">{record.previous_position || '—'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-label">Education</div>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="lbl">Highest Level</span>
                <span className="val">{record.highest_education_level || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">School / College</span>
                <span className="val">{record.school_or_college || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="lbl">Qualification</span>
                <span className="val">{record.qualification || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Availability ── */}
      {activeTab === 'Availability' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-section-label">Availability</div>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="lbl">Available Days</span>
                <span className="val">
                  {(record.available_days || []).length > 0
                    ? (record.available_days || [])
                        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                        .join(', ')
                    : '—'}
                </span>
              </div>
              <div className="detail-field">
                <span className="lbl">Preferred Shift</span>
                <span className="val">
                  {record.preferred_shift
                    ? record.preferred_shift.charAt(0).toUpperCase() + record.preferred_shift.slice(1)
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-label">Skills</div>
            {(record.skills || []).length > 0 ? (
              <div className="doc-list">
                {(record.skills || []).map((skill, i) => (
                  <span key={i} className="doc-chip">{skill}</span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                No skills listed.
              </p>
            )}
            {record.other_skill_note && (
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ink)' }}>
                {record.other_skill_note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Documents & Notes ── */}
      {activeTab === 'Documents & Notes' && (
        <div className="detail-card">
          <div className="detail-section">
            <div className="detail-section-label">Uploaded Documents</div>
            {documents.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                No documents uploaded.
              </p>
            ) : (
              <div className="doc-list">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    className="doc-chip"
                    onClick={() => openDocument(doc)}
                    disabled={docLoading === doc.id}
                    aria-label={`Open ${doc.document_type.replace(/_/g, ' ')}`}
                  >
                    {docLoading === doc.id ? (
                      <>
                        <span style={{ opacity: 0.6 }}>⟳</span> Loading…
                      </>
                    ) : (
                      <>
                        <span>↗</span> {doc.document_type.replace(/_/g, ' ')}
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-section">
            <div className="detail-section-label">Reviewer Notes</div>
            <form onSubmit={saveReviewerNotes}>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Add internal notes about this applicant…"
                rows={5}
                className="field-input"
                style={{ resize: 'vertical', marginBottom: 12 }}
                aria-label="Reviewer notes"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingNotes}
              >
                {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
