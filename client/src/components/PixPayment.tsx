import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Loader2, QrCode, Copy, Clock, XCircle, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { PixData } from "./PaymentForm"; // Importando a interface do pai

// Interfaces de dados recebidos
interface CustomerData {
  name: string; // Corrigido para corresponder ao pai
  email: string;
  cpf: string;
  phone: string;
}
interface ShippingAddress {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}
interface CartItem {
  id: number;
  productId: number;
  product: {
    name: string;
    price: string;
  };
  quantity: number;
}

// ALTERAÇÃO: A interface de props foi atualizada para receber o estado do componente pai
interface PixPaymentProps {
  customer: CustomerData;
  shipping: ShippingAddress;
  total: number;
  cartItems: CartItem[];
  pixData: PixData | null;
  setPixData: (data: PixData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

type PaymentStatus = 'pending' | 'expired' | 'canceled';

export default function PixPayment({
  customer,
  shipping,
  total,
  cartItems,
  pixData,
  setPixData,
  isLoading,
  setIsLoading,
}: PixPaymentProps) {
  // ALTERAÇÃO: Os estados principais foram removidos e agora vêm das props.
  // Mantemos apenas os estados que controlam a UI deste componente específico.
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const generatePix = useCallback(async (forceGeneration = false) => {
    // Só gera um novo PIX se não houver um existente OU se for forçado (após cancelamento/expiração)
    if (pixData && !forceGeneration) {
        setIsLoading(false); // Garante que o loading para se já tiver dados
        return;
    }

    setIsLoading(true);
    setPaymentStatus('pending');
    setTimeLeft('');
    try {
      const lightCartItemsForPayment = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        product: {
          name: item.product.name,
          price: item.product.price,
        }
      }));

      const response = await apiRequest("POST", "/api/create-payment", {
        amount: total,
        paymentMethod: 'pix',
        customer,
        shipping,
        cartItems: lightCartItemsForPayment,
      });

      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Falha ao gerar o PIX.'); }

      const transaction = data?.data_response?.transaction;
      const paymentInfo = transaction?.payment;
      if (!transaction || !paymentInfo) { throw new Error("Resposta da API de pagamento inválida."); }

      // ALTERAÇÃO: Salva os dados no estado do componente PAI
      setPixData({
        pixKey: paymentInfo.qrcode_original_path,
        pixQrCodeUrl: paymentInfo.qrcode_path,
        orderNumber: transaction.order_number,
        transactionToken: transaction.token_transaction,
        pixExpiration: transaction.max_days_to_keep_waiting_payment,
      });

    } catch (error: any) {
      toast({ title: "Erro ao gerar PIX", description: error.message, variant: "destructive" });
      setPixData(null); // Limpa os dados em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, [pixData, setIsLoading, setPixData, cartItems, customer, shipping, total, toast]);

  useEffect(() => {
    generatePix();
  }, [generatePix]);

  useEffect(() => {
    // A lógica do contador agora usa a data de expiração vinda das props
    if (!pixData?.pixExpiration) return;
    const interval = setInterval(() => {
      const expirationTime = new Date(pixData.pixExpiration!).getTime();
      const now = new Date().getTime();
      const distance = expirationTime - now;
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('Expirado');
        setPaymentStatus('expired');
        return;
      }
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [pixData?.pixExpiration]);

  useEffect(() => {
    // A lógica de polling agora usa o token vindo das props
    if (!pixData?.transactionToken || paymentStatus !== 'pending') {
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await apiRequest("GET", `/api/orders/${pixData.transactionToken}`);
        if (!response.ok) return;

        const data = await response.json();
        const status = data?.status?.toLowerCase() || '';
        
        const isPaid = ['aprovado', 'aprovada', 'pago', 'paga', 'confirmada', 'liquidado'].some(s => status === s);
        const isCanceled = ['cancelado', 'cancelada'].some(s => status === s);

        if (isPaid) {
          sessionStorage.clear();
          setLocation(`/checkout-success?orderId=${pixData.transactionToken}`);
        } else if (isCanceled) {
          setPaymentStatus('canceled');
        }
      } catch (error) {
        console.error("Erro no polling:", error);
      }
    };

    const pollingInterval = setInterval(checkStatus, 3000);
    return () => clearInterval(pollingInterval);
  }, [pixData?.transactionToken, setLocation, paymentStatus]);

  const copyToClipboard = () => {
    if (pixData?.pixKey) {
      navigator.clipboard.writeText(pixData.pixKey);
      toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
    }
  }

  const handleCheckStatus = async () => {
    if (!pixData?.transactionToken) return;
    try {
      const response = await apiRequest("GET", `/api/orders/${pixData.transactionToken}`);
      if (!response.ok) { throw new Error("Não foi possível verificar o status."); }
      const data = await response.json();
      const status = data?.status?.toLowerCase() || '';

      const isPaid = ['aprovado', 'aprovada', 'pago', 'paga', 'confirmada', 'liquidado'].some(s => status === s);
      const isCanceled = ['cancelado', 'cancelada'].some(s => status === s);

      if (isPaid) {
        sessionStorage.clear();
        setLocation(`/checkout-success?orderId=${pixData.transactionToken}`);
      } else if (isCanceled) {
        setPaymentStatus('canceled');
        toast({ title: "Pagamento Cancelado", description: "Este PIX foi cancelado. Gere um novo código para continuar." });
      } else {
        toast({
          title: "Pagamento Pendente",
          description: "Ainda não recebemos a confirmação do seu pagamento. Por favor, aguarde.",
        });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  }

  // NOVA: Função para forçar a geração de um novo PIX
  const handleForceGeneratePix = () => {
    setPixData(null); // Limpa os dados antigos
    generatePix(true); // Chama a geração forçada
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center space-y-2 p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Gerando seu código PIX...</p>
      </Card>
    );
  }

  if (paymentStatus === 'canceled' || paymentStatus === 'expired') {
    return (
      <Card className="flex flex-col items-center justify-center space-y-4 p-10 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-semibold text-destructive">
          {paymentStatus === 'canceled' ? 'PIX Cancelado' : 'PIX Expirado'}
        </h3>
        <p className="text-muted-foreground">
          {paymentStatus === 'canceled'
            ? 'Este código PIX foi cancelado. Por favor, gere um novo para continuar com a compra.'
            : 'O tempo para pagamento deste código PIX terminou. Por favor, gere um novo.'}
        </p>
        <Button onClick={handleForceGeneratePix} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar Novo PIX
        </Button>
      </Card>
    );
  }

  if (!pixData?.pixKey || !pixData?.pixQrCodeUrl) {
    return (
      <Card className="flex flex-col items-center justify-center space-y-2 p-10 text-center">
        <h3 className="text-lg font-semibold text-destructive">Falha ao Gerar PIX</h3>
        <p className="text-muted-foreground">Parece que houve um problema. Tente novamente.</p>
        <Button onClick={handleForceGeneratePix} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="text-center">
        <QrCode className="h-10 w-10 mx-auto text-primary" />
        <CardTitle className="text-2xl pt-2">Pague com PIX</CardTitle>

        {timeLeft && paymentStatus === 'pending' && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4" />
            <span>
              Este código expira em: <span className="font-semibold text-primary">{timeLeft}</span>
            </span>
          </div>
        )}

        {pixData.orderNumber && <p className="text-sm text-muted-foreground">Pedido: #{pixData.orderNumber}</p>}
        <p className="text-muted-foreground pt-1">Valor total:</p>
        <p className="text-3xl font-bold text-primary">{formatPrice(total)}</p>
      </CardHeader>

      <CardContent className="space-y-6 text-center">
        <p className="text-muted-foreground">Escaneie o QR Code abaixo com seu app de banco:</p>
        <div className="bg-white p-4 border rounded-lg inline-block mx-auto">
          <img src={pixData.pixQrCodeUrl!} alt="QR Code PIX" className="w-48 h-48 md:w-56 md:h-56" />
        </div>
        <div className="space-y-2 text-left">
          <Label htmlFor="pixCode" className="font-medium">Ou use o PIX Copia e Cola:</Label>
          <Textarea id="pixCode" readOnly value={pixData.pixKey || "Chave indisponível"} rows={3} className="resize-none" />
          <Button className="w-full" onClick={copyToClipboard} disabled={!pixData.pixKey}>
            <Copy className="mr-2 h-4 w-4" /> Copiar Código
          </Button>
        </div>
      </CardContent>

      <CardFooter className="bg-muted px-6 py-4 flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center w-full">
          Após o pagamento, a página será atualizada automaticamente.
        </p>
        {pixData.transactionToken && (
          <Button onClick={handleCheckStatus} variant="outline" className="w-full">
            Verificar Status Manualmente
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
