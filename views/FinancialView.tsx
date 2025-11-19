import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowDownRight, Trash2, ArrowUpRight, DollarSign, CreditCard } from 'lucide-react';
import { DashboardData, Expense, Order } from '../types';
import { theme } from '../constants';
import { formatCurrency } from '../utils/formatters';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';

interface FinancialViewProps {
  data: DashboardData;
  onAddExpense: (expense: any) => void;
  onDeleteExpense: (id: number) => void;
}

const FinancialView: React.FC<FinancialViewProps> = ({ data, onAddExpense, onDeleteExpense }) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ nome: '', valor: '', categoria: 'Marketing', data: new Date().toISOString().split('T')[0] });

  // 1. Calculate Revenue (Entradas) - Only 'Collected' commissions
  const collectedOrders = data.orders.filter(o => o.payment_status === 'Collected');
  const totalEntradas = collectedOrders.reduce((acc, order) => acc + (Number(order.commission) || 0), 0);

  // 2. Calculate Expenses (Saídas) - From expenses table
  const totalSaidas = data.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 3. Calculate Net Profit (Lucro Líquido)
  const saldoLiquido = totalEntradas - totalSaidas;

  // 4. Calculate Future Revenue (A Receber) - Commissions not yet collected
  const futureRevenue = data.orders
    .filter(o => o.payment_status !== 'Collected' && o.payment_status !== 'Failed' && o.order_status !== 'Cancelado')
    .reduce((acc, order) => acc + (Number(order.commission) || 0), 0);

  // 5. Unified Transaction List (Extrato)
  const transactions = [
    ...data.expenses.map(e => ({
      id: `exp-${e.id}`,
      originalId: e.id,
      type: 'expense',
      description: e.description,
      amount: Number(e.amount),
      date: new Date(e.date),
      category: e.category
    })),
    ...collectedOrders.map(o => ({
      id: `inc-${o.id}`,
      originalId: o.id,
      type: 'income',
      description: `Comissão #${o.order_number || o.id}`,
      amount: Number(o.commission),
      date: new Date(o.date_delivery || o.date_order || o.created_at), // Use delivery date for income if possible
      category: 'Venda'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.nome || !newExpense.valor || !newExpense.data) return;

    onAddExpense({
      description: newExpense.nome,
      amount: parseFloat(newExpense.valor),
      category: newExpense.categoria,
      date: new Date(newExpense.data).toISOString()
    });

    setNewExpense({ nome: '', valor: '', categoria: 'Marketing', data: new Date().toISOString().split('T')[0] });
    setShowExpenseForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 font-display tracking-tight">Financeiro</h2>
            <p className="text-slate-500 mt-1">Gestão completa de fluxo de caixa e despesas.</p>
          </div>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Plus size={20} /> {showExpenseForm ? 'Cancelar' : 'Nova Despesa'}
          </button>
        </div>

        {/* Formulário de Adição Rápida */}
        {showExpenseForm && (
          <GlassCard className="p-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <h3 className="font-bold text-slate-800 mb-4 font-display">Cadastrar Nova Despesa</h3>
            <form onSubmit={handleAddExpenseSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Descrição</label>
                <input
                  type="text"
                  value={newExpense.nome}
                  onChange={e => setNewExpense({ ...newExpense, nome: e.target.value })}
                  placeholder="Ex: Tráfego Pago"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Valor (R$)</label>
                <input
                  type="number"
                  value={newExpense.valor}
                  onChange={e => setNewExpense({ ...newExpense, valor: e.target.value })}
                  placeholder="0,00"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Data</label>
                <input
                  type="date"
                  value={newExpense.data}
                  onChange={e => setNewExpense({ ...newExpense, data: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl font-bold col-span-full md:col-span-4 mt-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
                Salvar Despesa
              </button>
            </form>
          </GlassCard>
        )}

        {/* KPIs Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} className="text-emerald-600" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1 font-display">Receita Confirmada</p>
                <h3 className="text-3xl font-bold text-emerald-600 font-display">{formatCurrency(totalEntradas)}</h3>
              </div>
              <div className="bg-emerald-100/80 p-3 rounded-xl text-emerald-600 backdrop-blur-sm">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full w-full animate-pulse"></div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown size={80} className="text-red-500" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1 font-display">Despesas Totais</p>
                <h3 className="text-3xl font-bold text-red-500 font-display">{formatCurrency(totalSaidas)}</h3>
              </div>
              <div className="bg-red-100/80 p-3 rounded-xl text-red-500 backdrop-blur-sm">
                <TrendingDown size={24} />
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((totalSaidas / (totalEntradas || 1)) * 100, 100)}%` }}></div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden bg-slate-900 text-white border-slate-800">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={80} className="text-white" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1 font-display">Lucro Líquido (Caixa)</p>
                <h3 className={`text-3xl font-bold font-display ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(saldoLiquido)}
                </h3>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl text-white border border-slate-700">
                <Wallet size={24} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
              Margem de lucro:
              <span className={`font-bold px-2 py-0.5 rounded-full ${saldoLiquido >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {totalEntradas > 0 ? ((saldoLiquido / totalEntradas) * 100).toFixed(1) : 0}%
              </span>
            </p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extrato Unificado */}
          <GlassCard className="lg:col-span-2 flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 font-display text-lg">Extrato de Movimentações</h3>
                <p className="text-sm text-slate-500">Histórico recente de entradas e saídas.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {transactions.length > 0 ? (
                transactions.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${item.type === 'income' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'}`}>
                        {item.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{item.description}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-medium">{item.date.toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">{item.category}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-lg font-display ${item.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                      </span>
                      {item.type === 'expense' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
                              onDeleteExpense(item.originalId);
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Excluir despesa"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CreditCard size={32} className="opacity-50" />
                  </div>
                  <p>Nenhuma movimentação registrada.</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Valores Futuros */}
          <GlassCard className="p-6 flex flex-col justify-center relative overflow-hidden border-l-4 border-l-blue-500">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <DollarSign size={120} className="text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600 w-fit mb-4">
                <CreditCard size={24} />
              </div>
              <h3 className="font-bold text-slate-800 font-display text-lg mb-1">Valores Futuros (A Receber)</h3>
              <p className="text-sm text-slate-500 mb-6">Comissões de pedidos pendentes ou em trânsito que serão creditadas em breve.</p>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Total Previsto</p>
                <h2 className="text-4xl font-bold text-blue-600 font-display">{formatCurrency(futureRevenue)}</h2>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default FinancialView;