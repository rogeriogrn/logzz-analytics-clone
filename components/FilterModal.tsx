import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (startDate: string, endDate: string) => void;
    initialStartDate: string;
    initialEndDate: string;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialStartDate, initialEndDate }) => {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(startDate, endDate);
        onClose();
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-emerald-600" />
                        Filtrar por Período
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Quick Presets */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                setStartDate(today);
                                setEndDate(today);
                            }}
                            className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);
                                setStartDate(yesterday.toISOString().split('T')[0]);
                                setEndDate(yesterday.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            Ontem
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const last7 = new Date(today);
                                last7.setDate(last7.getDate() - 7);
                                setStartDate(last7.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            Últimos 7 dias
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                setStartDate(firstDay.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            Este Mês
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicial</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-600"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Final</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-600"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleClear}
                            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Limpar
                        </button>
                        <div className="flex-1 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
