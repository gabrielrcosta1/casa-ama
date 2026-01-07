import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, List, ChevronDown, Leaf, ArrowRight, PackageOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { ProductRow } from "@/components/product-row";
import { ProductFilters } from "@/components/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@shared/schema";

interface FilterState {
  priceRanges: string[];
  brands: string[];
  categories: string[];
  ratings: number[];
}

interface HomeProps {
  searchQuery?: string;
}

export default function Home({ searchQuery: initialSearchQuery }: HomeProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [filters, setFilters] = useState<FilterState>({
    priceRanges: [],
    brands: [],
    categories: [],
    ratings: [],
  });

  const productsSectionRef = useRef<HTMLElement>(null);
  const productListTopRef = useRef<HTMLDivElement>(null);
  const search = useSearch();
  const [location, navigate] = useLocation();

  // Atualizar searchQuery quando initialSearchQuery mudar
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Lógica do useEffect totalmente reescrita para ser mais inteligente
  useEffect(() => {
    const params = new URLSearchParams(search);
    const categoryFromURL = params.get('category');
    const filterFromURL = params.get('filter');
    const shouldScroll = params.get('scrollToProducts') === 'true';

    // Se a URL especificar uma categoria ou um filtro especial,
    // atualizamos o estado de filtros para refletir isso e limpamos os filtros manuais.
    if (categoryFromURL || filterFromURL) {
      setFilters({
        priceRanges: [],
        brands: [],
        ratings: [],
        categories: categoryFromURL ? [categoryFromURL] : [],
      });
    }

    if (shouldScroll && productsSectionRef.current) {
      setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        const newParams = new URLSearchParams(params);
        newParams.delete('scrollToProducts');
        navigate(`${location}?${newParams.toString()}`, { replace: true });
      }, 100);
    }
  // A dependência agora é apenas 'search', para rodar somente quando a URL mudar.
  }, [search]);


  const { data: allProductsForFilters = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ['allProductsForFilters'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch all products for filters');
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Função de construção de query atualizada para ler TUDO corretamente
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    const currentURLParams = new URLSearchParams(search);
    const currentSearch = searchQuery || currentURLParams.get('search') || '';
    const currentFilter = currentURLParams.get('filter');
    const currentCategory = currentURLParams.get('category');

    if (currentSearch) params.append("search", currentSearch);
    if (currentFilter) params.append("filter", currentFilter);

    // Prioriza a categoria da URL, senão usa a do estado de filtros
    if (currentCategory) {
      params.append("category", currentCategory);
    } else {
      filters.categories.forEach(category => params.append("category", category));
    }

    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);

    filters.brands.forEach(brand => params.append("brand", brand));
    filters.priceRanges.forEach(range => {
      const [min, max] = range.split("-");
      if (min) params.append("minPrice", min);
      if (max && max !== "999999") params.append("maxPrice", max);
    });

    // CORREÇÃO APLICADA AQUI:
    // Se houver avaliações selecionadas, encontra a MENOR delas e a define como o minRating.
    if (filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings);
      params.append("minRating", minRating.toString());
    }

    return params.toString();
  };

  const { data: filteredProducts = [], isLoading, error } = useQuery<ProductWithCategory[]>({
    queryKey: ['filteredProducts', buildQueryParams()],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/products${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy, sortOrder, itemsPerPage, search]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const scrollToProductListTop = () => {
    productListTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPage = (page: number) => {
    const safeTotal = totalPages || 1;
    const next = Math.min(Math.max(page, 1), safeTotal);
    setCurrentPage(next);
    requestAnimationFrame(() => scrollToProductListTop());
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    requestAnimationFrame(() => scrollToProductListTop());
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
  };

  const handleScrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPageTitle = () => {
    const params = new URLSearchParams(search);
    const filter = params.get('filter');
    const category = params.get('category');
    const urlSearch = params.get('search');

    const activeSearch = searchQuery || urlSearch;
    if (activeSearch) return `Resultados para "${activeSearch}"`;
    if (filter === 'new') return "Novidades";
    if (filter === 'sale') return "Promoções";
    if (category) return category;

    return "Produtos da Amazônia";
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card><CardContent className="p-6"><p className="text-destructive">Falha ao carregar os produtos. Tente novamente mais tarde.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="acai-gradient text-primary-foreground flex flex-col items-center justify-center text-center min-h-[70vh] md:min-h-[60vh] px-4">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-balance">Descubra a CASA D'AMAZÔNIA</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto text-balance">Produtos sustentáveis e autênticos da biodiversidade amazônica para sua casa.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="acai-button font-bold text-lg px-8 py-3" onClick={handleScrollToProducts}><Leaf className="mr-2 h-5 w-5" /> Explorar Produtos</Button>
            <Link href="/about"><Button size="lg" variant="secondary" className="font-bold text-lg px-8 py-3">Nossa História</Button></Link>
          </div>
        </div>
      </section>

      <main ref={productsSectionRef} id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="pt-4 pb-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Início</Link></li>
              <li><ChevronDown className="h-3 w-3 rotate-[-90deg]" /></li>
              <li><Link href="/products" className="hover:text-primary">Produtos</Link></li>
              {getPageTitle() !== "Produtos da Amazônia" && (
                <>
                  <li><ChevronDown className="h-3 w-3 rotate-[-90deg]" /></li>
                  <li className="text-foreground font-medium">{getPageTitle()}</li>
                </>
              )}
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              allProducts={allProductsForFilters}
              activeFilters={filters}
            />
          </aside>

          <div className="flex-1">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{getPageTitle()}</h2>
                    <p className="text-sm text-muted-foreground">Exibindo {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    {/* Barra de pesquisa */}
                    <div className="flex-1 max-w-md">
                      <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) { navigate(`/products?search=${encodeURIComponent(searchQuery)}`); } }} className={cn("relative search-container group", searchQuery && "has-text")}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 search-icon transition-all duration-300 z-10 pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Buscar produtos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 h-9 text-sm search-input transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {searchQuery && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 search-pulse"></div>
                        )}
                      </form>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label htmlFor="sort-select" className="text-sm text-muted-foreground flex-shrink-0">Ordenar por:</label>
                      <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                        <SelectTrigger id="sort-select" className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name-asc">Nome: A-Z</SelectItem>
                          <SelectItem value="name-desc">Nome: Z-A</SelectItem>
                          <SelectItem value="price-asc">Preço: Menor para Maior</SelectItem>
                          <SelectItem value="price-desc">Preço: Maior para Menor</SelectItem>
                          <SelectItem value="rating-desc">Avaliação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center self-end sm:self-center space-x-1 border rounded-lg p-1">
                      <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="p-2"><Grid className="h-4 w-4" /></Button>
                      <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="p-2"><List className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div ref={productListTopRef} />

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full mb-4" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2 mb-4" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground mb-6">{searchQuery ? `Não encontramos nada para "${searchQuery}"` : "Tente ajustar seus filtros para encontrar o que procura."}</p>
                  <Link href="/products"><Button className="acai-button">Ver todos os produtos</Button></Link>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {paginatedProducts.map((product) => (viewMode === "grid" ? <ProductCard key={product.id} product={product} /> : <ProductRow key={product.id} product={product} />))}
              </div>
            )}

            {filteredProducts.length > 0 && totalPages > 1 && (
              <Card className="mt-12">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Itens por página</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="24">24</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <nav className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><ChevronDown className="h-4 w-4 rotate-90" /></Button>
                      {Array.from({ length: totalPages }).map((_, i) => (<Button key={i + 1} variant={currentPage === i + 1 ? "default" : "ghost"} size="sm" onClick={() => goToPage(i + 1)}>{i + 1}</Button>))}
                      <Button variant="ghost" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}><ChevronDown className="h-4 w-4 -rotate-90" /></Button>
                    </nav>
                  </div>
                </CardContent>
              </Card>
            )}

            {!searchQuery && filteredProducts.length > 0 && (
              <Card className="mt-12">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="acai-gradient p-4 rounded-full mr-6 shadow-lg"><Leaf className="h-8 w-8 text-primary-foreground" /></div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">A Origem dos Nossos Produtos</h3>
                        <p className="text-muted-foreground max-w-md">Descubra como preservamos a Amazônia através de produtos sustentáveis e comércio justo.</p>
                      </div>
                    </div>
                    <Link href="/about"><Button className="acai-button">Nossa História<ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
