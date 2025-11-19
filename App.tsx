import React, { useState, useMemo } from 'react';
import DashboardHome from './views/DashboardHome';
import OrdersView from './views/OrdersView';
import LogisticsView from './views/LogisticsView';
import FinancialView from './views/FinancialView';
import FutureDeliveriesView from './views/FutureDeliveriesView';
import FilterModal from './components/FilterModal';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import FilterBar from './components/FilterBar';
import { useDashboard } from './hooks/useDashboard';
import { calculateDashboardData } from './utils/dashboardCalculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  const { loading, orders, futureOrders, expenses, actions } = useDashboard();

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

  const handleApplyFilters = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  // Apply Global Filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
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
  }, [orders, dateRange, globalSearch]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (!dateRange.start || !dateRange.end) return true;
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      const start = new Date(dateRange.start).toISOString().split('T')[0];
      const end = new Date(dateRange.end).toISOString().split('T')[0];
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses, dateRange]);

  // Recalculate Dashboard Data
  const currentDashboardData = useMemo(() => {
    return calculateDashboardData(filteredOrders, filteredExpenses);
  }, [filteredOrders, filteredExpenses]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome data={currentDashboardData} />;
      case 'pedidos':
        return (
          <OrdersView
            orders={orders}
            dateRange={dateRange}
            onCreateOrder={actions.createOrder}
            onUpdateOrder={actions.updateOrder}
            globalSearchTerm={globalSearch}
          />
        );
      case 'logistica':
        return <LogisticsView orders={filteredOrders} />;
      case 'financeiro':
        return (
          <FinancialView
            data={currentDashboardData}
            onAddExpense={actions.addExpense}
            onDeleteExpense={actions.deleteExpense}
          />
        );
      case 'futuras':
        return (
          <FutureDeliveriesView
            orders={futureOrders}
            onUpdateNote={actions.updateFutureNote}
            onAddOrder={actions.addFutureOrder}
            onEditOrder={actions.updateFutureOrder}
            onDeleteOrder={actions.deleteFutureDelivery}
            onCompleteOrder={actions.completeFutureDelivery}
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

      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        onOpenFilter={() => setIsFilterModalOpen(true)}
      />

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <FilterBar dateRange={dateRange} onOpenFilter={() => setIsFilterModalOpen(true)} />
        {renderContent()}
      </div>
    </div>
  );
}