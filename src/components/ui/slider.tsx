"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type IntensitySliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

/** 0–100 intensity slider on a native range input (keyboard + screen reader for free). */
export function IntensitySlider({ label, value, onChange, min = 0, max = 100, step = 5, className }: IntensitySliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("glass flex flex-col gap-2 rounded-[18px] p-3.5", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="type-label-m text-t1">
          {label}
        </label>
        <span className="type-title-m text-lime-deep" aria-hidden>
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value} out of ${max}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="evo-range h-[22px] w-full cursor-pointer appearance-none bg-transparent"
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
