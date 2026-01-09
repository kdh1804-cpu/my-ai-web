
import React from 'react';

interface IndicatorCardProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  score: number;
  unit?: string;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ label, value, min, max, step, onChange, score, unit = "" }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-300 font-semibold">{label}</h3>
        <span className="text-xs font-bold bg-gray-800 px-2 py-1 rounded-md text-blue-400">가중치: {score.toFixed(1)}/25</span>
      </div>
      
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold">{value}{unit}</span>
      </div>

      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      
      <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
        <span>MIN {min}</span>
        <span>MAX {max}</span>
      </div>
    </div>
  );
};
