import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import CustomerRequests from './pages/CustomerRequests';
import CustomerRequestDetail from './pages/CustomerRequestDetail';
import EmployeeApplications from './pages/EmployeeApplications';
import EmployeeApplicationDetail from './pages/EmployeeApplicationDetail';

function ProtectedShell() {
  const { session, isStaff, loading, signOut } = useAuth();

  if (loading) return <div className="loading-text" style={{ padding: 40 }}>Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  if (!isStaff) {
    return (
      <div style={{ padding: 60, maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Access restricted</div>
        <p>This account isn't set up with staff access. Contact an administrator to assign the staff role, or sign in with a different account.</p>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/customer-requests" replace />} />
          <Route path="/customer-requests" element={<CustomerRequests />} />
          <Route path="/customer-requests/:id" element={<CustomerRequestDetail />} />
          <Route path="/employee-applications" element={<EmployeeApplications />} />
          <Route path="/employee-applications/:id" element={<EmployeeApplicationDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!loading && session ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}
