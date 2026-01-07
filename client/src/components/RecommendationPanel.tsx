

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Wand2, X } from 'lucide-react';
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@shared/schema";

interface RecommendationPanelProps {
  onClose: () => void;
  cartItemIds: number[];
  hideCloseButton?: boolean;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ onClose, cartItemIds, hideCloseButton = false }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const endpoint = cartItemIds.length > 0
          ? `/api/products?recommendedFor=${cartItemIds.join(',')}`
          : `/api/products?isFeatured=true`;

        console.log('[RecommendationPanel] Buscando recomendações:', endpoint);
        const response = await apiRequest("GET", endpoint);
        const data: Product[] = await response.json();
        console.log('[RecommendationPanel] Produtos recebidos:', data.length);
        setRecommendedProducts(data.slice(0, 5));
      } catch (error) {
        console.error("[RecommendationPanel] Erro ao buscar recomendações:", error);
        setRecommendedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [cartItemIds.join(',')]);

  const handleAddRecommendedItem = async (product: Product) => {
    try {
      await addToCart(product.id);
      toast({
        title: "Item adicionado!",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
      setRecommendedProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error("Erro ao adicionar produto recomendado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white md:bg-slate-50">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Para Você</h3>
        </div>
        {!hideCloseButton && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground px-6 mb-4">
        {cartItemIds.length > 0
            ? "Com base no seu carrinho, você também pode gostar destes produtos."
            : "Confira nossos produtos em destaque!"
        }
      </p>
      <Separator className="mb-4" />

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500 font-medium">Buscando recomendações inteligentes...</p>
          <p className="text-xs text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
        </div>
      ) : recommendedProducts.length > 0 ? (
        <div className="flex-1 space-y-4 overflow-y-auto p-6 pt-0">
          {recommendedProducts.map(product => (
            <div key={product.id} className="flex items-center gap-4 p-2 border rounded-lg bg-white">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
              <div className="flex-1">
                <h4 className="text-sm font-medium leading-tight">{product.name}</h4>
                <p className="text-sm font-semibold text-primary">{formatPrice(parseFloat(product.price))}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddRecommendedItem(product)}
                className="self-center"
              >
                <Plus className="mr-1 h-4 w-4" /> Adicionar
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-slate-500">Nenhuma recomendação encontrada no momento.</p>
        </div>
      )}
    </div>
  );
};
