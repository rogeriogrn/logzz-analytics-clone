import { Order, DashboardData, KPIs, Region, GraphDataPoint, Expense } from '../types';

export const calculateDashboardData = (currentOrders: Order[], expenses: Expense[] = []): DashboardData => {
  // Calculate KPIs
  const totalVendas = currentOrders.length;
  const faturamentoReal = currentOrders.reduce((acc, order) => acc + (Number(order.order_final_price) || 0), 0);
  const comissaoTotal = currentOrders.reduce((acc, order) => acc + (Number(order.commission) || 0), 0);

  // COD KPIs
  const cashToCollect = currentOrders
    .filter(o => o.payment_status === 'Pending' || o.payment_status === 'Failed')
    .reduce((acc, o) => acc + (Number(o.cod_amount) || 0), 0);

  const cashCollected = currentOrders
    .filter(o => o.payment_status === 'Collected')
    .reduce((acc, o) => acc + (Number(o.cod_amount) || 0), 0);

  const remittancePending = currentOrders
    .filter(o => o.payment_status === 'Collected') // Assuming collected needs remittance
    .reduce((acc, o) => acc + (Number(o.cod_amount) || 0), 0);

  // New KPIs
  const averageOrderValue = totalVendas > 0 ? faturamentoReal / totalVendas : 0;

  // Updated to include 'Completo'
  const deliveredOrders = currentOrders.filter(o => o.order_status === 'Entregue' || o.order_status === 'Completo').length;
  const deliverySuccessRate = totalVendas > 0 ? (deliveredOrders / totalVendas) * 100 : 0;

  const kpis: KPIs = {
    faturamentoReal,
    comissaoTotal,
    totalVendas,
    cashToCollect,
    cashCollected,
    remittancePending,
    averageOrderValue,
    deliverySuccessRate
  };

  // Calculate Regions (Logistics)
  const regionsMap = new Map<string, Region>();
  currentOrders.forEach(order => {
    const city = order.client_address_city || 'Desconhecido';
    const uf = order.client_address_state || 'UF';
    const key = `${city}-${uf}`;

    if (!regionsMap.has(key)) {
      regionsMap.set(key, {
        nome: city,
        cidade: city,
        uf: uf,
        faturamento: 0,
        entregas: 0,
        eficiencia: 0, // Placeholder
        codCollectionRate: 0 // Placeholder
      });
    }

    const region = regionsMap.get(key)!;
    region.faturamento += Number(order.order_final_price) || 0;
    region.entregas += 1;
  });

  const regions = Array.from(regionsMap.values());

  // Calculate Graph Data (Sales over time)
  const salesMap = new Map<string, GraphDataPoint>();
  currentOrders.forEach(order => {
    if (!order.date_order) return;
    const date = new Date(order.date_order);
    const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    if (!salesMap.has(dayStr)) {
      salesMap.set(dayStr, {
        dia: dayStr,
        projetado: 1000, // Mock projection
        realizado: 0,
        cashCollected: 0
      });
    }

    const point = salesMap.get(dayStr)!;
    point.realizado += Number(order.order_final_price) || 0;
    if (order.payment_status === 'Collected') {
      point.cashCollected += Number(order.cod_amount) || 0;
    }
  });

  const graficoVendas = Array.from(salesMap.values());

  return {
    kpis,
    graficoVendas,
    orders: currentOrders,
    regions,
    expenses
  };
};