const COLORS = {
  submitted: 'var(--status-submitted)',
  under_review: 'var(--status-review)',
  quoted: 'var(--status-review)',
  approved: 'var(--status-approved)',
  advance_paid: 'var(--status-approved)',
  confirmed: 'var(--status-confirmed)',
  completed: 'var(--status-confirmed)',
  rejected: 'var(--status-rejected)',
  cancelled: 'var(--status-rejected)',
  on_hold: 'var(--status-submitted)',
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || 'var(--status-submitted)';
  return (
    <span className="status-badge" style={{ backgroundColor: color }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
