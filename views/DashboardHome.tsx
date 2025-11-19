import React from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Activity, ArrowUpRight, ArrowDownRight, Calendar,
  Wallet, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData, KPIs } from '../types';
import { theme } from '../constants';
import { formatCurrency } from '../utils/formatters';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';

interface DashboardHomeProps {
  data: DashboardData;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ data }) => {
  const { kpis, graficoVendas } = data;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">Visão Geral</h2>
            <p className="text-slate-500 mt-1">Acompanhe o desempenho da sua operação em tempo real.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/60 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-700">Atualizado agora</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={64} className="text-emerald-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100/80 rounded-xl text-emerald-600 shadow-sm backdrop-blur-sm">
                <DollarSign size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Faturamento Total</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">{formatCurrency(kpis.faturamentoReal)}</h3>
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium bg-emerald-50/50 px-2 py-0.5 rounded-full w-fit">
                  <TrendingUp size={12} /> +12.5%
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingBag size={64} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100/80 rounded-xl text-blue-600 shadow-sm backdrop-blur-sm">
                <ShoppingBag size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Vendas Realizadas</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">{kpis.totalVendas}</h3>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium bg-blue-50/50 px-2 py-0.5 rounded-full w-fit">
                  <TrendingUp size={12} /> +8.2%
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={64} className="text-purple-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100/80 rounded-xl text-purple-600 shadow-sm backdrop-blur-sm">
                <Activity size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Taxa de Entrega</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">{kpis.deliverySuccessRate.toFixed(1)}%</h3>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1 font-medium bg-purple-50/50 px-2 py-0.5 rounded-full w-fit">
                  <Activity size={12} /> Estável
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={64} className="text-orange-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100/80 rounded-xl text-orange-600 shadow-sm backdrop-blur-sm">
                <Users size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Ticket Médio</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">{formatCurrency(kpis.averageOrderValue)}</h3>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1 font-medium bg-orange-50/50 px-2 py-0.5 rounded-full w-fit">
                  <TrendingUp size={12} /> +2.4%
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Desempenho do Período</h3>
                <p className="text-sm text-slate-500">Vendas realizadas vs. Projetado</p>
              </div>
              <button className="text-sm text-emerald-600 font-medium hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                Ver Detalhes
              </button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graficoVendas}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dia"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1e293b', fontSize: '14px', fontWeight: 500 }}
                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                  />
                  <Area
                    type="monotone"
                    dataKey="realizado"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVendas)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Secondary Metrics */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 font-display">Financeiro Rápido</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-emerald-800">Lucro Líquido (Caixa)</span>
                    <Wallet size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 font-display">
                    {formatCurrency(kpis.cashCollected)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Disponível para saque</div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-amber-800">A Receber (COD)</span>
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-700 font-display">
                    {formatCurrency(kpis.cashToCollect)}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">Previsão: Próx. 7 dias</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-4 font-display">Status dos Pedidos</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600">Entregues</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {data.orders.filter(o => o.order_status === 'Entregue' || o.order_status === 'Completo').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-600">Em Trânsito</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {data.orders.filter(o => ['Enviado', 'Em rota', 'A caminho'].includes(o.order_status as string)).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-slate-600">Pendentes</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {data.orders.filter(o => ['Agendado', 'Pendente', 'Confirmado'].includes(o.order_status as string)).length}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardHome;