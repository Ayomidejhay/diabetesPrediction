import Card from "@/components/Card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero / Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200/50 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
          </span>
          Clinical AI Suite
        </div>
        <h1 className="h1 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 bg-clip-text text-transparent pb-1">
          Predictive Diabetes Assessment
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Unlock early diagnostic indicators utilizing our trained predictive classification models. Fast, compliant, and data-driven.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Single Prediction</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Input individual patient physiological parameters to calculate real-time probability indices.
              </p>
            </div>
            <Link className="btn btn-primary" href="/predict">Start Form</Link>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Batch Prediction</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Import CSV or JSON arrays of multiple records to evaluate diagnostic probabilities concurrently.
              </p>
            </div>
            <Link className="btn btn-primary" href="/predict-batch">Upload File</Link>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Model Information</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Examine accuracy benchmarks, architectural layouts, and features that influence model outcomes.
              </p>
            </div>
            <Link className="btn btn-primary" href="/model-info">View Info</Link>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">System Health</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Perform connection diagnostics on the diagnostic API backend.
              </p>
            </div>
            <Link className="btn btn-primary" href="/health">Run Checks</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
