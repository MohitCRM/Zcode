import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../../utils/axiosClient";
import Editor from "@monaco-editor/react";

const difficultyMatrix = {
  easy: "bg-[#041611] border-[#0d4f3a] text-[#00df89]",
  medium: "bg-[#191107] border-[#4e320f] text-[#ffaa00]",
  hard: "bg-[#17080c] border-[#571922] text-[#ff3355]",
};

const formatExampleData = (dataString) => {
  if (!dataString) return dataString;
  try {
    const parsed =
      typeof dataString === "string" ? JSON.parse(dataString) : dataString;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return Object.entries(parsed)
        .map(([key, value]) => {
          let valStr = JSON.stringify(value);
          if (Array.isArray(value)) {
            valStr = valStr.replace(/,/g, ", ");
          }
          return `${key} = ${valStr}`;
        })
        .join(", ");
    }
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed).replace(/,/g, ", ");
    }
    return String(parsed);
  } catch (e) {
    return typeof dataString === "object"
      ? JSON.stringify(dataString)
      : dataString;
  }
};

function CustomVideoPlayer({ url, poster }) {
  const playerRef = useRef(null);
  const wrapperRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [seeking, setSeeking] = useState(false);
  const [playedFraction, setPlayedFraction] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const videoUrl = url && !url.match(/\.(mp4|webm|ogg)$/i) ? `${url}.mp4` : url;

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (playerRef.current) playerRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (wrapperRef.current?.requestFullscreen) {
        wrapperRef.current.requestFullscreen();
      } else if (wrapperRef.current?.webkitRequestFullscreen) {
        wrapperRef.current.webkitRequestFullscreen();
      } else if (wrapperRef.current?.msRequestFullscreen) {
        wrapperRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (!seeking && playerRef.current) {
      const current = playerRef.current.currentTime;
      const dur = playerRef.current.duration || 1;
      setPlayedFraction(current / dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (playerRef.current) {
      setDuration(playerRef.current.duration);
    }
  };

  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (e) => setPlayedFraction(parseFloat(e.target.value));
  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    if (playerRef.current) {
      const dur = playerRef.current.duration || 1;
      playerRef.current.currentTime = parseFloat(e.target.value) * dur;
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative mx-auto flex flex-col overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? "h-full w-full max-w-none rounded-none border-none bg-black"
          : "w-full rounded-xl border border-slate-800/60 bg-[#070C15] shadow-lg"
      }`}
    >
      <div
        className={`relative w-full flex-grow bg-black ${isFullscreen ? "h-full flex items-center justify-center" : "aspect-video"}`}
      >
        <video
          ref={playerRef}
          src={videoUrl}
          poster={poster}
          className={`w-full object-contain cursor-pointer ${isFullscreen ? "h-full max-h-screen" : "h-full"}`}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      <div
        className={`flex flex-col gap-3 p-4 text-slate-200 transition-all duration-300 ${
          isFullscreen
            ? "absolute bottom-0 left-0 w-full z-50 bg-[#0B111E]/80 backdrop-blur-md border-t border-slate-700/50"
            : "border-t border-slate-800/60 bg-[#0B111E]"
        }`}
      >
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={playedFraction}
          onMouseDown={handleSeekMouseDown}
          onChange={handleSeekChange}
          onMouseUp={handleSeekMouseUp}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700/50 accent-indigo-500 hover:accent-indigo-400"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 rounded-lg bg-indigo-600/10 px-3 py-1.5 text-xs font-bold text-indigo-400 transition-colors hover:bg-indigo-600/20 hover:text-indigo-300"
            >
              {isPlaying ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Play
                </>
              )}
            </button>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-xs font-medium text-slate-400 font-mono mr-2">
                {formatTime(playedFraction * duration)} / {formatTime(duration)}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-slate-700/50 accent-indigo-500 hover:accent-indigo-400"
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="rounded border border-slate-700/50 bg-[#161F30] px-2 py-1 text-xs font-medium text-slate-300 outline-none transition-colors hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:bg-[#121826] hover:text-slate-200"
            >
              {isFullscreen ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.22 3.22a.75.75 0 011.06 0l3.97 3.97V4.5a.75.75 0 011.5 0V9a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h2.69L3.22 4.28a.75.75 0 010-1.06zm17.56 0a.75.75 0 010 1.06l-3.97 3.97h2.69a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75V4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0zM3.22 20.78a.75.75 0 010-1.06l3.97-3.97H4.5a.75.75 0 010-1.5H9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-2.69l-3.97 3.97a.75.75 0 01-1.06 0zm17.56 0a.75.75 0 01-1.06 0l-3.97-3.97v2.69a.75.75 0 01-1.5 0V15a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-2.69l3.97 3.97a.75.75 0 010 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Exit
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.47a.75.75 0 011.06 0l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97a.75.75 0 010-1.06zm-9.47 0a.75.75 0 010 1.06l-3.97 3.97h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Fullscreen
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Solution() {
  const { pid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [problemData, setProblemData] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const isGuest = user?.role === "guest";
        const solEndpoint = isGuest
          ? `/solution/guest/${pid}`
          : `/solution/${pid}`;
        const probEndpoint = isGuest
          ? `/problem/guestgetproblembyid/${pid}`
          : `/problem/getproblembyid/${pid}`;

        const [solRes, probRes] = await Promise.all([
          axiosClient.get(solEndpoint),
          axiosClient.get(probEndpoint),
        ]);
        setSolutionData(solRes.data.solutionData);
        setProblemData(probRes.data.problem);
      } catch (err) {
        console.error("Error fetching solution context:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [pid, user?.role]);

  if (loading || !problemData || !solutionData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090D16] text-slate-500 font-mono text-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#090D16] text-slate-200 antialiased overflow-hidden">
      <header className="border-b border-slate-800/80 bg-[#0C1220] px-6 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-1/2 flex flex-col border-r border-slate-800/80 bg-[#0A0E1A]">
          <div className="flex bg-[#0C1220] border-b border-slate-800/80 p-2 justify-between items-center shrink-0">
            <div className="flex bg-[#121826] p-1 rounded-lg border border-slate-800/40 w-full">
              {[
                "description",
                "editorial",
                "my-submissions",
                "peer-submissions",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 text-center text-xs font-medium px-3 py-1.5 rounded-md transition-all whitespace-nowrap uppercase tracking-wider ${
                    activeLeftTab === tab
                      ? "bg-indigo-600 text-white font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  onClick={() => setActiveLeftTab(tab)}
                >
                  {tab.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeLeftTab === "description" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      {problemData.title}
                    </h1>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="bg-[#1e1430] border border-[#3c245c] text-[#c084fc] font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Day {problemData.releaseDay || 1}
                      </span>

                      <span
                        className={`font-sans text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${difficultyMatrix[problemData.difficulty?.toLowerCase() || "easy"]}`}
                      >
                        {problemData.difficulty || "EASY"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#121826] border border-slate-800 rounded-xl px-5 py-2.5 flex items-center gap-5 shrink-0 shadow-sm font-sans">
                    <div className="text-center min-w-[60px]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Reward
                      </div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        +{problemData.baseEloReward || 100}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-800/80 self-center"></div>
                    <div className="text-center min-w-[60px]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Penalty
                      </div>
                      <div className="text-lg font-bold text-rose-500 mt-0.5">
                        -{problemData.penaltyWrongAnswer || 10}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-base text-slate-200 font-sans tracking-wide leading-relaxed selection:bg-indigo-500/30">
                  {problemData.description}
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-slate-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2zm0 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2z" />
                    </svg>
                    <h3 className="font-sans font-black text-slate-100 text-base tracking-wider uppercase">
                      Visible Test Cases
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {problemData.visibleTestCases?.map((example, index) => (
                      <div key={index} className="space-y-2.5">
                        <h4 className="font-sans font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                          Example {index + 1}:
                        </h4>
                        <div className="bg-[#121826]/30 border border-slate-800/60 rounded-xl p-5 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                              Input
                            </span>
                            <div className="bg-[#070C15] border border-slate-900 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
                              {formatExampleData(example.input)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                              Output
                            </span>
                            <div className="bg-[#070C15] border border-slate-900 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
                              {formatExampleData(example.output)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#121826]/40 border border-slate-800/60 rounded-xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800/60 pb-3">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <h3 className="font-sans font-bold text-xs uppercase tracking-widest">
                      Constraints
                    </h3>
                  </div>

                  <ul className="space-y-3 list-disc pl-5 font-sans text-sm text-slate-300">
                    {problemData.constraints?.inputConstraints ? (
                      <li className="leading-relaxed marker:text-slate-500">
                        <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                          {problemData.constraints.inputConstraints}
                        </span>
                      </li>
                    ) : (
                      <>
                        <li className="leading-relaxed marker:text-slate-500">
                          <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                            2 &lt;= nums.length &lt;= 10^4
                          </span>
                        </li>
                        <li className="leading-relaxed marker:text-slate-500">
                          <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                            -10^9 &lt;= nums[i] &lt;= 10^9
                          </span>
                        </li>
                      </>
                    )}

                    <li className="leading-relaxed marker:text-slate-500">
                      Time Limit:{" "}
                      <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                        {problemData.constraints?.timeLimit || "2.0"}s
                      </span>
                    </li>
                    <li className="leading-relaxed marker:text-slate-500">
                      Memory Limit:{" "}
                      <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                        {problemData.constraints?.memoryLimit || "256"}MB
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {activeLeftTab === "editorial" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      Video Walkthroughs
                    </h3>
                  </div>

                  {problemData.videoSolution?.secureUrl ? (
                    <CustomVideoPlayer
                      url={problemData.videoSolution.secureUrl}
                      poster={problemData.videoSolution.thumbnailUrl}
                    />
                  ) : (
                    <div className="group bg-[#121826]/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-800/80 p-6 text-center transition-all">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                      </div>
                      <span className="text-slate-500 italic text-xs block">
                        No video walkthroughs available.
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      Official Reference Implementations
                    </h3>
                  </div>

                  {solutionData.officialReferenceSolutions &&
                  solutionData.officialReferenceSolutions.length > 0 ? (
                    <div className="space-y-6">
                      {solutionData.officialReferenceSolutions.map((sol, i) => (
                        <div
                          key={i}
                          className="group bg-[#121826]/50 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 space-y-3 shadow-lg hover:border-indigo-500/20 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                              Solution #{i + 1}
                            </div>
                            {sol.language && (
                              <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700/30 uppercase tracking-wider">
                                {sol.language}
                              </span>
                            )}
                          </div>

                          <div className="relative rounded-lg overflow-hidden border border-slate-900 bg-[#070C15] group-hover:border-slate-800/80 transition-colors">
                            <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre selection:bg-indigo-500/40">
                              <code>{sol.code}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-xs py-4 bg-[#121826]/20 border border-slate-800/40 rounded-xl text-center">
                      No verified editorial solutions released yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeLeftTab === "my-submissions" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    My Submissions
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {solutionData.mySolutions &&
                  solutionData.mySolutions.length > 0 ? (
                    solutionData.mySolutions.map((sub, index) => {
                      const isSelected =
                        selectedSubmission?.submissionId === sub.submissionId;
                      return (
                        <div
                          key={sub.submissionId || index}
                          onClick={() =>
                            setSelectedSubmission({
                              ...sub,
                              author: "Your Account Submission",
                            })
                          }
                          className={`group relative rounded-xl border p-4 flex items-center justify-between gap-4 transition-all duration-200 ease-out cursor-pointer shadow-lg ${
                            isSelected
                              ? "bg-[#161F30] border-indigo-500 shadow-[0_0_25px_-5px_rgba(79,70,229,0.2)]"
                              : "bg-[#121826]/70 backdrop-blur-sm border-slate-800/60 hover:border-slate-700 hover:bg-[#161F30] hover:shadow-black/20 hover:-translate-y-[1px]"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-indigo-500 rounded-r-md shadow-[0_0_8px_#4f46e5]"></div>
                          )}

                          <div className="flex items-center gap-3 truncate">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors ${
                                isSelected
                                  ? "bg-indigo-950 text-indigo-400 border-indigo-500/30"
                                  : "bg-slate-900/60 text-slate-400 border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300"
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-3.5 h-3.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                              </svg>
                            </div>

                            <div className="truncate space-y-0.5">
                              <div
                                className={`text-sm font-medium transition-colors ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}
                              >
                                Attempt #{index + 1}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/80"></span>
                                {sub.submittedAt ||
                                  "Verification Log Confirmed"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {sub.eloChange !== undefined && (
                              <span
                                className={`font-mono text-[10px] font-bold uppercase rounded-md px-2.5 py-0.5 border ${
                                  sub.eloChange > 0
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : sub.eloChange < 0
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                      : "bg-slate-800/80 border-slate-700/30 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-300"
                                }`}
                              >
                                {sub.eloChange > 0
                                  ? `+${sub.eloChange}`
                                  : sub.eloChange}
                              </span>
                            )}
                            <span
                              className={`font-mono text-[10px] font-bold uppercase rounded-md px-2.5 py-0.5 border transition-all ${
                                isSelected
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                  : "bg-slate-800/80 border-slate-700/30 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-300"
                              }`}
                            >
                              {sub.language || "cpp"}
                            </span>

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className={`w-4 h-4 transition-all duration-200 ${
                                isSelected
                                  ? "text-indigo-400 translate-x-0"
                                  : "text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5"
                              }`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="group bg-[#121826]/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-800/80 p-6 text-center transition-all">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                          />
                        </svg>
                      </div>
                      <span className="text-slate-500 italic text-xs block">
                        Make submissions to see my submissions here.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeLeftTab === "peer-submissions" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Peer Submissions
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {solutionData.peerSolutions &&
                  solutionData.peerSolutions.length > 0 ? (
                    solutionData.peerSolutions.map((sub, index) => {
                      const isSelected =
                        selectedSubmission?.submissionId === sub.submissionId;
                      return (
                        <div
                          key={sub.submissionId || index}
                          onClick={() =>
                            setSelectedSubmission({
                              ...sub,
                              author: sub.submittedBy,
                            })
                          }
                          className={`group relative rounded-xl border p-4 flex items-center justify-between gap-4 transition-all duration-200 ease-out cursor-pointer shadow-lg ${
                            isSelected
                              ? "bg-[#161F30] border-indigo-500 shadow-[0_0_25px_-5px_rgba(79,70,229,0.2)]"
                              : "bg-[#121826]/70 backdrop-blur-sm border-slate-800/60 hover:border-slate-700 hover:bg-[#161F30] hover:shadow-black/20 hover:-translate-y-[1px]"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-indigo-500 rounded-r-md shadow-[0_0_8px_#4f46e5]"></div>
                          )}

                          <div className="flex items-center gap-3 truncate">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors ${
                                isSelected
                                  ? "bg-indigo-950 text-indigo-400 border-indigo-500/30"
                                  : "bg-slate-900/60 text-slate-400 border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300"
                              }`}
                            >
                              {(sub.submittedBy || "AT")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div className="truncate space-y-0.5">
                              <div
                                className={`text-sm font-medium transition-colors ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}
                              >
                                {sub.submittedBy || "Anonymous Terminal"}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse"></span>
                                Accepted Submission
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono text-[10px] font-bold uppercase rounded-md px-2.5 py-0.5 border transition-all ${
                                isSelected
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                  : "bg-slate-800/80 border-slate-700/30 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-300"
                              }`}
                            >
                              {sub.language || "cpp"}
                            </span>

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className={`w-4 h-4 transition-all duration-200 ${
                                isSelected
                                  ? "text-indigo-400 translate-x-0"
                                  : "text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5"
                              }`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="group bg-[#121826]/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-800/80 p-6 text-center transition-all">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </div>
                      <span className="text-slate-500 italic text-xs block">
                        No submission are registered for this problem.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#070C15] border-l border-slate-800/60 animate-in fade-in duration-200">
          <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-[#0B111E] h-[57px] shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  selectedSubmission
                    ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse"
                    : "bg-slate-700"
                }`}
              ></span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {selectedSubmission
                  ? `Code Review // ${selectedSubmission.author}`
                  : "Submission Details"}
              </span>
            </div>

            {selectedSubmission && (
              <span className="rounded-md bg-[#121826] px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-slate-800 uppercase tracking-wider font-mono">
                {selectedSubmission.language || "cpp"}
              </span>
            )}
          </div>

          <div className="flex-1 min-h-0 w-full relative bg-[#070C15]">
            {selectedSubmission ? (
              <div className="h-full pt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={
                    selectedSubmission.language === "javascript"
                      ? "javascript"
                      : "cpp"
                  }
                  value={selectedSubmission.code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "JetBrains Mono, Fira Code, monospace",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    wordWrap: "on",
                    padding: { top: 8, bottom: 8 },
                    renderLineHighlight: "all",
                    backgroundColor: "#070C15",
                  }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070C15] p-8 text-center animate-in fade-in duration-300">
                <div className="group relative bg-[#121826]/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-800/80 p-8 max-w-xs flex flex-col items-center justify-center transition-all duration-300 hover:border-indigo-500/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B111E] text-slate-500 border border-slate-800/80 mb-4 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                      />
                    </svg>
                  </div>

                  <p className="text-slate-400 font-medium text-xs mb-1">
                    No submission selected
                  </p>
                  <p className="text-slate-500 italic text-[11px] leading-relaxed">
                    Select an submissions either from my-submissions or
                    peer-submissions to check its details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
