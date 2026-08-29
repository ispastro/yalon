import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function useCounts() {
  const [counts, setCounts] = useState({ customer: null, employee: null });

  useEffect(() => {
    supabase
      .from('customer_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .then(({ count }) =>
        setCounts((c) => ({ ...c, customer: count ?? 0 }))
      );

    supabase
      .from('employee_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .then(({ count }) =>
        setCounts((c) => ({ ...c, employee: count ?? 0 }))
      );
  }, []);

  return counts;
}

export default function Sidebar() {
  const { signOut, session } = useAuth();
  const counts = useCounts();

  const email = session?.user?.email ?? '';
  const initial = email ? email[0].toUpperCase() : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">YALON</div>
        <div className="sidebar-tag">Staff Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Inbox</div>

        <NavLink
          to="/customer-requests"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span>Customer Requests</span>
          {counts.customer !== null && counts.customer > 0 && (
            <span className="sidebar-count">{counts.customer}</span>
          )}
        </NavLink>

        <NavLink
          to="/employee-applications"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span>Staff Applications</span>
          {counts.employee !== null && counts.employee > 0 && (
            <span className="sidebar-count">{counts.employee}</span>
          )}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-email">{email}</div>
        </div>
        <button className="sidebar-logout" onClick={signOut}>Sign out</button>
      </div>
    </aside>
  );
}
