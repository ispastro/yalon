import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';

const FILTERS = ['all', 'submitted', 'under_review', 'approved', 'rejected', 'on_hold'];

const SKELETON_COUNT = 6;

function SkeletonRows() {
  return Array.from({ length: SKELETON_COUNT }).map((_, i) => (
    <tr key={i} className="skeleton-row">
      <td><div className="skeleton-cell" style={{ width: '55%' }} /></td>
      <td><div className="skeleton-cell" style={{ width: '60%' }} /></td>
      <td><div className="skeleton-cell" style={{ width: '45%' }} /></td>
      <td><div className="skeleton-cell" style={{ width: '70px' }} /></td>
      <td><div className="skeleton-cell" style={{ width: '80px' }} /></td>
    </tr>
  ));
}

export default function EmployeeApplications() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setRows(null);
    setError('');

    let query = supabase
      .from('employee_applications')
      .select('id, full_name, position_applied, phone_number, status, created_at')
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);

    query.then(({ data, error }) => {
      if (error) setError(error.message);
      else setRows(data ?? []);
    });
  }, [filter]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.position_applied.toLowerCase().includes(q) ||
        r.phone_number.includes(q)
    );
  }, [rows, search]);

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Operations</div>
        <h1>Staff Applications</h1>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="search-input"
            type="search"
            placeholder="Search name, position, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
          />
        </div>

        <div className="filter-bar">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="inline-error" role="alert">{error}</div>}

      {filtered !== null && (
        <p className="result-count">
          {filtered.length} {filtered.length === 1 ? 'application' : 'applications'}
        </p>
      )}

      {filtered === null ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody><SkeletonRows /></tbody>
        </table>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          No applications match this filter.
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} onClick={() => navigate(`/employee-applications/${r.id}`)}>
                <td style={{ fontWeight: 500 }}>{r.full_name}</td>
                <td>{r.position_applied.replace(/_/g, ' ')}</td>
                <td>{r.phone_number}</td>
                <td><StatusBadge status={r.status} /></td>
                <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
