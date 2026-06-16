import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from "../slicers/authslice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0C1220]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
        
        {/* Logo Section */}
        <Link to="/announcements" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Zcode</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link to="/problems" className="hover:text-white transition-colors">Problems</Link>
          <Link to="/standings" className="hover:text-white transition-colors">Standings</Link>
          <Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link>
          <Link to="/userRank" className="hover:text-white transition-colors">Elo</Link>
        </div>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 rounded-xl py-1.5 px-3 bg-[#121826] border border-slate-800/60 hover:border-slate-700 hover:bg-[#161F30] transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-950 text-sm font-semibold text-indigo-300 border border-indigo-500/30">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="text-sm font-medium text-slate-300">{user?.firstName} {user?.lastName}</span>
            <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-[#0C1220] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <Link to="/userprofile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#161F30] transition-colors">
                My Profile
              </Link>
              <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#161F30] transition-colors">
                Admin
              </Link>
              <div className="my-1 border-t border-slate-800"></div>
              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/30 transition-colors">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;