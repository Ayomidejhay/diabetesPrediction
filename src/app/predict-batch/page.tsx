"use client";
import Card from "@/components/Card";
import Loader from "@/components/Loader";
import { predictBatch } from "@/lib/api";
import type { PatientInput } from "@/lib/types";
import ResultBadge from "@/components/ResultBadge";
import { useState, useRef } from "react";
import { patientSchema } from "@/lib/validation";

export default function BatchPage() {
  const [patients, setPatients] = useState<PatientInput[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({});
  const [results, setResults] = useState<
    { prediction: number; probability: number; prediction_text: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const template = {
    pregnancies: 1,
    glucose: 85,
    blood_pressure: 66,
    skin_thickness: 29,
    insulin: 0,
    bmi: 26.6,
    diabetes_pedigree_function: 0.351,
    age: 31,
  } satisfies PatientInput;

  const validatePatients = (list: PatientInput[]) => {
    const errors: Record<number, string[]> = {};
    list.forEach((p, index) => {
      const res = patientSchema.safeParse(p);
      const rowErrs: string[] = [];
      if (!res.success) {
        res.error.issues.forEach((err) => {
          rowErrs.push(`${err.path.join(".")}: ${err.message}`);
        });
      }
      
      // Clinical reasonability warnings
      if (p.glucose > 250 || p.glucose < 40) {
        rowErrs.push(`glucose: Out of typical clinical bounds (40-250)`);
      }
      if (p.blood_pressure > 150 || (p.blood_pressure < 40 && p.blood_pressure > 0)) {
        rowErrs.push(`blood_pressure: Out of typical clinical bounds (40-150)`);
      }
      if (p.bmi > 70 || p.bmi < 10) {
        rowErrs.push(`bmi: Out of typical clinical bounds (10-70)`);
      }
      if (p.age < 0 || p.age > 120) {
        rowErrs.push(`age: Out of bounds (0-120)`);
      }

      if (rowErrs.length > 0) {
        errors[index] = rowErrs;
      }
    });
    setRowErrors(errors);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV must contain at least one data row.");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line) =>
      line.split(",").map((v) => v.trim().replace(/\r$/, ""))
    );

    const objs: any[] = rows.map((r) =>
      Object.fromEntries(headers.map((h, i) => [h, r[i]]))
    );

    const casted = objs.map((o) => {
      const p: any = {};
      for (const k of Object.keys(template) as (keyof PatientInput)[]) {
        const raw = o[k as string]?.trim();
        p[k] =
          raw === undefined || raw === ""
            ? template[k]
            : Number.isNaN(Number(raw))
            ? template[k]
            : Number(raw);
      }
      return p as PatientInput;
    });

    return casted;
  };

  const onFile = async (file: File) => {
    setError(null);
    setRowErrors({});
    const text = await file.text();
    try {
      let parsedList: PatientInput[] = [];
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        const arr: PatientInput[] = Array.isArray(parsed)
          ? parsed
          : parsed.patients;
        if (!Array.isArray(arr))
          throw new Error("JSON must be an array or {patients: [...]}.");
        parsedList = arr;
      } else {
        parsedList = parseCSV(text);
      }
      setPatients(parsedList);
      validatePatients(parsedList);
      setResults(null);
    } catch (e: any) {
      setError(e.message || "Failed to parse file");
    }
  };

  const run = async () => {
    try {
      setLoading(true);
      const res = await predictBatch(patients);
      setResults(res.predictions);
    } catch (e: any) {
      setError("Failed to run batch prediction");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!results || patients.length === 0) return;
    
    const headers = [
      "Pregnancies",
      "Glucose",
      "Blood Pressure",
      "Skin Thickness",
      "Insulin",
      "BMI",
      "Diabetes Pedigree Function",
      "Age",
      "Prediction",
      "Probability"
    ];
    
    const rows = patients.map((p, i) => {
      const res = results[i];
      return [
        p.pregnancies,
        p.glucose,
        p.blood_pressure,
        p.skin_thickness,
        p.insulin,
        p.bmi,
        p.diabetes_pedigree_function,
        p.age,
        res.prediction === 1 ? "Diabetes" : "No Diabetes",
        `${(res.probability * 100).toFixed(2)}%`
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `diabetes_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  const sampleCSV =
    "pregnancies,glucose,blood_pressure,skin_thickness,insulin,bmi,diabetes_pedigree_function,age\n1,85,66,29,0,26.6,0.351,31\n8,183,64,0,0,23.3,0.672,32";

  return (
    <div className="space-y-6">
      <h1 className="h1">Batch Prediction</h1>
      <Card>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-slate-700">
              Upload a CSV or JSON file containing patient attributes:
            </p>
            <code className="rounded bg-slate-100 px-2 py-1 text-sm font-mono break-all block">
              pregnancies, glucose, blood_pressure, skin_thickness, insulin, bmi,
              diabetes_pedigree_function, age
            </code>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragging 
                ? "border-teal-500 bg-teal-50/50" 
                : "border-slate-300 hover:border-teal-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={(e) => e.target.files && onFile(e.target.files[0])}
            />
            <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">
              Drag & drop your file here, or <span className="text-teal-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports CSV or JSON files</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn btn-primary"
              disabled={!patients.length || loading}
              onClick={run}
            >
              Run
            </button>
            {loading && <Loader label="Predicting..." />}
          </div>

          {!!error && <p className="err">{error}</p>}

          <details>
            <summary className="cursor-pointer text-sm text-slate-600 select-none">See sample CSV format</summary>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-3 text-sm font-mono text-slate-700">
              {sampleCSV}
            </pre>
          </details>
        </div>
      </Card>

      {patients.length > 0 && !results && (
        <Card title={`Loaded Patients (${patients.length})`}>
          <p className="text-xs text-slate-500 mb-3">
            Hover over the ⚠️ status badge to view validation failures or typical range outliers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Status</th>
                  {Object.keys(template).map((k) => (
                    <th
                      key={k}
                      className="px-2 py-2 text-left font-medium capitalize text-slate-600"
                    >
                      {k.replaceAll("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => {
                  const errors = rowErrors[i];
                  const hasErrors = errors && errors.length > 0;
                  return (
                    <tr
                      key={i}
                      className={`border-b hover:bg-slate-50 transition-colors ${
                        hasErrors ? "bg-rose-50/40 hover:bg-rose-50/60" : ""
                      }`}
                    >
                      <td className="px-2 py-2">
                        {hasErrors ? (
                          <div className="relative group flex items-center">
                            <span className="text-rose-500 cursor-help select-none">⚠️</span>
                            <div className="absolute left-6 bottom-0 hidden group-hover:block z-50 w-64 bg-slate-800 text-white text-[11px] p-2.5 rounded-xl shadow-xl leading-relaxed">
                              <p className="font-bold mb-1 border-b border-slate-700 pb-1">Validation Warnings:</p>
                              <ul className="list-disc pl-3.5 space-y-0.5">
                                {errors.map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <span className="text-emerald-500 select-none">✓</span>
                        )}
                      </td>
                      {Object.keys(template).map((k) => (
                        <td key={k} className="px-2 py-2">
                          {(p as any)[k]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {results && (
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Diagnostic Summary Report</h2>
              <p className="text-xs text-slate-500 mt-0.5">Evaluated clinical metrics for imported cohort</p>
            </div>
            <button
              onClick={exportCSV}
              className="btn btn-primary !w-[140px] shadow-sm"
            >
              Export to CSV
            </button>
          </div>

          {/* Aggregated Statistics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Evaluated</span>
              <span className="text-3xl font-extrabold text-slate-800">{patients.length}</span>
            </div>
            <div className="p-4 bg-rose-50/50 border border-rose-100/50 rounded-2xl text-center space-y-1">
              <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider">Diabetes Risk Detected</span>
              <span className="text-3xl font-extrabold text-rose-600">{results.filter(r => r.prediction === 1).length}</span>
            </div>
            <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl text-center space-y-1">
              <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">No Risk Detected</span>
              <span className="text-3xl font-extrabold text-emerald-600">{patients.length - results.filter(r => r.prediction === 1).length}</span>
            </div>
          </div>

          {/* Cohort Results Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Glucose</th>
                  <th className="px-4 py-3 text-left">BMI</th>
                  <th className="px-4 py-3 text-left">Age</th>
                  <th className="px-4 py-3 text-left">Clinical Outcome</th>
                  <th className="px-4 py-3 text-left">Probability</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const patient = patients[i];
                  const isPositive = r.prediction === 1;
                  return (
                    <tr key={i} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-700">Patient {i + 1}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-semibold">{patient?.glucose} mg/dL</td>
                      <td className="px-4 py-3.5 text-slate-600 font-semibold">{patient?.bmi}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-semibold">{patient?.age} yrs</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isPositive 
                            ? "bg-rose-50 text-rose-700 border-rose-200" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? "bg-rose-500" : "bg-emerald-500"}`} />
                          {isPositive ? "Diabetes Risk" : "No Diabetes"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${isPositive ? "bg-rose-500" : "bg-emerald-500"}`}
                              style={{ width: `${r.probability * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{(r.probability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
