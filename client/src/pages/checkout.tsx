import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import { ArrowLeft, Package, Truck, Loader2, User } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import { AnimatePresence, motion } from "framer-motion";

// Interfaces (sem alteração)
interface ShippingAddress {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}
interface CustomerFormData {
  customerEmail: string;
  customerName: string;
  cpf: string;
  phone: string;
}
interface CartItem {
  id: number;
  product: {
    id: string;
    name: string;
    price: string;
  };
  quantity: number;
}

export default function Checkout() {
  const { cartItems, getCartTotal } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const initialStep = searchParams.get('step') === 'payment' ? 'payment' : 'details';
  const [step, setStep] = useState<'details' | 'payment'>(initialStep);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customerEmail: customer?.email || "",
    customerName: customer?.firstName ? `${customer.firstName} ${customer.lastName || ""}`.trim() : "",
    cpf: customer?.cpf || "",
    phone: customer?.phone || "",
  });
  const [addressFields, setAddressFields] = useState<ShippingAddress>({
    cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  });
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepLookedUp, setCepLookedUp] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const total = getCartTotal();

  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione itens ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [cartItems, setLocation, toast]);

  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerEmail: customer.email || "",
        customerName: customer.firstName ? `${customer.firstName} ${customer.lastName || ""}`.trim() : "",
        cpf: customer.cpf || "",
        phone: customer.phone || "",
      }));
      if (customer.address && typeof customer.address === 'object') {
        const savedAddress = customer.address as ShippingAddress;
        if (savedAddress.cep) {
          setAddressFields(savedAddress);
          setCepLookedUp(true);
        }
      }
    }
  }, [customer]);

  const handleCepBlur = useCallback(async () => {
    const cep = addressFields.cep.replace(/\D/g, '');
    if (isCepLoading || cep.length !== 8) return;

    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) throw new Error("CEP não encontrado");
      setAddressFields(prev => ({
        ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf,
      }));
      setCepLookedUp(true);
      setTimeout(() => document.getElementById('numero')?.focus(), 100);
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível encontrar o CEP digitado.",
        variant: "destructive",
      });
      setCepLookedUp(false);
    } finally {
      setIsCepLoading(false);
    }
  }, [addressFields.cep, isCepLoading, toast]); // AJUSTE: Dependência do CEP é necessária aqui

  // AJUSTE: Corrigido o useEffect para disparar a busca automática corretamente
  useEffect(() => {
    const cep = addressFields.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      handleCepBlur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressFields.cep]); // Dispara apenas quando o CEP muda, ignorando a recriação da função handleCepBlur

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'cpf') {
      const cpfValue = value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setFormData(prev => ({ ...prev, cpf: cpfValue }));
    } else if (id === 'phone') {
      let cleaned = value.replace(/\D/g, '').slice(0, 11);
      if (cleaned.length > 10) {
        cleaned = cleaned.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (cleaned.length > 6) {
        cleaned = cleaned.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (cleaned.length > 2) {
        cleaned = cleaned.replace(/^(\d\d)(\d*)/, '($1) $2');
      } else if (cleaned.length > 0) {
        cleaned = `(${cleaned}`;
      }
      setFormData(prev => ({ ...prev, phone: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'cep') {
      const cepValue = value.replace(/\D/g, '').slice(0, 8);
      setAddressFields(prev => ({ ...prev, cep: cepValue.length > 5 ? cepValue.slice(0, 5) + '-' + cepValue.slice(5) : cepValue }));
    } else {
      setAddressFields(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredAddressFields: (keyof ShippingAddress)[] = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    const missingAddressField = requiredAddressFields.find(field => !addressFields[field]);
    if (!formData.customerEmail || !formData.customerName || !formData.cpf || !formData.phone || !cepLookedUp || missingAddressField) {
      toast({ title: "Dados Incompletos", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      toast({ title: "CPF Inválido", description: "Por favor, insira um CPF válido.", variant: "destructive" });
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast({ title: "Telefone Inválido", description: "Por favor, insira um telefone válido com DDD.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setStep('payment');
    setLocation('/checkout?step=payment');
    setIsLoading(false);
  };

  if (cartItems.length === 0) return null;

  if (step === 'details') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar às Compras
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Finalizar Compra</h1>
            <p className="text-muted-foreground">Revise seu pedido e insira suas informações</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Resumo do Pedido</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-4 pr-3">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div><p className="font-medium">{item.product.name}</p><p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p></div>
                    <p className="font-medium">{formatPrice(parseFloat(item.product.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Suas Informações</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div><Label htmlFor="customerEmail">Email *</Label><Input id="customerEmail" type="email" value={formData.customerEmail} onChange={handleFormChange} required disabled={isAuthenticated} placeholder="seu@email.com" /></div>
                <div><Label htmlFor="customerName">Nome Completo *</Label><Input id="customerName" value={formData.customerName} onChange={handleFormChange} required placeholder="Seu nome completo" /></div>
                <div><Label htmlFor="cpf">CPF *</Label><Input id="cpf" value={formData.cpf} onChange={handleFormChange} required placeholder="000.000.000-00" inputMode="numeric" /></div>
                <div>
                  <Label htmlFor="phone">Telefone Celular *</Label>
                  <Input id="phone" value={formData.phone} onChange={handleFormChange} onFocus={() => setIsPhoneFocused(true)} onBlur={() => setIsPhoneFocused(false)} required placeholder="(XX) XXXXX-XXXX" inputMode="tel" />
                  {isPhoneFocused && (
                    <p className="text-sm text-muted-foreground mt-1">Digite apenas os números. A máscara é automática.</p>
                  )}
                </div>
                <Separator />
                <div className="flex items-center gap-2 pt-2"><Truck className="h-5 w-5" /><h3 className="font-semibold text-lg">Endereço de Entrega</h3></div>
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input id="cep" value={addressFields.cep} onChange={handleAddressChange} required placeholder="00000-000" maxLength={9} inputMode="numeric" />
                    {isCepLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                  </div>
                </div>
                <AnimatePresence>
                  {cepLookedUp && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <div><Label htmlFor="rua">Rua *</Label><Input id="rua" value={addressFields.rua} onChange={handleAddressChange} required placeholder="Nome da sua rua" disabled={isCepLoading} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="numero">Número *</Label><Input id="numero" value={addressFields.numero} onChange={handleAddressChange} required placeholder="123" disabled={isCepLoading} inputMode="numeric" /></div>
                        <div><Label htmlFor="complemento">Complemento</Label><Input id="complemento" value={addressFields.complemento} onChange={handleAddressChange} placeholder="Apto, Bloco, etc." disabled={isCepLoading} /></div>
                      </div>
                      <div><Label htmlFor="bairro">Bairro *</Label><Input id="bairro" value={addressFields.bairro} onChange={handleAddressChange} required placeholder="Seu bairro" disabled={isCepLoading} /></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2"><Label htmlFor="cidade">Cidade *</Label><Input id="cidade" value={addressFields.cidade} onChange={handleAddressChange} required placeholder="Sua cidade" disabled={isCepLoading} /></div>
                        <div><Label htmlFor="estado">Estado *</Label><Input id="estado" value={addressFields.estado} onChange={handleAddressChange} required placeholder="UF" maxLength={2} disabled={isCepLoading} /></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button type="submit" className="w-full" disabled={isLoading || isCepLoading} size="lg">{isLoading ? "Processando..." : "Continuar para Pagamento"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6"><Button variant="ghost" onClick={() => { setStep('details'); setLocation('/checkout'); }} className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Voltar para Informações</Button>
          <div><h1 className="text-2xl font-bold">Pagamento</h1><p className="text-muted-foreground">Escolha sua forma de pagamento</p></div>
        </div>
        <PaymentForm
          customer={formData}
          shipping={addressFields}
          total={total}
          cartItems={cartItems.map(item => ({...item, product: {...item.product, price: parseFloat(item.product.price).toFixed(2), id: String(item.product.id)}}))}
        />
      </div>
    );
  }

  return null;
}