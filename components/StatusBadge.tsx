import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    'Entregue': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Completo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Confirmado': 'bg-blue-100 text-blue-700 border-blue-200',
    'Em Trânsito': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Agendado': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Separado': 'bg-slate-100 text-slate-600 border-slate-200',
    'Frustrado': 'bg-red-100 text-red-700 border-red-200',
    'Cancelado': 'bg-red-50 text-red-600 border-red-100',
    'Devolvido': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;