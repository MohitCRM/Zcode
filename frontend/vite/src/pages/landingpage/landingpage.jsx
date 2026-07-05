import { Link } from "react-router-dom"; // Updated to match your app router package
import { Trophy, Zap, Target, Calendar, Shield, Star } from "lucide-react";
import { useDispatch,useSelector } from "react-redux";
export default function Landingpage() {
  const dispatch = useDispatch()
  const { data: season, loading } = useSelector((state) => state.season);

  const ranks = [
    { name: "Newbie", color: "text-zinc-400", bg: "bg-zinc-900/60" },
    { name: "Adept", color: "text-green-400", bg: "bg-green-950/40" },
    { name: "Expert", color: "text-blue-400", bg: "bg-blue-950/40" },
    { name: "Honoured One", color: "text-purple-400", bg: "bg-purple-950/40" },
    { name: "Monarch", color: "text-yellow-400", bg: "bg-yellow-950/40" },
    { name: "God", color: "text-cyan-400", bg: "bg-cyan-950/40" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Elo-Based Ranking",
      desc: "Gain or lose Elo with every submission. Think before you submit — wrong answers cost you.",
    },
    {
      icon: Calendar,
      title: "30-Day Seasons",
      desc: "Two competitive rounds per season with daily problem unlocks. Solve on release day for bonus Elo.",
    },
    {
      icon: Target,
      title: "Accuracy Matters",
      desc: "Submission accuracy is tracked. Higher ranks require both Elo and consistency.",
    },
    {
      icon: Trophy,
      title: "Global Leaderboard",
      desc: "Compete against everyone. Only players above the Elo threshold appear on the public board.",
    },
    {
      icon: Shield,
      title: "Editorial System",
      desc: "Editorials release after each round. Learn from the best solutions and sharpen your skills.",
    },
    {
      icon: Star,
      title: "Unique Ranks",
      desc: "Climb from Newbie to God. The top rank is exceptionally rare — only near-perfect performers reach it.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070C15] text-slate-200 antialiased flex flex-col selection:bg-indigo-500/30">
      {/* Background Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

      <nav className="border-b border-slate-800/80 bg-[#0B111E]/40 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-600/20">
            Z
          </div>
          <span className="font-mono text-xl font-bold tracking-tight text-white">Zcode</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/guest-login">
            <button className="px-4 py-2 text-sm font-mono uppercase tracking-wider text-emerald-500/80 hover:text-emerald-400 transition-colors cursor-pointer">
              Guest
            </button>
          </Link>
          <Link to="/login">
            <button className="px-4 py-2 text-sm font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer">
              Log in
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-4 py-2 text-sm bg-indigo-600 text-white font-mono uppercase tracking-widest rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all cursor-pointer">
              Sign up
            </button>
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative z-10">
        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white uppercase">
            Code. Compete.{" "}
            <span className="text-indigo-500">Climb.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
            A seasonal Elo-based competitive coding platform where every submission carries weight.
            Think before you submit.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all cursor-pointer w-full">
                Start competing
              </button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button className="px-8 py-3 bg-[#0B111E] border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-xl font-mono font-bold uppercase tracking-widest text-sm transition-all cursor-pointer w-full">
                Log in
              </button>
            </Link>
            <Link to="/guest-login" className="w-full sm:w-auto">
              <button className="px-8 py-3 bg-[#041611]/40 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 rounded-xl font-mono font-bold uppercase tracking-widest text-sm transition-all cursor-pointer w-full shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                Guest Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-slate-800/60 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xs font-mono text-slate-500 uppercase tracking-widest mb-8">
            Rank Progression
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {ranks.map((rank, i) => (
              <div
                key={rank.name}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800/80 bg-[#0B111E]/40 backdrop-blur-sm text-sm font-medium`}
              >
                <span className="text-slate-600 font-mono text-xs">#{i + 1}</span>
                <span className={`${rank.color} font-mono uppercase tracking-wide text-xs font-bold`}>{rank.name}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 font-mono text-xs mt-6">
            <span className="text-cyan-400 font-bold">GOD</span> rank requires exceptional Elo, accuracy, and season participation. Less than 1% of players will reach it.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-slate-800/60 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black uppercase text-white tracking-wide text-center mb-3">Built for competitors</h2>
          <p className="text-center text-slate-400 text-sm mb-12 max-w-lg mx-auto">
            Not another practice platform. Zcode is a ranked arena where consistency and precision are rewarded.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-slate-800/80 bg-[#0B111E]/30 hover:border-indigo-500/30 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <f.icon className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-white mb-1.5 font-mono uppercase text-sm tracking-wide">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-slate-800/60 bg-[#0C1220]/20 relative z-10">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-wide">Ready to compete?</h2>
          <p className="text-slate-400 text-sm">
            Join the current season. Solve problems, earn Elo, and claim your rank.
          </p>
          <Link to="/signup">
            <button className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all cursor-pointer">
              Create your account
            </button>
          </Link>
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login">
              <span className="text-indigo-400 hover:text-indigo-300 font-bold font-mono uppercase tracking-wider ml-1 transition-colors">Log in</span>
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 px-6 py-6 flex items-center justify-between text-xs text-slate-500 relative z-10 bg-[#070C15]">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-[10px]">
            Z
          </div>
          <span className="font-mono font-bold text-slate-400 tracking-wider">ZCODE</span>
        </div>
        <p className="font-mono tracking-wide uppercase text-[10px] text-slate-600">Seasonal Elo-Based Competitive Coding</p>
      </footer>
    </div>
  );
}