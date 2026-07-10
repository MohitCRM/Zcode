import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#070C15] min-h-screen text-slate-200 antialiased relative flex items-center justify-center p-4 overflow-hidden select-none">
          {/* Dynamic Background Matrix Overlay Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

          <div className="w-full max-w-2xl bg-[#0B111E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-10 flex flex-col items-center text-center">
            
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-3">System Error Detected</h1>
            <p className="text-slate-400 font-mono text-sm leading-relaxed mb-10 max-w-lg">
              We encountered an unexpected crash in the application matrix. Please reboot the interface or return to the main hub.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
              >
                Return to Hub
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-[#121826]/80 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg active:scale-[0.98] transition-all duration-150"
              >
                Reboot Interface
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
