import fetch from 'node-fetch';
import crypto from 'crypto';

const VINDI_API_URL = process.env.VINDI_API_URL;
const VINDI_API_TOKEN = process.env.VINDI_API_TOKEN;

if (!VINDI_API_URL || !VINDI_API_TOKEN) {
  console.error("FATAL ERROR: As variáveis de ambiente VINDI_API_URL e VINDI_API_TOKEN são obrigatórias.");
  process.exit(1);
}

// AJUSTE: Adicionada a propriedade 'phone'
interface PaymentData {
  amount: number;
  paymentMethod: 'credit_card' | 'pix';
  customer: { name: string; email: string; cpf: string; phone: string; };
  shipping: any;
  cartItems: any[];
  cardToken?: string;
}

export async function createVindiTransaction(data: PaymentData) {
  if (data.paymentMethod === 'pix' && data.amount < 1) {
    throw new Error('O valor mínimo para pagamentos com PIX é de R$ 1,00.');
  }

  const requestBody = {
    token_account: VINDI_API_TOKEN,
    customer: {  
      name: data.customer.name,
      email: data.customer.email,
      cpf: data.customer.cpf.replace(/[^\d]/g, ''),
      // AJUSTE: Usando o telefone do formulário para preencher o campo de contatos dinamicamente
      contacts: data.customer.phone ? [
        { 
          type_contact: "M", // M = Celular
          number_contact: data.customer.phone.replace(/[^\d]/g, '') 
        } 
      ] : [],
      addresses: [
        {  
          type_address: "B",
          postal_code: data.shipping.cep.replace(/[^\d]/g, ''),
          street: data.shipping.rua,
          number: data.shipping.numero,
          completion: data.shipping.complemento,
          neighborhood: data.shipping.bairro,
          city: data.shipping.cidade,
          state: data.shipping.estado,
        }
      ],
    },
    transaction_product: data.cartItems.map(item => ({
      description: item.product.name,
      quantity: String(item.quantity),
      price_unit: parseFloat(item.product.price).toFixed(2),
      code: item.productId,
      sku_code: item.productId,
    })),
    transaction: {
      customer_ip: "127.0.0.1",
      order_number: `LOJA-${crypto.randomBytes(6).toString('hex')}`,
      available_payment_methods: "2,3,4,5,6,7,14,15,16,18,19,21,22,23,27",
      shipping_type: "A combinar",
      shipping_price: "0.00",
      url_notification: `${process.env.BASE_URL || 'http://localhost:5000'}/api/webhook/notification`,
    },
    payment: {
      payment_method_id: data.paymentMethod === 'pix' ? "27" : "3", 
      ...(data.paymentMethod === 'credit_card' && {
        card_token: data.cardToken,
        split: 1,
      }),
    }
  };

  try {
    console.log(`[Backend] Tentando chamar a Vindi em: POST ${VINDI_API_URL}`);
    const response = await fetch(VINDI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const responseData = await response.json() as any;
    if (!response.ok) {
      console.error("=================================================");
      console.error("ERRO: A API da Vindi retornou um status não-OK:", response.status, response.statusText);
      console.error("Conteúdo da resposta:", JSON.stringify(responseData, null, 2));
      console.error("=================================================");
      const errorMessage = responseData?.error_response?.general_errors?.[0]?.message || responseData?.error_response?.validation_errors?.[0]?.message || 'Falha na API da Vindi';
      throw new Error(errorMessage);
    }
    return responseData;
  } catch (error) {
    console.error("Erro ao chamar a API da Vindi:", error);
    throw new Error('Não foi possível conectar ao serviço de pagamento.');
  }
}

export async function getVindiTransaction(token_transaction: string) {
  try {
    const baseUrl = VINDI_API_URL?.split('/api/')[0];
    if (!baseUrl) throw new Error("URL base da API não configurada corretamente.");

    const fullApiUrl = `${baseUrl}/api/v3/transactions/get_by_token?token_account=${VINDI_API_TOKEN}&token_transaction=${token_transaction}`;
    console.log(`[Backend] Tentando consultar transação na Vindi em: GET ${fullApiUrl}`);

    const response = await fetch(fullApiUrl, {
      method: 'GET',
    });
    const responseData = await response.json() as any;

    if (!response.ok) {
      console.error("Erro da API Vindi ao consultar:", JSON.stringify(responseData, null, 2));
      throw new Error('Falha ao consultar transação na Vindi');
    }

    const transaction = responseData.data_response.transaction;
    const paymentMethodName = transaction?.payment?.payment_method_name;

    return {
      id: transaction.transaction_id,
      total: transaction.payment.price_payment,
      status: transaction.status_name,
      customerName: transaction.customer.name,
      customerEmail: transaction.customer.email,
      shippingAddress: transaction.customer.addresses.map((addr: any) => 
        `Rua: ${addr.street}, N°: ${addr.number}\nBairro: ${addr.neighborhood}\nCidade: ${addr.city} - ${addr.state}\nCEP: ${addr.postal_code}`
      ).join('\n'),
      items: transaction.transaction_products?.map((item: any) => ({
        name: item.description,
        quantity: item.quantity,
        price: item.price_unit,
      })),
      paymentMethod: paymentMethodName,
    };
  } catch (error) {
    console.error("Erro ao consultar transação na Vindi:", error);
    throw new Error('Não foi possível encontrar o pedido.');
  }
}