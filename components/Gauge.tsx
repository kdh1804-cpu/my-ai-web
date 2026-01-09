
import React from 'react';

interface GaugeProps {
  value: number;
  status: string;
  color: string;
}

export const Gauge: React.FC<GaugeProps> = ({ value, status, color }) => {
  const rotation = (value / 100) * 180 - 90;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800">
      <div className="relative w-64 h-32 overflow-hidden">
        {/* Semi-circle background */}
        <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-gray-800 rounded-full"></div>
        {/* Gradient progress */}
        <div 
          className="absolute top-0 left-0 w-64 h-64 border-[16px] border-transparent border-t-blue-500 border-l-blue-500 rounded-full transition-transform duration-1000 ease-out origin-center"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            borderColor: value > 80 ? '#ef4444' : value > 60 ? '#f59e0b' : '#3b82f6'
          }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full text-center">
            <span className="text-5xl font-black tracking-tighter">{Math.round(value)}%</span>
        </div>
      </div>
      <div className={`mt-4 text-xl font-bold ${color} animate-pulse`}>
        {status}
      </div>
      <p className="mt-2 text-gray-400 text-sm">QQQ 저점 판독 인덱스</p>
    </div>
  );
};
