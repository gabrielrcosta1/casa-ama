import { useState, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Heart, ShoppingCart, Menu, X, LogOut, ChevronDown, ListCollapse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
// MUDANÇA 1: Importar o componente Collapsible para o menu sanfona
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCart } from "@/hooks/use-cart";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import type { ProductWithCategory } from "@shared/schema";

interface BaseCategory {
  id: number;
  name: string;
}

interface CategoryWithCount {
  id: number;
  name: string;
  productCount: number;
}

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // MUDANÇA 2: Estado para controlar o accordion de categorias no menu mobile
  const [isCategoryAccordionOpen, setIsCategoryAccordionOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();

  const { data: baseCategories = [], isLoading: isLoadingCategories } = useQuery<BaseCategory[]>({
    queryKey: ['baseCategories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: allProducts = [], isLoading: isLoadingProducts } = useQuery<ProductWithCategory[]>({
    queryKey: ['allProductsForHeader'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch all products for header');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const categories: CategoryWithCount[] = useMemo(() => {
    if (isLoadingProducts || isLoadingCategories) return [];
    const counts = allProducts.reduce((acc, product) => {
      const categoryName = product.category?.name;
      if (categoryName) {
        acc[categoryName] = (acc[categoryName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return baseCategories.map(category => ({
      ...category,
      productCount: counts[category.name] || 0,
    }));
  }, [baseCategories, allProducts, isLoadingCategories, isLoadingProducts]);

  const categoriesWithProducts = useMemo(() => {
    return categories
      .filter(category => category.productCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const categoriesWithoutProducts = useMemo(() => {
    return categories
      .filter(category => category.productCount === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (onSearch) {
      onSearch(trimmedQuery);
    }
    navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleEmptyCategoryClick = (e: Event) => {
    e.preventDefault();
    toast({
      title: "Categoria Vazia",
      description: "Ainda não temos produtos nesta categoria. Volte em breve!",
    });
  };

  const renderCategoryItem = (category: CategoryWithCount, isMobile = false) => {
    const hasProducts = category.productCount > 0;
    const content = (
      <div className="flex justify-between items-center w-full">
        <span>{category.name}</span>
        <span className={cn("text-xs", hasProducts ? "text-muted-foreground" : "text-destructive/50")}>
          ({category.productCount})
        </span>
      </div>
    );

    if (hasProducts) {
      return (
        <Link
          key={category.id}
          href={`/?category=${encodeURIComponent(category.name)}&scrollToProducts=true`}
          className={cn("block w-full", isMobile ? "py-2 text-muted-foreground hover:text-primary" : "px-3 py-2 text-popover-foreground hover:bg-muted rounded")}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        key={category.id}
        className={cn("w-full cursor-not-allowed opacity-50", isMobile ? "py-2 text-muted-foreground" : "px-3 py-2 text-popover-foreground rounded")}
      >
        {content}
      </div>
    );
  };

  const isLoading = isLoadingCategories || isLoadingProducts;

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 border-b">
      <div className="acai-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center sm:justify-between py-2 text-sm text-primary-foreground/90">
            <div className="flex items-center gap-x-4">
              <span className="text-center">Frete grátis em pedidos acima de R$ 200</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block bg-primary-foreground/30" />
              <span className="hidden sm:inline">Suporte 24/7</span>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <Link href="/help" className="hover:text-accent transition-colors">Central de Ajuda</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 gap-3">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] flex flex-col">
                <SheetHeader><SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Menu</SheetTitle></SheetHeader>
                {/* MUDANÇA 3: Estrutura da navegação mobile atualizada */}
                <nav className="flex-1 flex flex-col mt-6 space-y-1">
                  <Link href="/" className={cn("block py-2 text-lg font-medium", location === "/" ? "text-primary" : "text-foreground")} onClick={() => setIsMobileMenuOpen(false)}>Início</Link>
                  <Link href="/products" className={cn("block py-2 text-lg font-medium", location.startsWith("/products") ? "text-primary" : "text-foreground")} onClick={() => setIsMobileMenuOpen(false)}>Todos os Produtos</Link>
                  <Separator className="my-3" />

                  {/* MUDANÇA 4: Implementação do Collapsible (accordion) para as categorias */}
                  <Collapsible open={isCategoryAccordionOpen} onOpenChange={setIsCategoryAccordionOpen}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-medium text-foreground">
                      <span>Categorias</span>
                      <ChevronDown className={cn("h-5 w-5 transition-transform", isCategoryAccordionOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 border-l-2 ml-2">
                      <div className="flex flex-col space-y-1 mt-2">
                        {isLoading ? <p className="py-2 text-muted-foreground">Carregando...</p> : categories.map((category) => renderCategoryItem(category, true))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </nav>
                <SheetFooter className="mt-auto border-t pt-4">
                  {isAuthenticated ? (
                    <div className="w-full">
                      <p className="font-semibold mb-2">Olá, {customer?.firstName}</p>
                      <Button onClick={() => { logout(); setIsMobileMenuOpen(false); }} variant="outline" className="w-full text-destructive"><LogOut className="h-4 w-4 mr-2" />Sair</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <Link href="/login" className="w-full"><Button className="w-full acai-button" onClick={() => setIsMobileMenuOpen(false)}>Entrar</Button></Link>
                      <Link href="/register" className="w-full"><Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>Criar Conta</Button></Link>
                    </div>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Logo className="h-7 sm:h-8 lg:h-10 w-auto pointer-events-none" />
              <h1 className="hidden sm:block text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wide pointer-events-none">
                CASA D'AMAZÔNIA
              </h1>
            </Link>
          </div>

          <div className="flex items-center lg:space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="hidden sm:inline-flex"><User className="h-5 w-5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Olá, {customer?.firstName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Meus Pedidos</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive"><LogOut className="h-4 w-4 mr-2" />Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
                <Link href="/register"><Button size="sm" className="acai-button">Criar Conta</Button></Link>
              </div>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:flex"><Heart className="h-5 w-5 text-destructive" /></Button>
            <Button variant="ghost" size="icon" onClick={handleCartClick} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (<Badge className="absolute -top-1 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white text-xs">{cartCount}</Badge>)}
            </Button>
          </div>
        </div>

        <div className="lg:hidden pb-4 px-4 sm:px-6">
          <form onSubmit={handleSearch} className="relative">
            <Input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 bg-muted border-border focus:ring-2 focus:ring-primary focus:border-transparent" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>
      </div>

      <nav className="bg-card border-t hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-x-6 flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-x-2 text-foreground hover:text-primary font-medium"><Menu className="h-4 w-4" /><span>Todas as Categorias</span><ChevronDown className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isLoading ? (
                    <DropdownMenuItem disabled className="text-muted-foreground">
                      Carregando categorias...
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {categoriesWithProducts.map((category) => (
                        <DropdownMenuItem key={category.id} asChild className="focus:bg-accent/50 p-0">
                          {renderCategoryItem(category)}
                        </DropdownMenuItem>
                      ))}

                      {categoriesWithProducts.length > 0 && categoriesWithoutProducts.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-normal">
                            Outras Categorias
                          </DropdownMenuLabel>
                        </>
                      )}

                      {categoriesWithoutProducts.map((category) => (
                        <DropdownMenuItem
                          key={category.id}
                          className="focus:bg-accent/50 p-0"
                          onSelect={handleEmptyCategoryClick}
                        >
                          {renderCategoryItem(category)}
                        </DropdownMenuItem>
                      ))}

                      {categories.length === 0 && (
                        <DropdownMenuItem disabled className="text-muted-foreground">
                          Nenhuma categoria encontrada
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* MUDANÇA 5: Links de Novidades e Promoções atualizados para usar o filtro. */}
              <Link href="/?filter=new&scrollToProducts=true" className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors", searchParams.get('filter') === 'new' && "text-primary")}>Novidades</Link>
              <Link href="/products" className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors", location.startsWith("/products") && !searchParams.get('category') && !searchParams.get('filter') && "text-primary")}>Todos os Produtos</Link>
              <Link href="/?filter=sale&scrollToProducts=true" className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors", searchParams.get('filter') === 'sale' && "text-primary")}>Promoções</Link>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Devolução Grátis</span><span>•</span><span>Entrega Rápida</span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
