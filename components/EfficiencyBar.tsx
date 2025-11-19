import React from 'react';

interface EfficiencyBarProps {
  label: string;
  value: number;
  subtext?: string;
  color?: string;
}

const EfficiencyBar: React.FC<EfficiencyBarProps> = ({ label, value, subtext, color = "bg-emerald-500" }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}%</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
  </div>
);

export default EfficiencyBar;