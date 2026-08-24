"use client";
import { Controller, Control } from "react-hook-form";

type Props = {
  control: Control<any>;
  name: string;
  label: string;
  step?: number;
  min?: number;
  max?: number;
};

export default function NumberField({ control, name, label, step = 1, min, max }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-1">
          <label className="label" htmlFor={name}>{label}</label>
          <input
            id={name}
            type="number"
            step={step}
            min={min}
            max={max}
            className="input"
            {...field}
            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
          />
          {fieldState.error && <p className="err">{fieldState.error.message}</p>}
        </div>
      )}
    />
  );
}
