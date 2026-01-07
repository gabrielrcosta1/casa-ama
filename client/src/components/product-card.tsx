import { useState } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Star, StarHalf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetailsPanel } from "@/components/product-details-panel";
import type { ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await addToCart(product.id);
      toast({
        title: "Adicionado ao carrinho",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar item ao carrinho. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${product.name} foi ${isWishlisted ? 'removido dos' : 'adicionado aos'} seus favoritos.`,
    });
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative cursor-pointer" onClick={() => setIsDetailsOpen(true)}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Quick View Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white hover:bg-white/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>

        {/* Badges */}
        <div className="absolute top-2 left-2">
          {product.isOnSale && (
            <Badge className="bg-accent text-white text-xs">Promoção</Badge>
          )}
          {product.isFeatured && !product.isOnSale && (
            <Badge className="bg-success text-white text-xs">Novo</Badge>
          )}
        </div>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle();
            }}
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? 'fill-accent text-accent' : 'text-slate-600 hover:text-accent'
              }`}
            />
          </Button>
        </div>

        <div className="p-4">
          <h3
            className="font-semibold text-slate-800 mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsDetailsOpen(true)}
          >
            {product.name}
          </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-sm">
            {Array.from({ length: Math.floor(parseFloat(product.rating || "0")) }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            {(parseFloat(product.rating || "0") % 1 >= 0.5) && (
              <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
            {Array.from({ length: 5 - Math.ceil(parseFloat(product.rating || "0")) }, (_, i) => (
              <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
          <span className="ml-2 text-sm text-slate-600">
            ({product.reviewCount} avaliações)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-slate-800">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-500 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <span className="text-sm text-success font-medium">
              {discountPercentage}% off
            </span>
          )}
          {!product.isOnSale && product.inStock && (
            <span className="text-sm text-success font-medium">
              {parseFloat(product.price) >= 200 ? "Frete Grátis" : "Em Estoque"}
            </span>
          )}
        </div>

          {/* Add to Cart button */}
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || !product.inStock}
            className="w-full bg-primary text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adicionando...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>{product.inStock ? "Adicionar ao Carrinho" : "Fora de Estoque"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <ProductDetailsPanel
        product={product}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
