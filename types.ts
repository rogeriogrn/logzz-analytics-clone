export type OrderStatus =
  | "Agendado"
  | "Reagendado"
  | "Atrasado"
  | "Completo"
  | "Frustrado"
  | "Cancelado"
  | "A enviar"
  | "Enviando"
  | "Enviado"
  | "Reembolsado"
  | "Confirmado"
  | "Em aberto"
  | "A reagendar"
  | "Em separação"
  | "Em rota"
  | "A caminho"
  | "Estoque insuficiente";

export interface Order {
  id: number;
  created_at: string;
  order_number: string;
  order_status: OrderStatus | string; // Allow string for flexibility but prefer the union
  order_final_price: number;
  order_quantity: number;
  date_order: string;
  date_delivery: string;
  client_name: string;
  client_email?: string;
  client_document?: string;
  client_phone: string;
  client_zip_code?: string;
  client_address?: string;
  client_address_number?: string;
  client_address_district?: string;
  client_address_city?: string;
  client_address_state?: string;
  client_address_comp?: string;
  product_name: string;
  product_code?: string;
  commission: number;
  producer_commission?: number;
  logistic_operator?: string;
  delivery_man?: string;
  payment_status: 'Pending' | 'Collected' | 'Remitted' | 'Failed';
  cod_amount: number;
  notes?: string;
}

export interface Region {
  nome: string;
  cidade: string;
  uf: string;
  faturamento: number;
  entregas: number;
  eficiencia: number;
  codCollectionRate: number; // Percentage of COD orders successfully collected
}

export interface KPIs {
  faturamentoReal: number;
  comissaoTotal: number;
  totalVendas: number;
  cashToCollect: number; // Dinheiro na Rua
  cashCollected: number; // Dinheiro em Caixa (Agentes)
  remittancePending: number; // A Repassar
  averageOrderValue: number; // Ticket Médio
  deliverySuccessRate: number; // Taxa de Entrega
}

export interface GraphDataPoint {
  dia: string;
  projetado: number;
  realizado: number;
  cashCollected: number;
}

export interface DashboardData {
  kpis: KPIs;
  graficoVendas: GraphDataPoint[];
  orders: Order[];
  regions: Region[];
  expenses: Expense[];
}

export interface Expense {
  id: number;
  created_at?: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: string;
}