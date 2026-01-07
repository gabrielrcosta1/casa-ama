import { useState } from "react";
import { Heart, ShoppingCart, Star, StarHalf, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { ProductDetailsPanel } from "@/components/product-details-panel";
import type { ProductWithCategory } from "@shared/schema";

interface ProductRowProps {
  product: ProductWithCategory;
}

export function ProductRow({ product }: ProductRowProps) {
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

  const ratingValue = parseFloat(product.rating || "0");

  return (
    <>
      <div className="flex flex-row bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 w-full items-stretch p-4 gap-4 group">

        {/* Coluna da Imagem */}
        {/* MUDANÇA: A imagem agora tem uma largura fixa e responsiva, em vez de ocupar a largura total no mobile. */}
        <div className="relative flex-shrink-0 w-24 md:w-32 rounded-md overflow-hidden cursor-pointer" onClick={() => setIsDetailsOpen(true)}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isOnSale && (
              <Badge className="bg-accent text-white text-xs">Promoção</Badge>
            )}
            {product.isFeatured && !product.isOnSale && (
              <Badge className="bg-success text-white text-xs">Novo</Badge>
            )}
          </div>
        </div>

        {/* MUDANÇA: Um novo container flexível (`flex-col`) foi adicionado para agrupar as informações e as ações,
            permitindo um melhor controle do layout vertical e responsividade. `min-w-0` previne problemas de overflow. */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Seção Superior: Informações do Produto */}
          <div>
            <span className="text-sm text-slate-500 mb-1 block">{product.category?.name}</span>
            <h3
              className="font-semibold text-base md:text-lg text-slate-800 line-clamp-2 mb-2 hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsDetailsOpen(true)}
            >
              {product.name}
            </h3>
          <div className="flex items-center">
            <div className="flex text-sm">
              {Array.from({ length: Math.floor(ratingValue) }, (_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              {(ratingValue % 1 >= 0.5) && (
                <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              {Array.from({ length: 5 - Math.ceil(ratingValue) }, (_, i) => (
                <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
              ))}
            </div>
            <span className="ml-2 text-sm text-slate-600">
              ({product.reviewCount} avaliações)
            </span>
          </div>
          </div>

          {/* Seção Inferior: Preço e Ações */}
        {/* MUDANÇA: Esta seção foi reestruturada para ser responsiva, alinhando-se verticalmente em telas pequenas
            e lado a lado em telas maiores. `mt-auto` a empurra para o fundo do card. */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto pt-2 gap-y-3">
          <div className="flex items-baseline flex-wrap gap-x-2">
            <span className="text-xl md:text-2xl font-bold text-slate-800">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  {discountPercentage > 0 && (
                    <Badge variant="destructive">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
            )}
          </div>

          <div className="flex items-center w-full md:w-auto gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !product.inStock}
              className="w-full md:w-auto bg-primary text-white hover:bg-primary/90 transition-colors flex-1"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    <span>{product.inStock ? "Adicionar" : "Indisponível"}</span>
                  </>
              )}
            </Button>
              <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistToggle}
              className="p-2 border bg-transparent hover:bg-slate-100 rounded-md"
              >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? 'fill-accent text-accent' : 'text-slate-500 hover:text-accent'
                }`}
              />
            </Button>
          </div>
        </div>
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
