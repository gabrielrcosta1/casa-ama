import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Filter, X, Sparkles, Tag } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import type { ProductWithCategory } from "@shared/schema";

type ProductForFilter = ProductWithCategory & { brand?: string | null };

interface FilterState {
  priceRanges: string[];
  brands: string[];
  categories: string[];
  ratings: number[];
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  allProducts: ProductForFilter[];
  activeFilters: FilterState;
}

export function ProductFilters({ onFiltersChange, allProducts, activeFilters }: ProductFiltersProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [location, navigate] = useLocation();
  const search = useSearch();
  const currentUrlFilter = new URLSearchParams(search).get('filter');

  const availableBrands = useMemo(() => {
    if (!allProducts) return [];
    const brandCounts = allProducts.reduce((acc, product) => {
      const brandName = product.brand;
      if (brandName) {
        acc[brandName] = (acc[brandName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allProducts]);
  
  const availableCategories = useMemo(() => {
    if (!allProducts) return [];
    const categoryCounts = allProducts.reduce((acc, product) => {
      const categoryName = product.category.name;
      if (categoryName) {
        acc[categoryName] = (acc[categoryName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allProducts]);

  const handleSpecialFilterClick = (filterType: 'new' | 'sale') => {
    const params = new URLSearchParams(search);
    if (params.get('filter') === filterType) {
      params.delete('filter');
    } else {
      params.set('filter', filterType);
    }
    params.delete('category');
    navigate(`${location}?${params.toString()}`);
  };

  // MUDANÇA 1: Lógica simplificada e corrigida
  const handleCheckboxChange = (
    type: keyof FilterState,
    value: string | number,
    checked: boolean
  ) => {
    const currentValues = activeFilters[type] as (string | number)[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    // Ao aplicar um filtro manual, limpamos os filtros da URL para dar prioridade
    const params = new URLSearchParams(search);
    params.delete('filter');
    params.delete('category');
    navigate(`${location}?${params.toString()}`);

    onFiltersChange({ ...activeFilters, [type]: newValues });
  };

  const clearFilters = () => {
    // Limpar também remove os filtros da URL
    navigate('/');
    onFiltersChange({ priceRanges: [], brands: [], categories: [], ratings: [] });
  };
  
  const hasActiveFilters = activeFilters.brands.length > 0 || activeFilters.categories.length > 0 || activeFilters.priceRanges.length > 0 || activeFilters.ratings.length > 0 || !!currentUrlFilter;

  const priceRanges = [
    { label: "Até R$ 100", value: "0-100" },
    { label: "R$ 100 - R$ 200", value: "100-200" },
    { label: "R$ 200 - R$ 400", value: "200-400" },
    { label: "Acima de R$ 400", value: "400-999999" },
  ];

  const ratings = [5, 4, 3, 2, 1];

  const filterContent = (
    <div>
      <div className="space-y-2 mb-4 p-1">
        <Button variant={currentUrlFilter === 'new' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleSpecialFilterClick('new')}>
          <Sparkles className="mr-2 h-4 w-4" /> Novidades
        </Button>
        <Button variant={currentUrlFilter === 'sale' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => handleSpecialFilterClick('sale')}>
          <Tag className="mr-2 h-4 w-4" /> Promoções
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "brand", "rating"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="font-medium text-slate-700">Categorias</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-40">
              <div className="space-y-3 pt-2 pr-4">
                {availableCategories.map((category) => (
                  <div key={category.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`category-${category.label}`} checked={activeFilters.categories.includes(category.label)} onCheckedChange={(checked) => handleCheckboxChange("categories", category.label, checked as boolean)} />
                      <label htmlFor={`category-${category.label}`} className="text-sm text-slate-600 cursor-pointer">{category.label}</label>
                    </div>
                    <span className="text-xs text-slate-400">({category.count})</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="font-medium text-slate-700">Faixa de Preço</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {priceRanges.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <Checkbox id={`price-${range.value}`} checked={activeFilters.priceRanges.includes(range.value)} onCheckedChange={(checked) => handleCheckboxChange("priceRanges", range.value, checked as boolean)}/>
                  <label htmlFor={`price-${range.value}`} className="text-sm text-slate-600 cursor-pointer">{range.label}</label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {availableBrands.length > 0 && (
          <AccordionItem value="brand">
            <AccordionTrigger className="font-medium text-slate-700">Marcas</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-40">
                <div className="space-y-3 pt-2 pr-4">
                  {availableBrands.map((brand) => (
                    <div key={brand.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`brand-${brand.label}`} checked={activeFilters.brands.includes(brand.label)} onCheckedChange={(checked) => handleCheckboxChange("brands", brand.label, checked as boolean)} />
                        <label htmlFor={`brand-${brand.label}`} className="text-sm text-slate-600 cursor-pointer">{brand.label}</label>
                      </div>
                      <span className="text-xs text-slate-400">({brand.count})</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="rating">
          <AccordionTrigger className="font-medium text-slate-700">Avaliação</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {ratings.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} checked={activeFilters.ratings.includes(rating)} onCheckedChange={(checked) => handleCheckboxChange("ratings", rating, checked as boolean)} />
                  <label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                    <div className="flex text-sm">
                      {Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                      {Array.from({ length: 5 - rating }).map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)}
                    </div>
                    <span className="ml-2 text-sm text-slate-600">ou mais</span>
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <>
      <Card className="hidden lg:block sticky top-24">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filtros</CardTitle>
          {hasActiveFilters && (<Button onClick={clearFilters} variant="ghost" size="sm" className="text-sm">Limpar</Button>)}
        </CardHeader>
        <CardContent>{filterContent}</CardContent>
      </Card>
      <div className="lg:hidden mb-4">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-center">
              <Filter className="mr-2 h-4 w-4" />
              Mostrar Filtros {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-primary" />}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="flex justify-between items-center">
              <DrawerTitle>Filtros</DrawerTitle>
              <DrawerClose asChild><Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button></DrawerClose>
            </DrawerHeader>
            <div className="p-4"><ScrollArea className="h-[60vh]">{filterContent}</ScrollArea></div>
            <DrawerFooter className="flex-row gap-2">
              <Button onClick={clearFilters} variant="outline" className="flex-1">Limpar Filtros</Button>
              <DrawerClose asChild><Button className="flex-1">Ver Produtos</Button></DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}