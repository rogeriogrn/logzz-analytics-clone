import React from 'react';
import { LayoutDashboard, Package, Truck, DollarSign, Calendar } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Geral', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: Package },
    { id: 'logistica', label: 'Logística', icon: Truck },
    { id: 'financeiro', label: 'Finan.', icon: DollarSign },
    { id: 'futuras', label: 'Futuras', icon: Calendar },
  ];

  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-2 flex justify-around overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center p-2 min-w-[70px] rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
        >
          <tab.icon size={20} className="mb-1" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MobileNav;