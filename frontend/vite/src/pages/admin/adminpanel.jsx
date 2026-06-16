import { NavLink, Outlet } from "react-router-dom";

export default function AdminPanel() {
  // A helper function for cleaner link styling
  const linkClass = ({ isActive }) =>
    isActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white";

  return (
    <div className="flex min-h-screen bg-[#090D16] text-slate-200">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-white">Admin Panel</h2>
        
        <nav className="flex flex-col gap-6">
          {/* Problem Management */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Problems</h3>
            <div className="flex flex-col gap-2 pl-2">
              <NavLink to="create-problem" className={linkClass}>Create Problem</NavLink>
              <NavLink to="update-problem/all" className={linkClass}>Update Problem</NavLink>
              <NavLink to="delete-problem/all" className={linkClass}>Delete Problem</NavLink>
            </div>
          </div>

          {/* Announcement Management */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Announcements</h3>
            <div className="flex flex-col gap-2 pl-2">
              <NavLink to="create-announcement" className={linkClass}>Create Announcement</NavLink>
              <NavLink to="update-announcement/all" className={linkClass}>Update Announcement</NavLink>
              <NavLink to="delete-announcement/all" className={linkClass}>Delete Announcement</NavLink>
            </div>
          </div>

          {/* Season Management */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Seasons</h3>
            <div className="flex flex-col gap-2 pl-2">
              <NavLink to="create-season" className={linkClass}>Create Season</NavLink>
              <NavLink to="update-season/all" className={linkClass}>Update Season</NavLink>
              <NavLink to="delete-season/all" className={linkClass}>Delete Season</NavLink>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        {/* The Outlet renders the child route components defined in App.jsx */}
        <Outlet />
      </main>
    </div>
  );
}