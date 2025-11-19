import React from 'react';

interface FilterPillProps {
  label: string;
  active?: boolean;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, active }) => (
  <button className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
    {label}
  </button>
);

export default FilterPill;