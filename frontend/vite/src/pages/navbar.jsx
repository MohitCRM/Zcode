import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser,ExitUser } from "../slicers/authslice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExit = async ()=>{
    try{
      setIsExiting(true);
      await dispatch(ExitUser()).unwrap();
      navigate('/');
    }catch(err)
    {
      console.error("Exit failed: ",err);
    }finally{
      setIsExiting(false);
    }
  }
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0C1220]/90 backdrop-blur-md sticky top-0 z-50 select-none">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">

        {/* Logo Section - Points directly to layout base root */}
        <div className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-mono">Zcode</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400 font-mono uppercase tracking-wider text-[13px]">
          <Link to="/dashboard/" className="hover:text-white transition-colors">Announcements</Link>
          <Link to="/dashboard/problems" className="hover:text-white transition-colors">Problems</Link>
          <Link to="/dashboard/standings" className="hover:text-white transition-colors">Standings</Link>
          <Link to="/dashboard/solutions" className="hover:text-white transition-colors">Solutions</Link>
          {/* Aligned path parameter with App.jsx -> path="user-rank" */}
          <Link to="/dashboard/user-rank" className="hover:text-white transition-colors">Elo</Link>
        </div>

        <div className="flex items-center gap-4">
          {user?.role && (
            <span className={`hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${
              user.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
              user.role === 'guest' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
              'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}>
              {user.role}
            </span>
          )}
          {/* User Account Menu Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 rounded-xl py-1.5 px-3 bg-[#121826] border border-slate-800/60 hover:border-slate-700 hover:bg-[#161F30] transition-all focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-950 text-sm font-semibold text-indigo-300 border border-indigo-500/30 uppercase">
                {user?.firstName?.[0]}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">{user?.firstName}</span>
            <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* User Options Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-[#0C1220] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-mono text-xs uppercase tracking-wide">
              {/* Aligned path parameter with App.jsx -> path="profile" */}
              <Link to="/dashboard/profile" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-[#161F30] transition-colors">
                My Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/dashboard/admin" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-[#161F30] transition-colors">
                  Admin Panel
                </Link>
              )}
              {user?.role === 'guest' && (
                <Link to="/dashboard/guestpowers" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-[#161F30] transition-colors">
                  Guest Panel
                </Link>
              )}
              <div className="my-1 border-t border-slate-800"></div>
              {user?.role === 'guest' ? (
                <button
                  onClick={handleExit}
                  disabled={isExiting}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 font-bold text-left transition-colors ${
                    isExiting ? 'text-amber-400/50 cursor-not-allowed' : 'text-amber-400 hover:bg-amber-950/20'
                  }`}
                >
                  {isExiting ? 'Exiting...' : 'Exit Guest Mode'}
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 font-bold text-rose-400 hover:bg-rose-950/20 transition-colors text-left"
                >
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;