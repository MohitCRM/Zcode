import { Outlet, Link } from 'react-router-dom';

export default function AdminPanel() {
  return (
    <div className="flex">
      <nav className="w-64 bg-slate-900 h-screen">
        <Link to="/admin">Dashboard Overview</Link>
        <Link to="create-problem">Create Problem</Link>
        <Link to="create-announcement">Create Announcement</Link>
      </nav>
      <main className="flex-1 p-6">
        <Outlet /> 
      </main>
    </div>
  );
}