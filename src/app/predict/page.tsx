"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientSchema } from "@/lib/validation";
import { predictOne } from "@/lib/api";
import Card from "@/components/Card";
import NumberField from "@/components/NumberField";
import ResultBadge from "@/components/ResultBadge";
import { useState } from "react";

const ranges = {
  pregnancies: { min: 0, max: 20 },
  glucose: { min: 0, max: 300 },
  blood_pressure: { min: 0, max: 200 },
  skin_thickness: { min: 0, max: 100 },
  insulin: { min: 0, max: 1000 },
  bmi: { min: 0, max: 100 },
  diabetes_pedigree_function: { min: 0, max: 3, step: 0.001 },
  age: { min: 0, max: 120 },
} as const;

const benchmarks = {
  pregnancies: { label: "Pregnancies", normalMin: 0, normalMax: 5, max: 20, unit: "" },
  glucose: { label: "Glucose", normalMin: 70, normalMax: 140, max: 300, unit: "mg/dL" },
  blood_pressure: { label: "Blood Pressure", normalMin: 60, normalMax: 80, max: 200, unit: "mm Hg" },
  skin_thickness: { label: "Skin Thickness", normalMin: 10, normalMax: 30, max: 100, unit: "mm" },
  insulin: { label: "Insulin", normalMin: 16, normalMax: 166, max: 1000, unit: "mu U/ml" },
  bmi: { label: "BMI", normalMin: 18.5, normalMax: 25, max: 100, unit: "" },
  diabetes_pedigree_function: { label: "Diabetes Pedigree", normalMin: 0.08, normalMax: 0.5, max: 3.0, unit: "" },
  age: { label: "Age", normalMin: 21, normalMax: 45, max: 120, unit: "yrs" },
} as const;

function RadialGauge({ probability }: { probability: number }) {
  const percentage = probability * 100;
  const strokeDashval = 220; // 2 * PI * 35 approx
  const strokeDashoffset = strokeDashval - (strokeDashval * probability);
  
  let strokeColor = "stroke-emerald-500";
  let textColor = "text-emerald-600";
  let riskLabel = "Low Risk";
  let riskBg = "bg-emerald-50";

  if (probability >= 0.7) {
    strokeColor = "stroke-rose-500";
    textColor = "text-rose-600";
    riskLabel = "High Risk";
    riskBg = "bg-rose-50";
  } else if (probability >= 0.35) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-600";
    riskLabel = "Moderate Risk";
    riskBg = "bg-amber-50";
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 ${riskBg} transition-colors duration-300`}>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="35"
            className="stroke-slate-200 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            className={`${strokeColor} fill-none transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={strokeDashval}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{percentage.toFixed(1)}%</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Probability</span>
        </div>
      </div>
      <div className={`mt-3 font-bold text-sm uppercase tracking-wider ${textColor}`}>
        {riskLabel}
      </div>
    </div>
  );
}

function BenchmarkBar({
  value,
  label,
  normalMin,
  normalMax,
  max,
  unit,
}: {
  value: number;
  label: string;
  normalMin: number;
  normalMax: number;
  max: number;
  unit: string;
}) {
  const valPct = Math.min(100, Math.max(0, (value / max) * 100));
  const minPct = (normalMin / max) * 100;
  const maxPct = (normalMax / max) * 100;

  const isHigh = value > normalMax;
  const isLow = value < normalMin;
  const isNormal = !isHigh && !isLow;

  let statusText = "Normal";
  let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (isHigh) {
    statusText = "Elevated";
    statusColor = "text-rose-600 bg-rose-50 border-rose-200";
  } else if (isLow) {
    statusText = "Low";
    statusColor = "text-amber-600 bg-amber-50 border-amber-200";
  }

  const gradient = `linear-gradient(to right, 
    #cbd5e1 0%, 
    #cbd5e1 ${minPct}%, 
    #10b981 ${minPct}%, 
    #10b981 ${maxPct}%, 
    #ef4444 ${maxPct}%, 
    #ef4444 100%)`;

  return (
    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-700">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-900">{value} {unit}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusColor}`}>
            {statusText}
          </span>
        </div>
      </div>
      <div className="relative h-4 w-full flex items-center">
        <div 
          className="h-1.5 w-full rounded-full opacity-60"
          style={{ background: gradient }}
        />
        <div 
          className={`absolute h-3 w-3 rounded-full border border-white shadow-sm -translate-x-1/2 transition-all duration-700 ${
            isNormal ? "bg-emerald-500 animate-pulse" : isLow ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ left: `${valPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-medium text-slate-400">
        <span>0</span>
        <span>Normal range: {normalMin}-{normalMax} {unit}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function PredictPage() {
  const [result, setResult] = useState<null | { prediction: number; probability: number; prediction_text: string }>(null);
  const [submittedValues, setSubmittedValues] = useState<PatientSchema | null>(null);

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      pregnancies: 1,
      glucose: 85,
      blood_pressure: 66,
      skin_thickness: 29,
      insulin: 0,
      bmi: 26.6,
      diabetes_pedigree_function: 0.351,
      age: 31,
    },
  });

  const onSubmit = async (values: PatientSchema) => {
    const res = await predictOne(values);
    setSubmittedValues(values);
    setResult(res);
  };

  const closeModal = () => {
    setResult(null);
    setSubmittedValues(null);
  };

  return (
    <div className="space-y-6 relative">
      <h1 className="h1">Single Prediction</h1>
      <Card>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <NumberField control={control} name="pregnancies" label="Pregnancies" {...ranges.pregnancies} />
          <NumberField control={control} name="glucose" label="Glucose (mg/dL)" {...ranges.glucose} />
          <NumberField control={control} name="blood_pressure" label="Blood Pressure (mm Hg)" {...ranges.blood_pressure} />
          <NumberField control={control} name="skin_thickness" label="Skin Thickness (mm)" {...ranges.skin_thickness} />
          <NumberField control={control} name="insulin" label="Insulin (mu U/ml)" {...ranges.insulin} />
          <NumberField control={control} name="bmi" label="BMI" step={0.1} {...ranges.bmi} />
          <NumberField control={control} name="diabetes_pedigree_function" label="Diabetes Pedigree Function" {...ranges.diabetes_pedigree_function} />
          <NumberField control={control} name="age" label="Age" {...ranges.age} />

          <div className="md:col-span-2 mt-2 flex items-center gap-2">
            <button disabled={isSubmitting} className="btn btn-primary" type="submit">Predict</button>
            <button type="button" className="btn btn-ghost" onClick={() => { reset(); setResult(null); setSubmittedValues(null); }}>Reset</button>
          </div>
        </form>
      </Card>

      {result && submittedValues && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Diagnostic Summary</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Radial Gauge & Text Result */}
              <div className="flex flex-col gap-4">
                <RadialGauge probability={result.probability} />
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <h3 className="font-semibold text-sm text-slate-800 mb-1">Interpretation</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{result.prediction_text}</p>
                </div>
              </div>

              {/* Right Column: Parameter Breakdown */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-1">Patient Metric Benchmarks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(benchmarks) as Array<keyof typeof benchmarks>).map((key) => {
                    const value = submittedValues[key];
                    const benchmark = benchmarks[key];
                    return (
                      <BenchmarkBar
                        key={key}
                        value={value}
                        label={benchmark.label}
                        normalMin={benchmark.normalMin}
                        normalMax={benchmark.normalMax}
                        max={benchmark.max}
                        unit={benchmark.unit}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
              <button
                onClick={closeModal}
                className="btn btn-primary"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
