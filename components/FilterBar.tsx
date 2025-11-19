import React from 'react';
import { Filter } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface FilterBarProps {
  dateRange: { start: string; end: string };
  onOpenFilter: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ dateRange, onOpenFilter }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="text-sm font-medium text-slate-500 mr-2">Filtros ativos:</span>
      {dateRange.start && (
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded md:rounded-full">
          Data inicial: {formatDate(new Date(dateRange.start).getTime() / 1000)}
        </div>
      )}
      {dateRange.end && (
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded md:rounded-full">
          Data final: {formatDate(new Date(dateRange.end).getTime() / 1000)}
        </div>
      )}
      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded md:rounded-full">
        Base da data: Agendamento
      </div>
      <button
        onClick={onOpenFilter}
        className="ml-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-emerald-200"
      >
        <Filter size={16} /> Filtros
      </button>
    </div>
  );
};

export default FilterBar;