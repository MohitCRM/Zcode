import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../slicers/authslice";

// Schema for login form validation remains unchanged
const loginschema = z.object({
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

export default function Login() {
  const [showPassword, setshowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isauth } = useSelector((state) => state.auth);

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
    dispatch(loginUser(data));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090D16] font-sans text-slate-200 antialiased selection:bg-indigo-500/30 overflow-x-hidden px-4 py-12">
      {/* Background Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-800/80 bg-[#121826]/70 backdrop-blur-md px-8 py-10 shadow-2xl shadow-black/40">
        
        {/* Zcode Corporate Branding Head */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8 select-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome back to Zcode
          </h1>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Log in to submit code, secure your streak, and defend your Elo ranking.
          </p>
        </div>

        <form className="flex flex-col gap-y-5" onSubmit={handleSubmit(onsubmit)}>
          
          {/* Email Field */}
          <div className="flex flex-col gap-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              {...register("emailId")}
              type="email"
              placeholder="Enter your Email"
              className="w-full rounded-xl border border-slate-800 bg-[#0C1220]/60 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all hover:border-slate-700 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10"
            />
            {errors.emailId && (
              <span className="text-xs font-medium text-rose-400 mt-0.5 flex items-center gap-1">
                ⚠️ {errors.emailId.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                className="w-full rounded-xl border border-slate-800 bg-[#0C1220]/60 px-3.5 py-2.5 pr-11 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all hover:border-slate-700 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10"
              />
              <button
                type="button"
                onClick={() => setshowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs font-medium text-rose-400 mt-0.5 flex items-center gap-1">
                ⚠️ {errors.password.message}
              </span>
            )}
          </div>

          {/* Glowing CTA Button */}
          <div className="mt-4 flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Authenticating..." : "Log in"}
            </button>
          </div>
        </form>

        {/* Footer Navigation Link */}
        <div className="mt-8 border-t border-slate-800/60 pt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}