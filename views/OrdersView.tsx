import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Package, Clock, Edit2, Filter, X, Trash2, Loader2, MessageCircle, Phone, Calendar, Truck, CheckCircle } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import OrderModal from '../components/OrderModal';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { supabase } from '../lib/supabaseClient';
import Toast, { ToastType } from '../components/Toast';

interface OrdersViewProps {
  orders: Order[]; // Kept for initial load or fallback, but we'll fetch our own
  dateRange: { start: string; end: string };
  onCreateOrder: (order: Partial<Order>) => Promise<void>;
  onUpdateOrder: (order: Partial<Order>) => Promise<void>;
  globalSearchTerm?: string;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders: initialOrders, dateRange, onCreateOrder, onUpdateOrder, globalSearchTerm }) => {
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Sync global search term
  useEffect(() => {
    if (globalSearchTerm !== undefined) {
      setSearchTerm(globalSearchTerm);
    }
  }, [globalSearchTerm]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('date_order', dateRange.start)
        .lte('date_order', dateRange.end)
        .order('date_order', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        showToast('Erro ao carregar pedidos', 'error');
        return;
      }

      const mapped: Order[] = (data || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at || new Date().toISOString(),
        order_number: item.order_number || `ORD-${item.id}`,
        client_name: item.client_name || '',
        client_phone: item.client_phone || '',
        product_name: item.product_name || '',
        order_quantity: item.order_quantity || 1,
        order_final_price: item.order_final_price || 0,
        commission: item.commission || 0,
        date_order: item.date_order || '',
        date_delivery: item.date_delivery || '',
        order_status: item.order_status || 'Pendente',
        payment_status: item.payment_status || 'Pending',
        cod_amount: item.cod_amount || 0,
        notes: item.notes || ''
      }));

      setLocalOrders(mapped);
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('Erro inesperado ao carregar pedidos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = localOrders.filter(order => {
    const matchesSearch =
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_phone.includes(searchTerm) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const displayedOrders = filteredOrders;

  const handleNewOrderClick = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Pedido excluído com sucesso!', 'success');
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Erro ao excluir pedido', 'error');
    }
  };

  const handleSaveOrder = async (order: Partial<Order>) => {
    try {
      if (editingOrder) {
        await onUpdateOrder({ ...order, id: editingOrder.id });
      } else {
        await onCreateOrder(order);
      }
      showToast(editingOrder ? 'Pedido atualizado!' : 'Pedido criado!', 'success');
      setIsModalOpen(false);
      setEditingOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      showToast('Erro ao salvar pedido', 'error');
    }
  };

  const statuses = ['Todos', 'Agendado', 'Em Trânsito', 'Entregue', 'Pendente', 'Cancelado'];

  // Updated getStatusColor with exact colors requested
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue':
      case 'Completo':
      case 'Collected':
        return 'border-green-200 bg-green-50';
      case 'Agendado':
        return 'border-blue-200 bg-blue-50';
      case 'Em Trânsito':
      case 'Remitted':
        return 'border-orange-200 bg-orange-50';
      case 'Cancelado':
      case 'Devolvido':
      case 'Failed':
      case 'Extraviado':
        return 'border-red-200 bg-red-50';
      case 'Pendente':
      case 'Pending':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  // Helper to sanitize phone number for WhatsApp
  const sanitizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Helper to generate WhatsApp message based on status
  const getWhatsAppMessage = (order: Order): string => {
    const clientName = order.client_name.split(' ')[0];
    const deliveryDate = new Date(order.date_delivery).toLocaleDateString('pt-BR');

    switch (order.order_status) {
      case 'Agendado':
        return `Olá ${clientName}, confirmando sua entrega para o dia ${deliveryDate}. Qualquer dúvida, estamos à disposição!`;
      case 'Em Trânsito':
        return `Olá ${clientName}, seu pedido saiu para entrega! Em breve chegará até você.`;
      case 'Pendente':
        return `Olá ${clientName}, precisamos resolver uma pendência com seu pedido. Poderia entrar em contato conosco?`;
      case 'Entregue':
      case 'Completo':
        return `Olá ${clientName}, esperamos que tenha gostado do seu pedido! Caso precise de algo, estamos aqui.`;
      case 'Cancelado':
        return `Olá ${clientName}, notamos que seu pedido foi cancelado. Podemos ajudar em algo?`;
      default:
        return `Olá ${clientName}, entrando em contato sobre seu pedido #${order.id}.`;
    }
  };

  // Helper to generate WhatsApp link
  const getWhatsAppLink = (order: Order): string => {
    const phone = sanitizePhone(order.client_phone);
    const message = encodeURIComponent(getWhatsAppMessage(order));
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <PageTransition>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {isModalOpen && (
        <OrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
          onSave={handleSaveOrder}
          initialOrder={editingOrder}
        />
      )}

      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">Pedidos</h2>
            <p className="text-slate-500 mt-1">Gerencie seus pedidos e acompanhe o status.</p>
          </div>
          <button
            onClick={handleNewOrderClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
          >
            <Plus size={20} /> Novo Pedido
          </button>
        </div>

        {/* Filters Section */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou produto..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
              <span className="font-medium hidden md:inline">Filtros</span>
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === status
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500/30'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Orders Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedOrders.map((order) => {
              // Helper to get icon based on status
              const getStatusIcon = () => {
                switch (order.order_status) {
                  case 'Em Trânsito':
                    return <Truck size={16} className="text-orange-600" />;
                  case 'Entregue':
                  case 'Completo':
                    return <CheckCircle size={16} className="text-green-600" />;
                  case 'Agendado':
                    return <Calendar size={16} className="text-blue-600" />;
                  case 'Pendente':
                    return <Clock size={16} className="text-gray-600" />;
                  case 'Cancelado':
                    return <X size={16} className="text-red-600" />;
                  default:
                    return <Package size={16} className="text-slate-600" />;
                }
              };

              // Helper to get dynamic date/info based on status
              const getDynamicInfo = () => {
                const deliveryDate = new Date(order.date_delivery).toLocaleDateString('pt-BR');

                switch (order.order_status) {
                  case 'Agendado':
                    return (
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <Calendar size={14} />
                        <span className="font-medium">Previsto: {deliveryDate}</span>
                      </div>
                    );
                  case 'Entregue':
                  case 'Completo':
                    return (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        <CheckCircle size={14} />
                        <span className="font-medium">Entregue em: {deliveryDate}</span>
                      </div>
                    );
                  case 'Cancelado':
                    return order.notes ? (
                      <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        <X size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="font-medium line-clamp-2">{order.notes}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        <X size={14} />
                        <span className="font-medium">Pedido cancelado</span>
                      </div>
                    );
                  case 'Em Trânsito':
                    return (
                      <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                        <Truck size={14} />
                        <span className="font-medium">Em rota de entrega</span>
                      </div>
                    );
                  default:
                    return (
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Clock size={14} />
                        <span className="font-medium">Data: {deliveryDate}</span>
                      </div>
                    );
                }
              };

              return (
                <GlassCard
                  key={order.id}
                  className={`p-5 flex flex-col justify-between group transition-all hover:shadow-lg ${getStatusColor(order.order_status)}`}
                >
                  {/* Header do Card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm border border-slate-200">
                        {order.client_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-1" title={order.client_name}>
                          {order.client_name}
                        </h3>
                        {/* Phone Number */}
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                          <Phone size={12} />
                          <span>{order.client_phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon()}
                    </div>
                  </div>

                  {/* Dynamic Status Info */}
                  <div className="mb-4">
                    {getDynamicInfo()}
                  </div>

                  {/* Detalhes do Pedido */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Produto:</span>
                      <span className="font-medium text-slate-700 text-right line-clamp-1 w-32" title={order.product_name}>{order.product_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Valor:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(order.order_final_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Comissão:</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(order.commission)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="pt-4 border-t border-slate-200 flex gap-2">
                    {/* WhatsApp Button */}
                    <a
                      href={getWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <button
                      onClick={() => handleEditClick(order)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/80 text-slate-600 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(order.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Pedido"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {!isLoading && displayedOrders.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <Search size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-slate-600">Nenhum pedido encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca ou status.</p>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default OrdersView;