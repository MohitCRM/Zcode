import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";

export default function ShowallUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async (currentPage) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/user/admin/showallusers?page=${currentPage}&limit=10`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const toggleAdmin = async (userId, currentRole) => {
    try {
      if (currentRole === "admin") {
        await axiosClient.put("/user/admin/removeadmin", { targetUserId: userId });
      } else {
        await axiosClient.put("/user/admin/makeadmin", { targetUserId: userId });
      }
      fetchUsers(page);
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.error || err.message));
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await axiosClient.delete(`/admin/deleteuser/${userId}`);
      fetchUsers(page);
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading && users.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading users...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-400">{error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
      </div>
      
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl py-4">
        {/* Table Header (Optional, but good for context) */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="w-48">User</div>
          <div className="w-24 text-center">Solved</div>
          <div className="w-32 text-center">Joined</div>
          <div className="w-24 text-center">Role</div>
          <div className="w-56 text-right">Actions</div>
        </div>

        {/* User Rows */}
        <div className="flex flex-col">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between py-4 px-8 border-b border-slate-800/30 hover:bg-[#121826]/60 transition-all group">
              
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 w-48">
                <div className="w-10 h-10 rounded-full bg-indigo-900/40 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/20 shrink-0">
                  {user.firstName.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-200 truncate">{user.firstName}</span>
              </div>
              
              {/* Problems Solved */}
              <div className="text-indigo-400 font-bold text-sm w-24 text-center">
                {user.problemsolved?.length || 0}
              </div>

              {/* Joined Date */}
              <div className="text-slate-400 text-sm w-32 text-center">
                {new Date(user.createdAt).toLocaleDateString('en-GB')}
              </div>

              {/* Role */}
              <div className={`text-xs font-bold uppercase tracking-wider w-24 text-center ${
                user.role === 'admin' ? 'text-emerald-500' : 
                user.role === 'guest' ? 'text-amber-500' : 'text-slate-500'
              }`}>
                {user.role}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-56 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleAdmin(user._id, user.role)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors border border-indigo-500/20 whitespace-nowrap"
                >
                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20 whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="py-12 text-center text-slate-500">No users found.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-8 pt-4 border-t border-slate-800/50">
            <span className="text-sm text-slate-400">
              Page <span className="text-white font-medium">{pagination.currentPage}</span> of <span className="text-white font-medium">{pagination.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg bg-[#121826] hover:bg-[#1E293B] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors border border-slate-800"
              >
                Previous
              </button>
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg bg-[#121826] hover:bg-[#1E293B] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors border border-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}