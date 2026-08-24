"use client";
import { FieldError } from "react-hook-form";

export function Field({ label, error, children }: { label: string; error?: FieldError; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {children}
      {error && <p className="err">{error.message}</p>}
    </div>
  );
}
