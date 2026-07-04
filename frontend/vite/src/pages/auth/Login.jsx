import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../slicers/authslice";
import { getcurrentseason } from "../../slicers/seasonslice";

// Schema for login form validation
const loginschema = z.object({
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

export default function Login() {
  const [showPassword, setshowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isauth, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginschema) });

  useEffect(() => {
    if (isauth) {
      navigate("/");
    }
  }, [isauth, navigate]);

  const onsubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap()
      .then(() => {
        dispatch(getcurrentseason());
      });
  };

  return (
    <div className="bg-[#070C15] min-h-screen text-slate-200 antialiased relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Dynamic Background Matrix Overlay Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

      {/* Main Container Split-Panel (Matches your handwritten notebook layout structure) */}
      <div className="w-full max-w-4xl bg-[#0B111E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 min-h-[460px]">
        
        {/* LEFT PANEL: Form Inputs / Interaction Column */}
        <form onSubmit={handleSubmit(onsubmit)} className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-[#0C1220]/40 space-y-5">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl font-black uppercase tracking-wider text-white">Login</h3>
            <p className="text-slate-500 font-mono text-[11px]">VERIFY SECURITY ENCRYPTED TOKEN ACCESS</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-mono flex items-start gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Input Email field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email Address</label>
              <input 
                {...register("emailId")}
                type="email" 
                placeholder="xyz@gmail.com"
                className="w-full bg-[#070C15] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
              />
              {errors.emailId && (
                <span className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  ⚠️ {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Input Password field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Password</label>
              <div className="relative">
                <input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070C15] border border-slate-800 rounded-xl px-4 py-2.5 pr-11 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setshowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" defaultChecked={false} stroke="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  ⚠️ {errors.password.message}
                </span>
              )}
            </div>
          </div>

          {/* Form Action Button Placement */}
          <div className="pt-2 flex justify-center md:justify-start">
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </div>
        </form>

        {/* RIGHT PANEL: Welcome Back Promotional CTA Hero Panel */}
        <div className="w-full md:w-1/2 p-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#0B111E] to-[#070C15] flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-slate-800/60">
          <div className="space-y-5 max-w-sm flex flex-col items-center">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white font-sans tracking-tight">
              Welcome back to Zcode
            </h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Log in to submit code, secure your streak, and defend your elo ranking.
            </p>
            
            {/* Footer Navigation Link */}
            <div className="pt-4 text-xs text-slate-500 font-medium">
              Don't have an account?{" "}
              <Link 
                to="/signup"
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors font-mono uppercase tracking-wide ml-1 underline underline-offset-4"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}