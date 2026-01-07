import { useState } from "react";
import { X, ShoppingCart, Heart, Star, StarHalf, Plus, Minus, Package, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithCategory } from "@shared/schema";

interface ProductDetailsPanelProps {
  product: ProductWithCategory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsPanel({ product, isOpen, onClose }: ProductDetailsPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const discountPercentage = product.originalPrice
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.id);
      }
      toast({
        title: "Adicionado ao carrinho",
        description: `${quantity}x ${product.name} adicionado${quantity > 1 ? 's' : ''} ao carrinho.`,
      });
      onClose();
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle className="text-left">Detalhes do Produto</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 bg-white">
          {/* Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {product.isOnSale && (
                  <Badge className="bg-accent text-white">Promoção</Badge>
                )}
                {product.isFeatured && !product.isOnSale && (
                  <Badge className="bg-success text-white">Novo</Badge>
                )}
              </div>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? 'fill-accent text-accent' : 'text-slate-600'
                  }`}
                />
              </Button>
            </div>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Title and Price Row */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <h2 className="text-xl font-bold text-slate-800 flex-1">{product.name}</h2>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary whitespace-nowrap">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through whitespace-nowrap">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && discountPercentage > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs mt-1">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {product.category && (
                <>
                  <span>{product.category.name}</span>
                  <span>•</span>
                </>
              )}
              <span>{product.brand}</span>
            </div>

            {/* Rating and Stock Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="flex">
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
                <span className="ml-2 text-xs text-slate-600">
                  ({product.reviewCount} avaliações)
                </span>
              </div>

              {/* Stock Status */}
              <p className={`text-xs font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? `✓ Em estoque (${product.stockQuantity || 0} unidades)` : '✗ Fora de estoque'}
              </p>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-base mb-1.5">Descrição</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          <Separator className="my-3" />

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Frete Grátis</p>
                <p className="text-muted-foreground text-xs">Em pedidos acima de R$ 200</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Compra Segura</p>
                <p className="text-muted-foreground text-xs">Seus dados protegidos</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Entrega Rápida</p>
                <p className="text-muted-foreground text-xs">Receba em até 7 dias úteis</p>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Quantidade</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-base font-semibold w-10 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 999, quantity + 1))}
                  disabled={quantity >= (product.stockQuantity || 999)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-white pt-2 pb-2">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || !product.inStock}
                className="flex-1 bg-primary hover:bg-primary/90 text-white h-11"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Adicionar ao Carrinho
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

