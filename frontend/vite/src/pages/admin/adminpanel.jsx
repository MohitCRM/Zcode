import { NavLink, Outlet } from "react-router-dom";

export default function AdminPanel() {
  // Helper for active link styling
  const navClass = ({ isActive }) =>
    `px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-medium ${
      isActive 
        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
        : "text-slate-400 hover:bg-[#121826] hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-[#090D16] text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-8 px-2">Admin Dashboard</h2>
        
        <nav className="flex flex-col gap-2">
          <NavLink to="showallproblems" className={navClass}>
            <span>⚙️</span> Problems
          </NavLink>
          <NavLink to="showallannouncements" className={navClass}>
            <span>📢</span> Announcements
          </NavLink>
          <NavLink to="showallseasons" className={navClass}>
            <span>📅</span> Seasons
          </NavLink>
          <NavLink to="showallusers" className={navClass}>
            <span>👥</span> Users
          </NavLink>

            <NavLink to="settime" className={navClass}>
                <span>📅</span> Set Time
            </NavLink>
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}