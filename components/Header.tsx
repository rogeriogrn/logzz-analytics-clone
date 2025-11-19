import React from 'react';
import { Search, Filter, User, LayoutDashboard, Package, Truck, DollarSign, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  onOpenFilter: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, globalSearch, setGlobalSearch, onOpenFilter }) => {
  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: Package },
    { id: 'logistica', label: 'Logística', icon: Truck },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'futuras', label: 'Futuras Entregas', icon: Calendar },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
              L
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Logzz <span className="text-emerald-500">Analytics</span></span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all"
            placeholder="Busca Global (Nome, ID, Pedido...)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter size={16} />
            <span className="hidden md:inline">Filtros</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            ONLINE
          </div>
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
            <User size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;