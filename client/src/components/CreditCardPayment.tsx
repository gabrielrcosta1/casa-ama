import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import { CreditCard, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

// Interfaces
interface CustomerData {
  customerName: string;
  customerEmail: string;
  cpf: string;
  phone: string;
}
interface CartItem {
  id: number;
  product: { name: string; price: string; };
  quantity: number;
}
interface CreditCardPaymentProps {
  customer: CustomerData;
  shipping: any;
  total: number;
  cartItems: CartItem[];
  paymentMethod: string;
}

// Declarações Globais para os scripts externos
declare global {
  interface Window {
    Yapay: {
      getCardToken: (params: any, callback: (response: any) => void) => void;
    };
    yapay: {
      FingerPrint: (params: any) => void;
    };
  }
  interface JQuery {
    FingerPrint: () => { getFingerPrint: () => void; };
  }
}

export default function CreditCardPayment({ 
  customer, 
  shipping,
  total, 
  cartItems, 
}: CreditCardPaymentProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... sem alteração ... */ };
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... sem alteração ... */ };
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... sem alteração ... */ };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing) return;

    // Pega o valor do finger_print do input hidden que o script da Vindi cria
    const fingerPrint = (e.currentTarget.elements.namedItem('finger_print') as HTMLInputElement)?.value;

    if (!window.Yapay || typeof window.Yapay.getCardToken !== 'function' || !fingerPrint) {
      toast({
        title: "Erro de Integração",
        description: "O script de pagamento não foi carregado corretamente. Por favor, recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const [expiryMonth, expiryYear] = cardExpiry.split('/');
      const cardData = {
        card_holder_name: cardName,
        card_number: cardNumber.replace(/\s/g, ''), 
        card_expire_date: `${expiryMonth}/${expiryYear}`,
        card_cvv: cardCVC,
      };

      const cardToken = await new Promise<string>((resolve, reject) => {
        window.Yapay.getCardToken(cardData, (response: any) => {
          if (response.error) {
            reject(new Error(response.error.message || "Dados do cartão inválidos."));
          } else { resolve(response.token); }
        });
      });
      
      const paymentResponse = await apiRequest("POST", "/api/create-payment", {
        amount: total,
        paymentMethod,
        customer: { name: customer.customerName, email: customer.customerEmail, cpf: customer.cpf, phone: customer.phone },
        shipping,
        cartItems,
        cardToken,
        fingerPrint, 
      });

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) { throw new Error(paymentData.message || 'Seu pagamento foi recusado.'); }
      
      const transactionToken = paymentData?.data_response?.transaction?.token_transaction;
      if (!transactionToken) { throw new Error("Não foi possível obter o identificador da transação."); }
      
      toast({ title: "Pagamento Aprovado!", description: "Seu pedido foi processado com sucesso." });
      sessionStorage.clear();
      setLocation(`/checkout-success?orderId=${transactionToken}`);
    } catch (error: any) {
      toast({ title: "Erro no Pagamento", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* AJUSTE: Adicionado o atributo data-yapay="payment-form" */}
      <form onSubmit={handleSubmit} data-yapay="payment-form">
        <CardHeader>
          <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /><CardTitle>Pagamento com Cartão</CardTitle></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="cardName">Nome no Cartão</Label><Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} required disabled={isProcessing} /></div>
          <div><Label htmlFor="cardNumber">Número do Cartão</Label><Input id="cardNumber" value={cardNumber} onChange={handleCardNumberChange} maxLength={19} required disabled={isProcessing} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="cardExpiry">Validade (MM/AA)</Label><Input id="cardExpiry" value={cardExpiry} onChange={handleExpiryChange} maxLength={5} required disabled={isProcessing} /></div>
            <div><Label htmlFor="cardCVC">CVC</Label><Input id="cardCVC" value={cardCVC} onChange={handleCvcChange} maxLength={4} required disabled={isProcessing} /></div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted px-6 py-4">
          <div className="flex flex-col-reverse gap-4 w-full sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xl font-bold">Total: {formatPrice(total)}</div>
            <Button type="submit" disabled={isProcessing} size="lg">
              {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : `Pagar ${formatPrice(total)}`}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}