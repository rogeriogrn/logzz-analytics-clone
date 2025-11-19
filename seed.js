import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbtvoidamngcqgvcszgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidHZvaWRhbW5nY3FndmNzemdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTA5NzAsImV4cCI6MjA3ODQ2Njk3MH0.1GONJiQP-o-A5-nRfaazUgqGVIzY-97LJsPd1zVGCmQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const mockOrders = [
    {
        cliente: 'João Silva',
        telefone: '(11) 99999-9999',
        produto: 'Kit 3 Potes',
        qtd: 1,
        valor: 197.00,
        comissao: 50.00,
        status: 'Entregue',
        paymentStatus: 'Collected',
        codAmount: 197.00,
        dataRaw: '2025-11-11',
        hora: '10:30'
    },
    {
        cliente: 'Maria Oliveira',
        telefone: '(21) 98888-8888',
        produto: 'Kit 5 Potes',
        qtd: 1,
        valor: 297.00,
        comissao: 80.00,
        status: 'Em Trânsito',
        paymentStatus: 'Pending',
        codAmount: 297.00,
        dataRaw: '2025-11-12',
        hora: '14:15'
    },
    {
        cliente: 'Carlos Souza',
        telefone: '(31) 97777-7777',
        produto: 'Kit 1 Pote',
        qtd: 2,
        valor: 194.00,
        comissao: 40.00,
        status: 'Pendente',
        paymentStatus: 'Pending',
        codAmount: 194.00,
        dataRaw: '2025-11-13',
        hora: '09:00'
    },
    {
        cliente: 'Ana Costa',
        telefone: '(41) 96666-6666',
        produto: 'Kit 3 Potes',
        qtd: 1,
        valor: 197.00,
        comissao: 50.00,
        status: 'Cancelado',
        paymentStatus: 'Failed',
        codAmount: 0,
        dataRaw: '2025-11-14',
        hora: '16:45'
    },
    {
        cliente: 'Pedro Santos',
        telefone: '(51) 95555-5555',
        produto: 'Kit 5 Potes',
        qtd: 1,
        valor: 297.00,
        comissao: 80.00,
        status: 'Entregue',
        paymentStatus: 'Remitted',
        codAmount: 297.00,
        dataRaw: '2025-11-15',
        hora: '11:20'
    },
    {
        cliente: 'Lucia Ferreira',
        telefone: '(61) 94444-4444',
        produto: 'Kit 1 Pote',
        qtd: 3,
        valor: 291.00,
        comissao: 60.00,
        status: 'Agendado',
        paymentStatus: 'Pending',
        codAmount: 291.00,
        dataRaw: '2025-11-16',
        hora: '13:10'
    },
    {
        cliente: 'Marcos Lima',
        telefone: '(71) 93333-3333',
        produto: 'Kit 3 Potes',
        qtd: 1,
        valor: 197.00,
        comissao: 50.00,
        status: 'Em Trânsito',
        paymentStatus: 'Pending',
        codAmount: 197.00,
        dataRaw: '2025-11-17',
        hora: '15:30'
    },
    {
        cliente: 'Fernanda Alves',
        telefone: '(81) 92222-2222',
        produto: 'Kit 5 Potes',
        qtd: 1,
        valor: 297.00,
        comissao: 80.00,
        status: 'Pendente',
        paymentStatus: 'Pending',
        codAmount: 297.00,
        dataRaw: '2025-11-18',
        hora: '10:00'
    }
];

async function seed() {
    console.log('Seeding database...');

    // Insert Orders
    const ordersToInsert = mockOrders.map((order, index) => ({
        order_number: `ORD-${Date.now()}-${index}`,
        client_name: order.cliente,
        client_phone: order.telefone,
        product_name: order.produto,
        product_code: 'MOCK-PROD',
        order_quantity: order.qtd,
        order_final_price: order.valor,
        order_status: order.status,
        date_order: new Date(`${order.dataRaw}T${order.hora}:00`).toISOString(),
        date_delivery: new Date(new Date(`${order.dataRaw}T${order.hora}:00`).getTime() + 86400000 * 2).toISOString(), // Delivery 2 days later
        commission: order.comissao,
        payment_status: order.paymentStatus,
        cod_amount: order.codAmount,
        client_address: 'Endereço Mock',
        client_address_city: 'Cidade Mock',
        client_address_state: 'UF',
        logistic_operator: 'Logzz Logística',
        delivery_man: 'Entregador Mock'
    }));

    const { error: ordersError } = await supabase.from('orders').insert(ordersToInsert);
    if (ordersError) console.error('Error seeding orders:', ordersError);
    else console.log('Orders seeded successfully!');

    // Insert Future Deliveries
    const futureDeliveries = [
        {
            client_name: 'Roberto Gomes',
            client_phone: '(11) 91111-1111',
            product_name: 'Kit 3 Potes',
            quantity: 1,
            delivery_date: new Date('2025-11-20T09:00:00').toISOString(),
            cod_amount: 197.00,
            notes: 'Ligar antes'
        },
        {
            client_name: 'Camila Dias',
            client_phone: '(21) 92222-2222',
            product_name: 'Kit 5 Potes',
            quantity: 1,
            delivery_date: new Date('2025-11-21T14:00:00').toISOString(),
            cod_amount: 297.00,
            notes: 'Portaria'
        }
    ];

    const { error: futureError } = await supabase.from('future_deliveries').insert(futureDeliveries);
    if (futureError) console.error('Error seeding future deliveries:', futureError);
    else console.log('Future deliveries seeded successfully!');
}

seed();
