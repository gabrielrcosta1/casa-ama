

import { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { RecommendationPanel } from "@/components/RecommendationPanel";

import { Dialog, DialogContent } from "@/components/ui/dialog";


const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return isDesktop;
};


export function ShoppingCart() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    cartCount,
  } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [isRecommendationPanelOpen, setIsRecommendationPanelOpen] = useState(false);
  const isDesktop = useIsDesktop();


  const [hasAutoOpened, setHasAutoOpened] = useState(false);


  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCartOpen && cartItems.length > 0 && !hasAutoOpened) {
      timer = setTimeout(() => {
        setIsRecommendationPanelOpen(true);

        setHasAutoOpened(true);
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
    };

  }, [isCartOpen, cartItems.length, hasAutoOpened]);


  useEffect(() => {
    if (!isCartOpen) {
      setHasAutoOpened(false);
    }
  }, [isCartOpen]);

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar quantidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      toast({
        title: "Item removido",
        description: "Item foi removido do seu carrinho.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione alguns itens ao seu carrinho antes de finalizar.",
        variant: "destructive",
      });
      return;
    }
    setIsRecommendationPanelOpen(false);
    setIsCartOpen(false);
    setLocation("/checkout");
  };

  const handleCloseCart = () => {
    setIsRecommendationPanelOpen(false);
    setIsCartOpen(false);
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {isDesktop ? (
        <div className="absolute right-0 top-0 h-full flex items-start">
          {/* Painel de Recomendações */}
          {isRecommendationPanelOpen && (
            <div className="h-full w-full max-w-sm bg-slate-50 shadow-lg z-50">
              <RecommendationPanel
                cartItemIds={cartItems.map((item) => item.productId)}
                onClose={() => setIsRecommendationPanelOpen(false)}
              />
            </div>
          )}
          {/* Carrinho */}
          <div className="h-full w-full max-w-md bg-white shadow-xl z-40">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  Carrinho de Compras {cartCount > 0 && <Badge className="ml-2">{cartCount}</Badge>}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseCart} className="text-slate-500 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">Seu carrinho está vazio</p>
                    <Button onClick={handleCloseCart} variant="outline">
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex space-x-4 p-4 bg-slate-50 rounded-lg">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded"/>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-800">{item.product.name}</h3>
                          <p className="text-sm text-slate-600">{item.product.brand}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-6 h-6 p-0"><Minus className="h-3 w-3" /></Button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-6 h-6 p-0"><Plus className="h-3 w-3" /></Button>
                            </div>
                            <span className="font-semibold text-slate-800">{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-accent"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="border-t border-slate-200 p-6 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      console.log('[ShoppingCart] Botão Sugestões Inteligentes clicado');
                      console.log('[ShoppingCart] Cart items:', cartItems.map(item => item.productId));
                      setIsRecommendationPanelOpen(true);
                    }}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Sugestões Inteligentes
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full bg-primary text-white hover:bg-blue-700 transition-colors font-medium">
                    Finalizar Compra
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (

        <>
          <Dialog open={isRecommendationPanelOpen} onOpenChange={setIsRecommendationPanelOpen}>
            <DialogContent className="p-0 max-h-[85vh] flex flex-col">
              <RecommendationPanel
                cartItemIds={cartItems.map((item) => item.productId)}
                onClose={() => setIsRecommendationPanelOpen(false)}
                hideCloseButton={true}
              />
            </DialogContent>
          </Dialog>
          <div
            className={`h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  Carrinho {cartCount > 0 && <Badge className="ml-2">{cartCount}</Badge>}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseCart} className="text-slate-500 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">Seu carrinho está vazio</p>
                    <Button onClick={handleCloseCart} variant="outline">
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex space-x-4 p-4 bg-slate-50 rounded-lg">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded"/>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-800">{item.product.name}</h3>
                          <p className="text-sm text-slate-600">{item.product.brand}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-6 h-6 p-0"><Minus className="h-3 w-3" /></Button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-6 h-6 p-0"><Plus className="h-3 w-3" /></Button>
                            </div>
                            <span className="font-semibold text-slate-800">{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-accent"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="border-t border-slate-200 p-6 space-y-4">
                  <Button variant="outline" className="w-full" onClick={() => setIsRecommendationPanelOpen(true)}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Ver Produtos Recomendados IA
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full bg-primary text-white hover:bg-blue-700 transition-colors font-medium">
                    Finalizar Compra
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
