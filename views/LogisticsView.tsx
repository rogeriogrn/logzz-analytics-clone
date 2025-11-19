import React, { useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Package, AlertCircle, DollarSign } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';

interface LogisticsViewProps {
  orders: Order[];
}

interface StateMetric {
  sales: number;
  cancellations: number;
  revenue: number;
}

const LogisticsView: React.FC<LogisticsViewProps> = ({ orders }) => {
  // Aggregate data by state
  const stateData = useMemo<Record<string, StateMetric>>(() => {
    const data: Record<string, StateMetric> = {};

    orders.forEach(order => {
      // Extract state from client_address_state or fallback
      const state = order.client_address_state?.toUpperCase() || 'OUTROS';

      if (!data[state]) {
        data[state] = { sales: 0, cancellations: 0, revenue: 0 };
      }

      // Count Sales (Completed/Delivered/etc)
      if (['Completo', 'Entregue', 'Recebido', 'Confirmado', 'Enviado'].includes(order.order_status) || order.payment_status === 'Collected') {
        data[state].sales += 1;
        data[state].revenue += Number(order.order_final_price || 0);
      }

      // Count Cancellations
      if (['Cancelado', 'Devolvido', 'Falha'].includes(order.order_status) || order.payment_status === 'Failed') {
        data[state].cancellations += 1;
      }
    });

    return data;
  }, [orders]);

  // Prepare data for Google Charts
  const chartData: (string | number)[][] = [['State', 'Vendas', 'Cancelamentos']];
  const entries = Object.entries(stateData) as [string, StateMetric][];
  
  entries.forEach(([state, metrics]) => {
    if (state !== 'OUTROS') {
      chartData.push([`BR-${state}`, metrics.sales, metrics.cancellations]);
    }
  });

  // Calculate Executive Summary KPIs
  const metricsList = Object.values(stateData) as StateMetric[];
  const totalSales = metricsList.reduce((acc, curr) => acc + curr.sales, 0);
  const totalCancellations = metricsList.reduce((acc, curr) => acc + curr.cancellations, 0);
  const totalRevenue = metricsList.reduce((acc, curr) => acc + curr.revenue, 0);

  const sortedEntries = [...entries].sort((a, b) => b[1].sales - a[1].sales);
  const topStateEntry = sortedEntries.length > 0 ? sortedEntries[0] : null;
  
  const cancellationRate = totalSales > 0 ? (totalCancellations / (totalSales + totalCancellations)) * 100 : 0;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const options = {
    region: 'BR',
    resolution: 'provinces',
    displayMode: 'regions',
    colorAxis: { colors: ['#e0f2f1', '#10b981'] }, // Emerald scale
    backgroundColor: 'transparent',
    datalessRegionColor: '#f8fafc',
    defaultColor: '#f5f5f5',
    legend: { textStyle: { color: '#64748b', fontSize: 12 } },
    tooltip: { textStyle: { color: '#334155' }, showColorCode: true },
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">Logística</h2>
            <p className="text-slate-500 mt-1">Mapa de calor de vendas e cancelamentos por estado.</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-100/80 rounded-xl text-emerald-600">
                <Package size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Total de Vendas</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-display">{totalSales}</h3>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-100/80 rounded-xl text-blue-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Top Estado</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-display">
              {topStateEntry ? `${topStateEntry[0]} - ${topStateEntry[1].sales}` : '-'}
            </h3>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-red-100/80 rounded-xl text-red-600">
                <AlertCircle size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Taxa de Cancelamento</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-display">{cancellationRate.toFixed(1)}%</h3>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-orange-100/80 rounded-xl text-orange-600">
                <DollarSign size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 font-display">Ticket Médio</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-display">{formatCurrency(averageTicket)}</h3>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <GlassCard className="lg:col-span-2 p-6 min-h-[500px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Distribuição Geográfica</h3>
            <div className="w-full h-[400px] rounded-xl overflow-hidden">
              <Chart
                chartType="GeoChart"
                width="100%"
                height="100%"
                data={chartData}
                options={options}
              />
            </div>
          </GlassCard>

          {/* Top States Table */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Top 5 Estados</h3>
            <div className="space-y-4">
              {sortedEntries
                .slice(0, 5)
                .map(([state, metrics]) => (
                  <div key={state} className="flex items-center gap-4 p-3 hover:bg-slate-50/50 rounded-xl transition-colors">
                    <span className="text-lg font-bold text-slate-400 w-6">#{sortedEntries.findIndex(e => e[0] === state) + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-700">{state}</span>
                        <span className="font-medium text-emerald-600">{metrics.sales} vendas</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${totalSales > 0 ? (metrics.sales / totalSales) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default LogisticsView;