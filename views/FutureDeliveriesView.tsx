import React, { useState, useEffect } from 'react';
import { Calendar, Edit2, Save, X, Phone, Package, Plus, Search, Clock, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Order } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import Toast, { ToastType } from '../components/Toast';

// --- Types ---
interface FutureDeliveriesViewProps {
    orders: Order[];
    onUpdateNote: (orderId: number, note: string) => void;
    onAddOrder: (newOrder: any) => Promise<void>;
    onEditOrder: (order: Order) => void;
    onDeleteOrder: (id: number) => void;
    onCompleteOrder: (id: number) => void;
    dateRange: { start: string; end: string };
}

// --- Sub-component: Delivery Card ---
// Isolated to handle its own local state for immediate feedback
const DeliveryCard: React.FC<{
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: number) => void;
    onComplete: (id: number) => void;
    onUpdateNote: (id: number, note: string) => void;
}> = ({ order, onEdit, onDelete, onComplete, onUpdateNote }) => {
    const [isCompletedLocal, setIsCompletedLocal] = useState(
        order.order_status === 'Entregue' || order.order_status === 'concluido'
    );
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteText, setNoteText] = useState(order.notes || '');

    // Sync local state if prop changes (e.g. after refresh)
    useEffect(() => {
        setIsCompletedLocal(order.order_status === 'Entregue' || order.order_status === 'concluido');
    }, [order.order_status]);

    const handleComplete = () => {
        if (isCompletedLocal) return;
        setIsCompletedLocal(true); // Optimistic update
        onComplete(order.id);
    };

    const handleSaveNote = () => {
        onUpdateNote(order.id, noteText);
        setIsEditingNote(false);
    };

    return (
        <GlassCard
            className={`p-6 transition-all duration-300 ${isCompletedLocal ? 'border-emerald-500 bg-emerald-50/30' : 'hover:border-emerald-500/30'}`}
        >
            <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Main Info */}
                <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl shadow-sm transition-transform duration-300 ${isCompletedLocal ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-blue-50 text-blue-600 group-hover:scale-110'}`}>
                        {isCompletedLocal ? <CheckCircle size={28} /> : <Calendar size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-slate-800 text-xl font-display">{order.client_name}</h3>
                            <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-lg font-medium">#{order.id}</span>
                            {isCompletedLocal && (
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 animate-in fade-in zoom-in">
                                    <CheckCircle size={12} /> CONCLUÍDO
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {order.client_phone}</span>
                            <span className="flex items-center gap-1.5"><Package size={14} className="text-slate-400" /> {order.product_name} ({order.order_quantity}x)</span>
                        </div>
                        <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit border ${isCompletedLocal ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : 'text-emerald-600 bg-emerald-50/50 border-emerald-100'}`}>
                            <Clock size={16} />
                            <span className="font-bold text-sm">Previsão: {formatDate(order.date_delivery)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div
                    className="flex-1 bg-amber-50/50 border border-amber-100 rounded-xl p-4 relative group/note cursor-pointer hover:bg-amber-50 transition-all"
                    onClick={() => setIsEditingNote(true)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                            <Edit2 size={12} /> Anotações do Cliente
                        </span>
                    </div>

                    {isEditingNote ? (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="w-full p-2 text-sm border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                placeholder="Adicione uma nota..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveNote();
                                    if (e.key === 'Escape') setIsEditingNote(false);
                                }}
                            />
                            <button onClick={handleSaveNote} className="text-emerald-600 hover:bg-emerald-100 p-2 rounded-lg transition-colors"><Save size={18} /></button>
                            <button onClick={() => setIsEditingNote(false)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"><X size={18} /></button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600 italic min-h-[20px] leading-relaxed">
                            {order.notes || "Nenhuma anotação. Clique para adicionar manualmente."}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-3 border-l border-slate-100 pl-6 min-w-[180px]">
                    <div className="text-right mb-1">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Valor a Receber</p>
                        <p className="font-bold text-slate-800 text-xl font-display">{formatCurrency(order.cod_amount)}</p>
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={isCompletedLocal}
                        className={`text-sm px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isCompletedLocal
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-emerald-500/20 shadow-slate-900/10'
                            }`}
                    >
                        <CheckCircle size={16} />
                        {isCompletedLocal ? 'Entregue' : 'Confirmar Entrega'}
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(order)}
                            className="flex-1 text-slate-500 text-sm px-3 py-2 rounded-xl font-medium hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-slate-200"
                        >
                            <Edit2 size={14} /> Editar
                        </button>
                        <button
                            onClick={() => onDelete(order.id)}
                            className="text-red-400 text-sm px-3 py-2 rounded-xl font-medium hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                            title="Excluir"
                        >
                            <Trash2 size={16} /> Excluir
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// --- Main Component ---
const FutureDeliveriesView: React.FC<FutureDeliveriesViewProps> = ({
    orders,
    onUpdateNote,
    onAddOrder,
    onEditOrder,
    onDeleteOrder,
    onCompleteOrder,
    dateRange
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    // Delete Confirmation Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type, isVisible: true });
    };

    // Form State
    const [formData, setFormData] = useState({
        client_name: '',
        client_phone: '',
        product_name: '',
        order_quantity: 1,
        date_delivery: '',
        cod_amount: 0,
        notes: ''
    });

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        if (!order.date_delivery) return false;
        const orderDateStr = new Date(order.date_delivery).toISOString().split('T')[0];
        const startStr = dateRange.start ? new Date(dateRange.start).toISOString().split('T')[0] : null;
        const endStr = dateRange.end ? new Date(dateRange.end).toISOString().split('T')[0] : null;
        const matchesDate = (!startStr || orderDateStr >= startStr) && (!endStr || orderDateStr <= endStr);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            order.client_name.toLowerCase().includes(searchLower) ||
            order.client_phone.includes(searchTerm) ||
            order.product_name.toLowerCase().includes(searchLower);
        return matchesDate && matchesSearch;
    }).sort((a, b) => new Date(a.date_delivery).getTime() - new Date(b.date_delivery).getTime());

    // Handlers
    const handleOpenAdd = () => {
        setIsEditingOrder(false);
        setCurrentOrderId(null);
        setFormData({
            client_name: '',
            client_phone: '',
            product_name: '',
            order_quantity: 1,
            date_delivery: new Date().toISOString().split('T')[0],
            cod_amount: 0,
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (order: Order) => {
        setIsEditingOrder(true);
        setCurrentOrderId(order.id);
        setFormData({
            client_name: order.client_name,
            client_phone: order.client_phone,
            product_name: order.product_name,
            order_quantity: order.order_quantity,
            date_delivery: new Date(order.date_delivery).toISOString().split('T')[0],
            cod_amount: order.cod_amount,
            notes: order.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setOrderToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (orderToDelete) {
            onDeleteOrder(orderToDelete);
            showToast('Entrega excluída com sucesso!', 'success');
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
            setIsModalOpen(false); // Close edit modal if open
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setOrderToDelete(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_name.trim()) return showToast('Nome do cliente é obrigatório.', 'error');
        if (!formData.date_delivery) return showToast('Data de entrega é obrigatória.', 'error');

        setIsLoading(true);
        try {
            const orderData = {
                client_name: formData.client_name,
                client_phone: formData.client_phone,
                product_name: formData.product_name,
                order_quantity: Number(formData.order_quantity),
                date_delivery: new Date(formData.date_delivery).toISOString(),
                cod_amount: Number(formData.cod_amount),
                notes: formData.notes
            };

            if (isEditingOrder && currentOrderId) {
                const existingOrder = orders.find(o => o.id === currentOrderId);
                if (existingOrder) {
                    onEditOrder({ ...existingOrder, ...orderData });
                    showToast('Agendamento atualizado!', 'success');
                }
            } else {
                await onAddOrder({
                    ...orderData,
                    order_final_price: orderData.cod_amount,
                    // Defaults
                    client_email: '',
                    client_document: '',
                    client_zip_code: '',
                    client_address: '',
                    client_address_number: '',
                    client_address_district: '',
                    client_address_city: '',
                    client_address_state: '',
                    client_address_comp: '',
                    product_code: 'MANUAL',
                    logistic_operator: 'Manual',
                    delivery_man: 'Manual'
                });
                showToast('Entrega agendada!', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">Futuras Entregas</h2>
                        <p className="text-slate-500 mt-1">Gerencie agendamentos e entregas futuras</p>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold active:scale-95"
                    >
                        <Plus size={20} />
                        Nova Entrega
                    </button>
                </div>

                {/* Filters */}
                <GlassCard className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, telefone ou produto..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </GlassCard>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <DeliveryCard
                                key={order.id}
                                order={order}
                                onEdit={handleOpenEdit}
                                onDelete={handleDelete}
                                onComplete={onCompleteOrder}
                                onUpdateNote={onUpdateNote}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Search size={40} className="opacity-50" />
                                </div>
                                <p className="text-lg font-medium text-slate-600">Nenhum agendamento encontrado</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <GlassCard className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 p-0">
                            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800 font-display">
                                    {isEditingOrder ? 'Editar Agendamento' : 'Agendar Nova Entrega'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Form fields... simplified for brevity but keeping structure */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome do Cliente *</label>
                                    <input
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        value={formData.client_name}
                                        onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Telefone</label>
                                        <input
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.client_phone}
                                            onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Data Entrega *</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.date_delivery}
                                            onChange={e => setFormData({ ...formData, date_delivery: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Produto</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        value={formData.product_name}
                                        onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Quantidade</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.order_quantity}
                                            onChange={e => setFormData({ ...formData, order_quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Valor (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.cod_amount}
                                            onChange={e => setFormData({ ...formData, cod_amount: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Observações</label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    {isEditingOrder && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (currentOrderId) handleDelete(currentOrderId);
                                                setIsModalOpen(false);
                                            }}
                                            disabled={isLoading}
                                            className="px-4 py-3 border border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                                            title="Excluir Agendamento"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isLoading}
                                        className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            isEditingOrder ? 'Salvar Alterações' : 'Agendar Entrega'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <GlassCard className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 p-0">
                            <div className="bg-red-50/80 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-red-800 font-display flex items-center gap-2">
                                    <Trash2 size={20} />
                                    Confirmar Exclusão
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-700 text-base mb-6">
                                    Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cancelDelete}
                                        className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Sim, Excluir
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default FutureDeliveriesView;

