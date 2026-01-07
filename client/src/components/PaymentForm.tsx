import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CreditCardPayment from "@/components/CreditCardPayment";
import PixPayment from "@/components/PixPayment";
import { CreditCard, QrCode } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Interfaces para os dados
interface CustomerData {
  name: string;
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
interface PaymentFormProps {
  customer: CustomerData;
  shipping: ShippingAddress;
  total: number;
  cartItems: CartItem[];
}

// NOVA: Interface para guardar os dados do PIX gerado
export interface PixData {
  pixKey: string | null;
  pixQrCodeUrl: string | null;
  orderNumber: string | null;
  transactionToken: string | null;
  pixExpiration: string | null;
}

export default function PaymentForm({ customer, shipping, total, cartItems }: PaymentFormProps) {
  // ALTERAÇÃO: O valor inicial agora é `null`, para que nada comece selecionado.
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);

  const [pixData, setPixData] = useState<PixData | null>(null);
  // ALTERAÇÃO: O loading inicial agora é `false`, pois nenhum PIX está sendo gerado ao carregar.
  const [isPixLoading, setIsPixLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl">Como você prefere pagar?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            variant={paymentMethod === 'card' ? 'default' : 'outline'}
            className="w-full justify-start h-20 text-left p-4 flex-1"
            onClick={() => setPaymentMethod('card')}
          >
            <CreditCard className="h-6 w-6 mr-4" />
            <div>
              <p className="font-semibold text-base">Cartão de Crédito</p>
              <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo, etc.</p>
            </div>
          </Button>
          <Button
            variant={paymentMethod === 'pix' ? 'default' : 'outline'}
            className="w-full justify-start h-20 text-left p-4 flex-1"
            onClick={() => setPaymentMethod('pix')}
          >
            <QrCode className="h-6 w-6 mr-4" />
            <div>
              <p className="font-semibold text-base">PIX</p>
              <p className="text-sm text-muted-foreground">Pagamento instantâneo.</p>
            </div>
          </Button>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {paymentMethod === 'card' && (
              <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Separator className="mb-6" />
                <CreditCardPayment
                  customer={customer}
                  shipping={shipping}
                  total={total}
                  cartItems={cartItems}
                />
              </motion.div>
            )}
            {paymentMethod === 'pix' && (
              <motion.div key="pix" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Separator className="mb-6" />
                <PixPayment
                  customer={customer}
                  shipping={shipping}
                  total={total}
                  cartItems={cartItems}
                  pixData={pixData}
                  setPixData={setPixData}
                  isLoading={isPixLoading}
                  setIsLoading={setIsPixLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}