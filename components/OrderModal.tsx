import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Order } from '../types';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Partial<Order>) => void;
    initialOrder?: Order | null;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, initialOrder }) => {
    const [formData, setFormData] = useState<Partial<Order>>({
        client_name: '',
        client_phone: '',
        product_name: '',
        order_quantity: 1,
        order_final_price: 0,
        order_status: 'Agendado',
        payment_status: 'Pending',
        cod_amount: 0,
        date_delivery: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (initialOrder) {
            setFormData({
                ...initialOrder,
                date_delivery: initialOrder.date_delivery ? new Date(initialOrder.date_delivery).toISOString().split('T')[0] : ''
            });
        } else {
            setFormData({
                client_name: '',
                client_phone: '',
                product_name: '',
                order_quantity: 1,
                order_final_price: 0,
                order_status: 'Agendado',
                payment_status: 'Pending',
                cod_amount: 0,
                date_delivery: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialOrder, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">
                        {initialOrder ? 'Editar Pedido' : 'Novo Pedido'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            value={formData.client_name}
                            onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                            placeholder="Nome do cliente"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            value={formData.client_phone}
                            onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                value={formData.product_name}
                                onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                                placeholder="Nome do produto"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                value={formData.order_quantity}
                                onChange={e => setFormData({ ...formData, order_quantity: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Final (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                value={formData.order_final_price}
                                onChange={e => setFormData({ ...formData, order_final_price: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor COD (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                value={formData.cod_amount}
                                onChange={e => setFormData({ ...formData, cod_amount: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                value={formData.order_status}
                                onChange={e => setFormData({ ...formData, order_status: e.target.value })}
                            >
                                <option value="Agendado">Agendado</option>
                                <option value="Em Trânsito">Em Trânsito</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Cancelado">Cancelado</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Devolvido">Devolvido</option>
                                <option value="Extraviado">Extraviado</option>
                                <option value="Reembolsado">Reembolsado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pagamento</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                value={formData.payment_status}
                                onChange={e => setFormData({ ...formData, payment_status: e.target.value as any })}
                            >
                                <option value="Pending">Pendente</option>
                                <option value="Collected">Recebido</option>
                                <option value="Remitted">Repassado</option>
                                <option value="Failed">Falhou</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Entrega</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            value={formData.date_delivery ? String(formData.date_delivery).split('T')[0] : ''}
                            onChange={e => setFormData({ ...formData, date_delivery: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;
