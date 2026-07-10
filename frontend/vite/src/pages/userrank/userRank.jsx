import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "../../utils/axiosClient";
const RANKS = [
  {
    id: 1, name: "Newbie", tagline: "Everyone starts somewhere.",
    color: "#94a3b8", borderColor: "rgba(148,163,184,0.5)", glowColor: "rgba(148,163,184,0.6)", textColor: "#94a3b8",
    minElo: 0, rarity: "All players", cx: 9, cy: 62,
    getRequirements: (stats) => [
      { label: "Elo required", value: "0+", met: stats.elo >= 0 },
      { label: "Accuracy", value: "None", met: true },
      // { label: "Check-ins", value: "None", met: true },
    ],
  },
  {
    id: 2, name: "Adept", tagline: "You're finding your footing.",
    color: "#10b981", borderColor: "rgba(16,185,129,0.5)", glowColor: "rgba(16,185,129,0.6)", textColor: "#34d399",
    minElo: 400, rarity: "~60% of players", cx: 24, cy: 38,
    getRequirements: (stats) => [
      { label: "Elo required", value: "400+", met: stats.elo >= 400 },
      { label: "Accuracy", value: "None", met: true },
      // { label: "Check-ins", value: "None", met: true },
    ],
  },
  {
    id: 3, name: "Expert", tagline: "You solve what others skip.",
    color: "#6366f1", borderColor: "rgba(99,102,241,0.5)", glowColor: "rgba(99,102,241,0.6)", textColor: "#818cf8",
    minElo: 900, rarity: "~25% of players", cx: 42, cy: 55,
    getRequirements: (stats) => [
      { label: "Elo required", value: "900+", met: stats.elo >= 900 },
      { label: "Accuracy", value: "None", met: true },
      // { label: "Check-ins", value: "None", met: true },
    ],
  },
  {
    id: 4, name: "Honoured One", tagline: "Respected by the community.",
    color: "#a855f7", borderColor: "rgba(168,85,247,0.5)", glowColor: "rgba(168,85,247,0.6)", textColor: "#c084fc",
    minElo: 1500, rarity: "~10% of players", cx: 58, cy: 20,
    getRequirements: (stats) => [
      { label: "Elo required", value: "1500+", met: stats.elo >= 1500 },
      { label: "Accuracy", value: "None", met: true },
      // { label: "Check-ins", value: "None", met: true },
    ],
  },
  {
    id: 5, name: "Monarch", tagline: "Consistency is your crown.",
    color: "#d97706", borderColor: "rgba(217,119,6,0.5)", glowColor: "rgba(217,119,6,0.6)", textColor: "#fbbf24",
    minElo: 2200, rarity: "~3% of players", cx: 74, cy: 45,
    getRequirements: (stats) => [
      { label: "Elo required", value: "2200+", met: stats.elo >= 2200 },
      { label: "Accuracy", value: "> 85%", met: stats.accuracy > 85 },
      // { label: "Season check-ins", value: "10+ days", met: stats.seasonCheckIns >= 10 },
    ],
  },
  {
    id: 6, name: "God", tagline: "Near-perfect performance only.",
    color: "#06b6d4", borderColor: "rgba(6,182,212,0.5)", glowColor: "rgba(6,182,212,0.6)", textColor: "#22d3ee",
    minElo: 3500, rarity: "< 1% of players", cx: 90, cy: 10,
    getRequirements: (stats) => [
      { label: "Elo required", value: "3500+", met: stats.elo >= 3500 },
      { label: "Accuracy", value: "> 95%", met: stats.accuracy > 95 },
      // { label: "Season check-ins", value: "25+ days", met: stats.seasonCheckIns >= 25 },
      { label: "Season problems", value: "35+", met: stats.problemsSolved >= 35 },
    ],
  },
];

function StarField() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.45,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

function MouseTooltip({ tooltip, userStats, currentRankIdx }) {
  if (!tooltip || !tooltip.rank) return null;
  const rank = tooltip.rank;
  const isUnlocked = userStats.elo >= rank.minElo;
  const isActive = rank.id - 1 === currentRankIdx;

  const dynamicRequirements = rank.getRequirements(userStats);

  const tooltipWidth = 256;
  const nearRightEdge = tooltip.x + tooltipWidth + 28 > window.innerWidth;
  const left = nearRightEdge ? tooltip.x - tooltipWidth - 18 : tooltip.x + 18;

  return (
    <div className="fixed z-[9999] pointer-events-none transition-all duration-75 ease-out" style={{ left, top: tooltip.y - 20 }}>
      <div className="rounded-2xl p-4 shadow-2xl border w-64 backdrop-blur-sm"
        style={{
          background: "linear-gradient(135deg, rgba(9,13,22,0.98), rgba(15,20,35,0.98))",
          borderColor: rank.borderColor,
          boxShadow: `0 0 40px -8px ${rank.glowColor}, 0 25px 60px rgba(0,0,0,0.7)`,
        }}
      >
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: rank.textColor, opacity: 0.65 }}>
              Rank #{rank.id}
            </div>
            <div className="text-base font-extrabold leading-tight" style={{ color: rank.textColor }}>
              {rank.name}
              {isActive && (
                <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider align-middle"
                  style={{ background: `${rank.color}25`, color: rank.textColor, border: `1px solid ${rank.borderColor}` }}
                >
                  Current
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 whitespace-nowrap"
            style={{ background: "rgba(15,23,42,0.8)", color: "#64748b", border: "1px solid rgba(30,41,59,0.6)" }}
          >
            {rank.rarity}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic mb-3 leading-relaxed">&ldquo;{rank.tagline}&rdquo;</p>
        
        <div className="space-y-1.5 mb-3">
          {dynamicRequirements.map((req) => (
            <div key={req.label} className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{req.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold" style={{ color: isUnlocked ? rank.textColor : "#64748b" }}>{req.value}</span>
                <span className={`text-xs font-bold ${req.met ? "text-emerald-400" : "text-rose-400"}`}>
                  {req.met ? "✓" : "✗"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2.5 border-t" style={{ borderColor: "rgba(30,41,59,0.6)" }}>
          <div className="flex justify-between text-[10px] mb-1" style={{ color: "#475569" }}>
            <span>Elo threshold</span>
            <span style={{ color: rank.textColor, fontWeight: 700 }}>
              {rank.minElo === 0 ? "Starter" : `${rank.minElo.toLocaleString()}+ Elo`}
            </span>
          </div>
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ background: rank.color, boxShadow: `0 0 6px ${rank.glowColor}` }} />
              <span className="text-[10px] font-semibold" style={{ color: rank.textColor }}>Unlocked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-[10px] font-medium text-slate-600">
                {rank.minElo - userStats.elo > 0 ? `${(rank.minElo - userStats.elo).toLocaleString()} Elo away` : "Locked"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function Star4({ cx, cy, size: s, color }) {
  return (
    <g>
      <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={cx - s * .5} y1={cy - s * .5} x2={cx + s * .5} y2={cy + s * .5} stroke={color} strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      <line x1={cx + s * .5} y1={cy - s * .5} x2={cx - s * .5} y2={cy + s * .5} stroke={color} strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      <circle cx={cx} cy={cy} r={2} fill={color} />
    </g>
  );
}
function Star4Double({ cx, cy, size, color }) {
  return <g><Star4 cx={cx - size * .55} cy={cy} size={size * .75} color={color} /><Star4 cx={cx + size * .55} cy={cy} size={size * .75} color={color} /></g>;
}
function Star4Triple({ cx, cy, size, color }) {
  return <g><Star4 cx={cx - size * .7} cy={cy} size={size * .65} color={color} /><Star4 cx={cx} cy={cy} size={size * .65} color={color} /><Star4 cx={cx + size * .7} cy={cy} size={size * .65} color={color} /></g>;
}
function Star4Quad({ cx, cy, size, color }) {
  return <g>
    <Star4 cx={cx - size * .6} cy={cy - size * .3} size={size * .6} color={color} />
    <Star4 cx={cx + size * .6} cy={cy - size * .3} size={size * .6} color={color} />
    <Star4 cx={cx - size * .6} cy={cy + size * .3} size={size * .6} color={color} />
    <Star4 cx={cx + size * .6} cy={cy + size * .3} size={size * .6} color={color} />
  </g>;
}
function Crown({ cx, cy, size, color }) {
  const s = size * 1.15;
  const baseY = cy + s * 0.55, baseLeft = cx - s, baseRight = cx + s, baseH = s * 0.28;
  const crownPath = [
    `M ${baseLeft} ${baseY}`,
    `L ${baseLeft} ${cy - s * 0.1}`,
    `L ${cx - s * 0.38} ${cy + s * 0.15}`,
    `L ${cx} ${cy - s * 0.75}`,
    `L ${cx + s * 0.38} ${cy + s * 0.15}`,
    `L ${baseRight} ${cy - s * 0.1}`,
    `L ${baseRight} ${baseY}`, `Z`,
  ].join(" ");
  return (
    <g>
      <path d={crownPath} fill={`${color}22`} stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <rect x={baseLeft} y={baseY - baseH} width={s * 2} height={baseH} rx={1.5} fill={`${color}33`} stroke={color} strokeWidth={1.4} />
      <circle cx={cx} cy={cy - s * 0.75} r={2.2} fill={color} />
      <circle cx={cx - s * 0.38} cy={cy + s * 0.15} r={1.6} fill={color} />
      <circle cx={cx + s * 0.38} cy={cy + s * 0.15} r={1.6} fill={color} />
      <circle cx={baseLeft} cy={cy - s * 0.1} r={1.4} fill={color} />
      <circle cx={baseRight} cy={cy - s * 0.1} r={1.4} fill={color} />
    </g>
  );
}
function KanjiGod({ cx, cy, size, color }) {
  const s = size * 2.2;
  return (
    <text x={cx} y={cy + s * 0.38} textAnchor="middle" fontSize={s} fontFamily="serif" fill={color}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
      神
    </text>
  );
}
function StarShape({ cx, cy, size, color, rank }) {
  const icons = [
    <Star4 key="s" cx={cx} cy={cy} size={size} color={color} />,
    <Star4Double key="s" cx={cx} cy={cy} size={size} color={color} />,
    <Star4Triple key="s" cx={cx} cy={cy} size={size} color={color} />,
    <Star4Quad key="s" cx={cx} cy={cy} size={size} color={color} />,
    <Crown key="s" cx={cx} cy={cy} size={size} color={color} />,
    <KanjiGod key="s" cx={cx} cy={cy} size={size} color={color} />,
  ];
  return icons[rank] ?? null;
}


function ConstellationMap({ onHover, currentElo, currentRankIdx }) {
  const svgRef = useRef(null);
  const W = 900, H = 260, pad = 44;
  const nodeX = (cx) => pad + (cx / 100) * (W - pad * 2);
  const nodeY = (cy) => pad + (cy / 100) * (H - pad * 2);
  const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible select-none">
      <defs>
        {RANKS.map((rank) => (
          <radialGradient key={`glow-${rank.id}`} id={`glow-${rank.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={rank.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={rank.color} stopOpacity="0" />
          </radialGradient>
        ))}
        {connections.map(([a, b]) => {
          const ra = RANKS[a], rb = RANKS[b], unlocked = currentElo >= rb.minElo;
          return (
            <linearGradient key={`line-${a}-${b}`} id={`line-${a}-${b}`}
              x1={nodeX(ra.cx)} y1={nodeY(ra.cy)} x2={nodeX(rb.cx)} y2={nodeY(rb.cy)} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={ra.color} stopOpacity={unlocked ? 0.9 : 0.2} />
              <stop offset="100%" stopColor={rb.color} stopOpacity={unlocked ? 0.9 : 0.15} />
            </linearGradient>
          );
        })}
      </defs>

      {connections.map(([a, b]) => {
        const ra = RANKS[a], rb = RANKS[b], unlocked = currentElo >= rb.minElo;
        const x1 = nodeX(ra.cx), y1 = nodeY(ra.cy), x2 = nodeX(rb.cx), y2 = nodeY(rb.cy);
        return (
          <g key={`conn-${a}-${b}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={unlocked ? `url(#line-${a}-${b})` : "rgba(30,41,59,0.3)"}
              strokeWidth={unlocked ? 1.5 : 1} strokeLinecap="round" />
            {unlocked && <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={`url(#line-${a}-${b})`} strokeWidth={3.5} strokeLinecap="round" opacity={0.15} />}
          </g>
        );
      })}

      {RANKS.map((rank, i) => {
        const x = nodeX(rank.cx), y = nodeY(rank.cy);
        const isUnlocked = currentElo >= rank.minElo;
        const isActive = i === currentRankIdx;
        const r = isActive ? 18 : 14;
        return (
          <g key={rank.id} className="cursor-pointer group/node"
            onMouseEnter={(e) => onHover(rank, e.clientX, e.clientY)}
            onMouseMove={(e) => onHover(rank, e.clientX, e.clientY)}
            onMouseLeave={() => onHover(null, 0, 0)}>
            {isUnlocked && <>
              <circle cx={x} cy={y} r={r + 22} fill={`url(#glow-${rank.id})`} opacity={isActive ? 0.7 : 0.45} />
              <circle cx={x} cy={y} r={r + 8} fill={`url(#glow-${rank.id})`} opacity={0.5} />
            </>}
            <circle cx={x} cy={y} r={r + 10} fill="transparent" />
            <circle cx={x} cy={y} r={r}
              fill={isUnlocked ? "rgba(9,13,22,0.95)" : "rgba(9,13,22,0.6)"}
              stroke={isUnlocked ? rank.color : "rgba(30,41,59,0.5)"}
              strokeWidth={isActive ? 2 : 1.5} opacity={isUnlocked ? 1 : 0.4}
              className="transition-colors duration-200" />
            <g opacity={isUnlocked ? 1 : 0.35}>
              <StarShape cx={x} cy={y} size={r * 0.55} color={rank.color} rank={i} />
            </g>
            {isActive && <circle cx={x} cy={y} r={r + 4} fill="none" stroke={rank.color}
              strokeWidth={1} opacity={0.5} strokeDasharray="3 3" />}
            <text x={x} y={y + r + 16} textAnchor="middle" fill={isUnlocked ? rank.textColor : "#334155"}
              fontSize={10} fontWeight={700} fontFamily="Inter, sans-serif" letterSpacing={1.5}
              style={{ textTransform: "uppercase" }}>{rank.name}</text>
            <text x={x} y={y + r + 28} textAnchor="middle"
              fill={isUnlocked ? "rgba(100,116,139,0.9)" : "#1e293b"} fontSize={8.5} fontFamily="Inter, sans-serif">
              {rank.minElo === 0 ? "Starter" : `${rank.minElo.toLocaleString()}+ Elo`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


export default function RanksPage() {
  const [tooltip, setTooltip] = useState({ rank: null, x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [userStats, setUserStats] = useState({
    elo: 0,
    accuracy: null,
    seasonCheckIns: 0,
    problemsSolved: 0
  });

  const { data: seasonData, loading: seasonLoading } = useSelector(state => state.season);
  const seasonId = seasonData?.seasonId;

  const [offSeasonMessage, setOffSeasonMessage] = useState(null);

  useEffect(() => {
    if (seasonLoading) return;
    
    if (!seasonId) {
      setOffSeasonMessage("No active seasons right now.");
      setIsLoading(false);
      return;
    }
    
    axiosClient.get(`/leaderboard/mystats/${seasonId}`)
      .then(res => {
         if (res.data.mystats) {

            setUserStats({
              elo: res.data.mystats.elo || 0,
              accuracy: res.data.mystats.accuracy || 0,
              seasonCheckIns: res.data.mystats.seasonCheckIns || 0,
              problemsSolved: res.data.mystats.problemsSolved || 0
            });
         }
         setIsLoading(false);
      })
      .catch(err => {
         console.error(err);
         if (err.response?.status === 403 && err.response?.data?.error === "Action Forbidden") {
           setUserStats({
             elo: 100,
             accuracy: 100,
             seasonCheckIns: 0,
             problemsSolved: 0
           });
           setOffSeasonMessage(err.response.data.message);
         }
         setIsLoading(false);
      });
  }, [seasonId]);

  const currentElo = userStats.elo;
  
  let currentRankIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const reqs = RANKS[i].getRequirements(userStats);
    if (reqs.every(r => r.met)) {
      currentRankIdx = i;
      break;
    }
  }

  const currentRank = RANKS[currentRankIdx];
  const nextRank = RANKS[currentRankIdx + 1];
  const progressPct = nextRank
    ? Math.min(100, Math.max(0, Math.round(((currentElo - currentRank.minElo) / (nextRank.minElo - currentRank.minElo)) * 100)))
    : 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center antialiased" style={{ background: "#090D16" }}>
        <div className="text-white text-xl animate-pulse">Loading Ranks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden antialiased select-none" style={{ background: "#090D16" }}>
      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(30,41,59,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.3) 1px, transparent 1px)`, backgroundSize: "4rem 4rem" }} />
      <StarField />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />

      <MouseTooltip tooltip={tooltip} userStats={userStats} currentRankIdx={currentRankIdx} />

      <main className="mx-auto max-w-5xl px-6 py-14 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-4" style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.07)", color: "#fbbf24" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Season {seasonData?.seasonId } — {offSeasonMessage ? "Off-Season" : "Active"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">Rank Progression</h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto">Climb through six prestigious ranks by solving problems, maintaining accuracy, and staying active each season.</p>
        </div>

        {offSeasonMessage && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 mb-8 text-center flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rose-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-rose-200">{offSeasonMessage}</span>
          </div>
        )}

        <div className="rounded-2xl border p-6 mb-10" style={{ background: "rgba(18,24,38,0.7)", borderColor: "rgba(30,41,59,0.8)", backdropFilter: "blur(12px)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Your current rank</div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold" style={{ color: currentRank.textColor }}>{currentRank.name}</span>
                {nextRank && <>
                  <span className="text-slate-600">→</span>
                  <span className="text-sm font-semibold text-slate-400">Next: <span style={{ color: nextRank.textColor }}>{nextRank.name}</span></span>
                </>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{currentElo.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{nextRank ? `${(nextRank.minElo - currentElo).toLocaleString()} Elo to ${nextRank.name}` : "Max rank achieved"}</div>
            </div>
          </div>

          <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(30,41,59,0.8)" }}>
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${currentRank.color}99, ${nextRank?.color ?? currentRank.color})`, boxShadow: `0 0 10px ${currentRank.glowColor}` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 mt-1.5">
            <span>{currentRank.minElo.toLocaleString()} Elo</span>
            <span>{progressPct}% complete</span>
            <span>{nextRank ? `${nextRank.minElo.toLocaleString()} Elo` : "MAX"}</span>
          </div>
        </div>

        <div className="rounded-2xl border px-8 pt-8 pb-14 mb-10 relative" style={{ background: "rgba(9,13,22,0.85)", borderColor: "rgba(30,41,59,0.5)", overflow: "visible" }}>
          <ConstellationMap onHover={(rank, x, y) => setTooltip({ rank, x, y })} currentElo={currentElo} currentRankIdx={currentRankIdx} />
        </div>

        <div className="mt-2 rounded-2xl border p-5" style={{ background: "rgba(6,182,212,0.04)", borderColor: "rgba(6,182,212,0.15)" }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-cyan-400 text-lg font-serif">神</div>
            <div>
              <div className="text-sm font-bold text-cyan-300 mb-1">God rank requires exceptional Elo, accuracy, and season participation.</div>
              <div className="text-xs text-slate-500">Less than 1% of players will reach it. Monarch and God ranks are not purely Elo-based — consistency and accuracy are equally weighted.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}