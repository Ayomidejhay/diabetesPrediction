"use client";
import Card from "@/components/Card";
import Loader from "@/components/Loader";
import { useQuery } from "@tanstack/react-query";
import { modelInfo } from "@/lib/api";

function AccuracyRing({ accuracy }: { accuracy: number }) {
  const percentage = accuracy * 100;
  const strokeDashval = 220;
  const strokeDashoffset = strokeDashval - (strokeDashval * accuracy);
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-teal-50/50 border border-teal-100/50 rounded-2xl w-full sm:w-44">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="35" className="stroke-slate-100 fill-none" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="35"
            className="stroke-teal-500 fill-none transition-all duration-1000 ease-out"
            strokeWidth="8"
            strokeDasharray={strokeDashval}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-slate-800">{percentage.toFixed(1)}%</span>
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Accuracy</span>
        </div>
      </div>
    </div>
  );
}

export default function ModelInfoPage() {
  const q = useQuery({ queryKey: ["model-info"], queryFn: modelInfo });

  return (
    <div className="space-y-6">
      <h1 className="h1">Model Information</h1>
      <Card>
        {q.isLoading ? (
          <div className="flex justify-center py-12"><Loader label="Loading model info..." /></div>
        ) : q.isError ? (
          <p className="err text-center py-6">Failed to fetch model info</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Left Column: Metadata & Accuracy */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Classification Architecture</p>
                  {q.data?.model_type && (
                    <p className="text-lg font-bold text-slate-800">{q.data.model_type}</p>
                  )}
                </div>

                {typeof q.data?.accuracy === "number" && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Model Validation Metrics</p>
                    <AccuracyRing accuracy={q.data.accuracy} />
                  </div>
                )}
              </div>

              {/* Right Column: Features Badges */}
              <div className="w-full md:w-1/2 space-y-3">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Trained Input Parameters</p>
                {Array.isArray(q.data?.features) && (
                  <div className="flex flex-wrap gap-2">
                    {q.data.features.map((f: string) => (
                      <span
                        key={f}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/50 text-slate-700 text-xs font-semibold capitalize tracking-wide select-none"
                      >
                        {f.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <details className="mt-4 border-t pt-4">
              <summary className="cursor-pointer text-xs font-bold uppercase text-slate-500 hover:text-slate-700 select-none">Show Raw Parameters JSON</summary>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 text-slate-200 p-4 text-xs font-mono leading-relaxed">
                {JSON.stringify(q.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </Card>
    </div>
  );
}
