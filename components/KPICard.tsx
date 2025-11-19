import React from 'react';
import { theme } from '../constants';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue: string;
  trend: 'up' | 'down';
  trendValue: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subValue, trend, trendValue }) => (
  <div className={`${theme.card} border ${theme.border} p-5 rounded-xl shadow-sm hover:shadow-md transition-all`}>
    <div className="flex justify-between items-start mb-2">
      <p className={`${theme.textMuted} text-sm font-medium`}>{title}</p>
      <div className={`text-xs px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {trend === 'up' ? '↑' : '↓'} {trendValue}
      </div>
    </div>
    <h3 className={`${theme.textMain} text-2xl font-bold mb-1`}>{value}</h3>
    <p className="text-xs text-slate-400">{subValue}</p>
  </div>
);

export default KPICard;