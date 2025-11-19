import { useState, useEffect, useCallback } from 'react';
import { Order, Expense } from '../types';
import { supabase } from '../lib/supabaseClient';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [futureOrders, setFutureOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchData = useCallback(async () => {
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

      // Map Future Deliveries
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
      setExpenses(expensesData as Expense[] || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---

  const createOrder = async (newOrder: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          ...newOrder,
          order_number: `ORD-${Date.now()}`,
          created_at: new Date().toISOString(),
          date_order: new Date().toISOString()
        }]);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const updateOrder = async (updatedOrder: Partial<Order>) => {
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

  const addFutureOrder = async (newOrderData: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('future_deliveries')
        .insert([{
          client_name: newOrderData.client_name,
          client_phone: newOrderData.client_phone,
          product_name: newOrderData.product_name,
          quantity: newOrderData.order_quantity,
          delivery_date: newOrderData.date_delivery,
          cod_amount: newOrderData.cod_amount,
          notes: newOrderData.notes
        }])
        .select();

      if (error) throw error;
      if (data) await fetchData();
    } catch (error) {
      console.error('Error adding future order:', error);
      throw error;
    }
  };

  const updateFutureOrder = async (updatedOrder: Partial<Order>) => {
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
      fetchData();
    } catch (error) {
      console.error('Error editing future order:', error);
    }
  };

  const updateFutureNote = async (orderId: number, note: string) => {
    // Optimistic update for UI responsiveness
    setFutureOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes: note } : o));
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

  const deleteFutureDelivery = async (id: number) => {
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

  const completeFutureDelivery = async (id: number) => {
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

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'created_at' | 'type'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date,
          type: 'saida'
        }]);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const deleteExpense = async (id: number) => {
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

  return {
    loading,
    orders,
    futureOrders,
    expenses,
    actions: {
      fetchData,
      createOrder,
      updateOrder,
      addFutureOrder,
      updateFutureOrder,
      updateFutureNote,
      deleteFutureDelivery,
      completeFutureDelivery,
      addExpense,
      deleteExpense
    }
  };
};