import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Package, Truck, DollarSign,
  User, Filter, Calendar, Search
} from 'lucide-react';
import { DashboardData, Order, Region, KPIs, GraphDataPoint, Expense } from './types';
import DashboardHome from './views/DashboardHome';
import OrdersView from './views/OrdersView';
import LogisticsView from './views/LogisticsView';
import FinancialView from './views/FinancialView';
import FutureDeliveriesView from './views/FutureDeliveriesView';
import { supabase } from './lib/supabaseClient';
import FilterModal from './components/FilterModal';
import { formatDate } from './utils/formatters';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [futureOrders, setFutureOrders] = useState<Order[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Global Filter State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Helper to get current month range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getCurrentMonthRange());

  const calculateDashboardData = (currentOrders: Order[]): DashboardData => {
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
      .reduce((acc, o) => acc + (Number(o.cod_amount) || 0), 0); // Simplified logic

    // New KPIs
    const averageOrderValue = totalVendas > 0 ? faturamentoReal / totalVendas : 0;

    const deliveredOrders = currentOrders.filter(o => o.order_status === 'Entregue').length;
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
      expenses: []
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch Future Deliveries
      const { data: futureData, error: futureError } = await supabase
        .from('future_deliveries')
        .select('*')
        .order('delivery_date', { ascending: true });

      if (futureError) throw futureError;

      // Map Future Deliveries to Order type for compatibility
      const mappedFutureOrders: Order[] = (futureData || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        order_number: `FUT-${item.id}`,
        order_status: item.status || 'Agendado',
        order_final_price: 0,
        order_quantity: item.quantity,
        date_order: new Date().toISOString(),
        date_delivery: item.delivery_date,
        client_name: item.client_name,
        client_phone: item.client_phone,
        product_name: item.product_name,
        commission: 0,
        payment_status: 'Pending',
        cod_amount: item.cod_amount,
        notes: item.notes,
        client_zip_code: '',
        client_address: '',
        client_address_number: '',
        client_address_district: '',
        client_address_city: '',
        client_address_state: '',
        client_address_comp: '',
        product_code: '',
        producer_commission: 0,
        logistic_operator: '',
        delivery_man: ''
      }));

      // Fetch Expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      setOrders(ordersData as Order[] || []);
      setFutureOrders(mappedFutureOrders);

      // Update Dashboard Data
      if (ordersData) {
        const dashboard = calculateDashboardData(ordersData as Order[]);
        // Add expenses to dashboard data
        dashboard.expenses = expensesData as Expense[] || [];
        setDashboardData(dashboard);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply Global Filters
  const filteredOrders = orders.filter(order => {
    if (!dateRange.start || !dateRange.end) return true;
    const orderDate = new Date(order.date_delivery || order.date_order || order.created_at).toISOString().split('T')[0];
    const start = new Date(dateRange.start).toISOString().split('T')[0];
    const end = new Date(dateRange.end).toISOString().split('T')[0];

    const matchesDate = orderDate >= start && orderDate <= end;
    const matchesSearch = globalSearch === '' ||
      order.client_name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      String(order.id).includes(globalSearch);

    return matchesDate && matchesSearch;
  });

  const filteredExpenses = (dashboardData?.expenses || []).filter((expense: Expense) => {
    if (!dateRange.start || !dateRange.end) return true;
    const expenseDate = new Date(expense.date).toISOString().split('T')[0];
    const start = new Date(dateRange.start).toISOString().split('T')[0];
    const end = new Date(dateRange.end).toISOString().split('T')[0];
    return expenseDate >= start && expenseDate <= end;
  });

  // Recalculate Dashboard Data when filters change
  const currentDashboardData = useMemo(() => {
    if (!dashboardData) return null;

    const calculated = calculateDashboardData(filteredOrders);
    return {
      ...calculated,
      expenses: filteredExpenses
    };
  }, [orders, dashboardData?.expenses, dateRange, globalSearch]);

  const handleUpdateNote = async (orderId: number, note: string) => {
    // Optimistic update
    const updatedFutureOrders = futureOrders.map(o =>
      o.id === orderId ? { ...o, notes: note } : o
    );
    setFutureOrders(updatedFutureOrders);

    try {
      const { error } = await supabase
        .from('future_deliveries')
        .update({ notes: note })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleAddOrder = async (newOrderData: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('future_deliveries')
        .insert([{
          client_name: newOrderData.client_name,
          client_phone: newOrderData.client_phone,
          product_name: newOrderData.product_name,
          quantity: newOrderData.order_quantity,
          delivery_date: newOrderData.date_delivery, // Should be ISO string
          cod_amount: newOrderData.cod_amount,
          notes: newOrderData.notes
        }])
        .select();

      if (error) throw error;

      if (data) {
        await fetchData(); // Refresh data and wait for it
      }
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const handleEditOrder = async (updatedOrder: Partial<Order>) => {
    if (!updatedOrder.id) return;
    try {
      const { error } = await supabase
        .from('future_deliveries')
        .update({
          client_name: updatedOrder.client_name,
          client_phone: updatedOrder.client_phone,
          product_name: updatedOrder.product_name,
          quantity: updatedOrder.order_quantity,
          delivery_date: updatedOrder.date_delivery,
          cod_amount: updatedOrder.cod_amount,
          notes: updatedOrder.notes
        })
        .eq('id', updatedOrder.id);

      if (error) throw error;
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error editing order:', error);
    }
  };

  const handleCreateOrder = async (newOrder: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...newOrder,
          order_number: `ORD-${Date.now()}`, // Generate a simple order number
          created_at: new Date().toISOString(),
          date_order: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Partial<Order>) => {
    if (!updatedOrder.id) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update(updatedOrder)
        .eq('id', updatedOrder.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleAddExpense = async (newExpense: Omit<Expense, 'id' | 'created_at' | 'type'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date, // Fixed: Use date from form
          type: 'saida'
        }]);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleApplyFilters = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  const handleDeleteFutureDelivery = async (id: number) => {
    try {
      const { error } = await supabase
        .from('future_deliveries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting future delivery:', error);
    }
  };

  const handleCompleteFutureDelivery = async (id: number) => {
    try {
      const { error } = await supabase
        .from('future_deliveries')
        .update({ status: 'Entregue' })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error completing future delivery:', error);
    }
  };

  const renderContent = () => {
    if (!currentDashboardData) return null;
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome data={currentDashboardData} />;
      case 'pedidos':
        return <OrdersView orders={orders} dateRange={dateRange} onCreateOrder={handleCreateOrder} onUpdateOrder={handleUpdateOrder} globalSearchTerm={globalSearch} />;
      case 'logistica':
        return <LogisticsView orders={filteredOrders} />;
      case 'financeiro':
        return <FinancialView data={currentDashboardData} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />;
      case 'futuras':
        return (
          <FutureDeliveriesView
            orders={futureOrders}
            onUpdateNote={handleUpdateNote}
            onAddOrder={handleAddOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteFutureDelivery}
            onCompleteOrder={handleCompleteFutureDelivery}
            dateRange={dateRange}
          />
        );
      default:
        return <DashboardHome data={currentDashboardData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
          <p className="text-slate-400 text-sm font-medium">Carregando dados Logzz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialStartDate={dateRange.start}
        initialEndDate={dateRange.end}
      />

      {/* Topbar Navegação */}
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

          <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
            {[
              { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
              { id: 'pedidos', label: 'Pedidos', icon: Package },
              { id: 'logistica', label: 'Logística', icon: Truck },
              { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
              { id: 'futuras', label: 'Futuras Entregas', icon: Calendar },
            ].map((tab) => (
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
              onClick={() => setIsFilterModalOpen(true)}
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

      {/* Menu Mobile */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2 flex justify-around overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Geral', icon: LayoutDashboard },
          { id: 'pedidos', label: 'Pedidos', icon: Package },
          { id: 'logistica', label: 'Logística', icon: Truck },
          { id: 'financeiro', label: 'Finan.', icon: DollarSign },
          { id: 'futuras', label: 'Futuras', icon: Calendar },
        ].map((tab) => (
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

      {/* Área de Filtros Globais */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
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
            onClick={() => setIsFilterModalOpen(true)}
            className="ml-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-emerald-200"
          >
            <Filter size={16} /> Filtros
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        {renderContent()}

      </div>
    </div>
  );
}