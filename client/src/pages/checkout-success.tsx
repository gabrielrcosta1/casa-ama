import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, ArrowLeft, Truck, ShoppingBag, CreditCard, QrCode, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

// Interface para os detalhes do pedido que esperamos do backend
interface OrderDetails {
  id: number;
  total: string;
  status: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items?: { name: string; quantity: number, price: number }[];
  paymentMethod?: string;
}

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    // Limpa todos os dados da sessão do checkout ao chegar nesta página
    sessionStorage.removeItem('pixPaymentInfo');
    sessionStorage.removeItem('checkoutFormData');
    sessionStorage.removeItem('checkoutAddressFields');
    sessionStorage.removeItem('checkoutStep');
    sessionStorage.removeItem('checkoutCepLookedUp');

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
      fetchOrder(orderId);
    } else {
      console.error("[Success Page] Nenhum orderId encontrado na URL.");
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", `/api/orders/${orderId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar pedido.');
      }
      const orderData: OrderDetails = await response.json();
      setOrder(orderData);
      clearCart(); // Limpa o carrinho de compras
    } catch (error) {
      console.error("Falha ao buscar pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funções para exibir nome e ícone do método de pagamento
  const getPaymentMethodName = (method: string | null | undefined): string => {
    const methodName = method?.toLowerCase() || '';
    if (methodName.includes('pix')) return 'PIX';
    if (methodName.includes('cartão')) return 'Cartão de Crédito';
    return method || 'Não informado';
  };

  const PaymentIcon = ({ method }: { method: string | null | undefined }) => {
    const methodName = method?.toLowerCase() || '';
    if (methodName.includes('pix')) return <QrCode className="h-4 w-4" />;
    if (methodName.includes('cartão')) return <CreditCard className="h-4 w-4" />;
    return <Hourglass className="h-4 w-4"/>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-500">
                <Package className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
              <p className="text-muted-foreground">
                Não foi possível encontrar as informações do seu pedido.
              </p>
              <Button onClick={() => setLocation("/")} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Compras
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderização da página de sucesso
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="text-green-500">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-green-600">
                Obrigado pelo seu pedido!
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-base">
                Seu pedido #{order.id} foi confirmado com sucesso.
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Separator />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Resumo da Compra
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Pago</span>
                      <span className="text-green-600">
                        {formatPrice(parseFloat(order.total))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Detalhes do Pedido
              </h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-3">
                    {order.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Método de Pagamento:</span>
                        <div className="flex items-center gap-2">
                          <PaymentIcon method={order.paymentMethod} />
                          <span className="font-medium">
                            {getPaymentMethodName(order.paymentMethod)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize text-green-600">
                        {order.status}
                      </span>
                    </div>
                    {order.customerName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                    )}
                  </div>
                  {order.shippingAddress && (
                    <>
                      <Separator />
                      <div className="space-y-2 pt-4">
                        <h4 className="font-medium">Endereço de Entrega:</h4>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {order.shippingAddress}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <Separator />
          <div className="flex justify-center pt-4">
            <Button onClick={() => setLocation("/")} className="w-full max-w-xs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}