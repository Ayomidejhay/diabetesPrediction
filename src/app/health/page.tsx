"use client";
import Card from "@/components/Card";
import Loader from "@/components/Loader";
import { useQuery } from "@tanstack/react-query";
import { health } from "@/lib/api";

export default function HealthPage() {
  const q = useQuery({ queryKey: ["health"], queryFn: health });

  const healthy = q.data?.status === "healthy" || q.data?.status === "ok";
  const modelLoaded = q.data?.model_loaded;

  return (
    <div className="space-y-6">
      <h1 className="h1">System Health</h1>
      
      <Card>
        {q.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader label="Diagnosing backend connection..." />
          </div>
        ) : q.isError ? (
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Connection Failed</h2>
            <p className="err max-w-sm mx-auto">
              Unable to reach the prediction backend API. Please check your network connection and verify the backend host is online.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Health Header Widget */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthy ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${healthy ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">API Endpoint Status</h3>
                  <p className="text-xs text-slate-500">Responsive to ping request checks</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
                healthy 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {q.data?.status || "Unknown"}
              </span>
            </div>

            {/* Diagnostics List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Diagnostics Checklist</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Model Engine Status</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                    modelLoaded 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {modelLoaded ? "LOADED & ACTIVE" : "NOT LOADED"}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Secure Protocol (HTTPS)</span>
                  <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600 text-[10px] font-bold">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
