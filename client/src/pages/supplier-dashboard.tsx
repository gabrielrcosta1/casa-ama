import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertCategorySchema, type InsertProduct, type InsertCategory, type Product, type Category, type Order } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Package, ShoppingBag, BarChart3, Settings, LogOut, Edit, Trash2, Eye, AlertCircle, CheckCircle2, Clock, Upload, X, Image as ImageIcon, Shield, FileText, Cookie } from "lucide-react";

export default function SupplierDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Get supplier info from localStorage (in production, use proper session management)
  const supplier = JSON.parse(localStorage.getItem('supplier') || '{}');
  
  // Check if supplier is logged in
  useEffect(() => {
    if (!supplier.id) {
      setLocation("/supplier/login");
    }
  }, [supplier.id, setLocation]);

  // Check if supplier is approved (allow access for testing)
  if (!supplier.isApproved && false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-700">Aguardando Aprovação</CardTitle>
            <CardDescription>
              Seu cadastro está sendo analisado pela nossa equipe. Você receberá um email quando for aprovado e poderá começar a adicionar produtos.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/")} className="flex-1">
              Voltar ao Início
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('supplier');
                setLocation("/supplier/login");
              }}
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fetch supplier's products (including non-approved for dashboard)
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { supplierId: supplier.id, isApproved: "all" }],
    enabled: !!supplier.id,
  });

  // Fetch supplier's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/supplier/orders", supplier.id],
    enabled: !!supplier.id,
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Product form
  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      brand: "",
      image: "",
      images: [],
      categoryId: undefined,
      supplierId: supplier.id,
      inStock: true,
      isOnSale: false,
      isFeatured: false,
    },
  });

  // Category form
  const categoryForm = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return apiRequest("POST", "/api/supplier/products", data);
    },
    onSuccess: () => {
      toast({
        title: "Produto criado!",
        description: "Produto enviado para aprovação.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddProductOpen(false);
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: number; product: InsertProduct }) => {
      return apiRequest("PUT", `/api/supplier/products/${data.id}`, data.product);
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado!",
        description: "Produto atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/supplier/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto removido!",
        description: "Produto removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      return apiRequest("POST", "/api/supplier/categories", data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria criada!",
        description: "Categoria criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsAddCategoryOpen(false);
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProduct = (data: InsertProduct) => {
    // Combine the main image with additional uploaded images
    const productData = {
      ...data,
      images: uploadedImages.slice(1) // Exclude first image as it's the main image
    };
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, product: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const onSubmitCategory = (data: InsertCategory) => {
    createCategoryMutation.mutate(data);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      ...product,
      categoryId: product.categoryId || undefined,
    });
    // Set existing images for editing
    setUploadedImages([product.image, ...(product.images || [])]);
    setIsAddProductOpen(true);
  };

  // Image upload handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to array and process each file
    Array.from(files).forEach((file) => {
      if (uploadedImages.length >= 3) {
        toast({
          title: "Limite de imagens atingido",
          description: "Você pode adicionar no máximo 3 imagens por produto.",
          variant: "destructive",
        });
        return;
      }

      // Simulate image upload - in production, upload to a service
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadedImages(prev => [...prev, imageUrl]);
        
        // Set the first image as the main image
        if (uploadedImages.length === 0) {
          productForm.setValue("image", imageUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    // Update main image if removing the first one
    if (index === 0 && newImages.length > 0) {
      productForm.setValue("image", newImages[0]);
    } else if (index === 0) {
      productForm.setValue("image", "");
    }
  };

  const resetProductForm = () => {
    setIsAddProductOpen(false);
    setEditingProduct(null);
    setUploadedImages([]);
    productForm.reset();
  };

  const handleLogout = () => {
    localStorage.removeItem('supplier');
    setLocation("/supplier/login");
  };

  const getStatusBadge = (isApproved?: boolean) => {
    if (isApproved) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  if (!supplier.id) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                Floresta Viva
              </Link>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-lg font-medium text-gray-700">Portal do Fornecedor</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Bem-vindo, <strong>{supplier.companyName}</strong>
              </span>
              <Link href="/privacy-policy">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <Shield className="w-4 h-4 mr-2" />
                  Política de Privacidade
                </Button>
              </Link>
              <Link href="/terms-of-use">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <FileText className="w-4 h-4 mr-2" />
                  Termos de Uso
                </Button>
              </Link>
              <Link href="/cookie-policy">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <Cookie className="w-4 h-4 mr-2" />
                  Política de Cookies
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Fornecedor</h1>
          <p className="text-gray-600 mt-2">Gerencie seus produtos, categorias e pedidos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.isApproved).length} aprovados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos do Mês</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                +{orders.filter(o => o.status === 'pending').length} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {orders.reduce((sum, order) => sum + parseFloat(order.total || "0"), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meus Produtos</h2>
              <Button onClick={() => setIsAddProductOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>

            {productsLoading ? (
              <div className="text-center py-8">Carregando produtos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {getStatusBadge(product.isApproved ?? false)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-primary">
                          R$ {parseFloat(product.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Marca: {product.brand}</p>
                        <p className="text-sm text-gray-600">
                          Estoque: {product.inStock ? "Disponível" : "Indisponível"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Meus Pedidos</h2>
            
            {ordersLoading ? (
              <div className="text-center py-8">Carregando pedidos...</div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido ainda</h3>
                  <p className="text-gray-600">Quando você receber pedidos, eles aparecerão aqui.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID do Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: Order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </TableCell>
                        <TableCell>{order.customerName || 'Cliente'}</TableCell>
                        <TableCell>R$ {parseFloat(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status === 'pending' && 'Pendente'}
                            {order.status === 'paid' && 'Pago'}
                            {order.status === 'processing' && 'Processando'}
                            {order.status === 'shipped' && 'Enviado'}
                            {order.status === 'delivered' && 'Entregue'}
                            {order.status === 'cancelled' && 'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Categorias</h2>
              <Button onClick={() => setIsAddCategoryOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Categoria
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: Category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Slug: {category.slug}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Adicionar Produto"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do produto. Produtos passam por aprovação antes de ficarem visíveis.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  {...productForm.register("name")}
                  placeholder="Ex: Smartphone Galaxy"
                />
                {productForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {productForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="productPrice">Preço *</Label>
                <Input
                  id="productPrice"
                  {...productForm.register("price")}
                  placeholder="299.99"
                  type="number"
                  step="0.01"
                />
                {productForm.formState.errors.price && (
                  <p className="text-sm text-red-600 mt-1">
                    {productForm.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="productBrand">Marca</Label>
                <Input
                  id="productBrand"
                  {...productForm.register("brand")}
                  placeholder="Samsung"
                />
              </div>

              <div>
                <Label htmlFor="productCategory">Categoria</Label>
                <Select
                  value={productForm.watch("categoryId")?.toString()}
                  onValueChange={(value) =>
                    productForm.setValue("categoryId", value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Imagens do Produto (máximo 3)</Label>
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadedImages.length >= 3}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center space-y-2 ${
                        uploadedImages.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploadedImages.length >= 3 
                          ? 'Limite de 3 imagens atingido' 
                          : 'Clique para adicionar imagens ou arraste aqui'
                        }
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, JPEG até 5MB cada
                      </span>
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-blue-600 text-white text-xs">
                                Principal
                              </Badge>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual URL Input (fallback) */}
                  <div className="pt-4 border-t">
                    <Label htmlFor="productImageUrl" className="text-sm text-gray-600">
                      Ou insira URL da imagem manualmente
                    </Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        id="productImageUrl"
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="flex-1"
                        onBlur={(e) => {
                          const url = e.target.value.trim();
                          if (url && uploadedImages.length < 3) {
                            setUploadedImages(prev => [...prev, url]);
                            if (uploadedImages.length === 0) {
                              productForm.setValue("image", url);
                            }
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          const input = document.getElementById('productImageUrl') as HTMLInputElement;
                          const url = input.value.trim();
                          if (url && uploadedImages.length < 3) {
                            setUploadedImages(prev => [...prev, url]);
                            if (uploadedImages.length === 0) {
                              productForm.setValue("image", url);
                            }
                            input.value = '';
                          }
                        }}
                        disabled={uploadedImages.length >= 3}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Hidden field for main image */}
                <Input
                  type="hidden"
                  {...productForm.register("image")}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="productDescription">Descrição</Label>
                <Textarea
                  id="productDescription"
                  {...productForm.register("description")}
                  placeholder="Descreva o produto..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetProductForm}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {editingProduct ? "Atualizar" : "Criar"} Produto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar seus produtos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Nome da Categoria *</Label>
              <Input
                id="categoryName"
                {...categoryForm.register("name")}
                placeholder="Ex: Eletrônicos"
              />
              {categoryForm.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {categoryForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="categorySlug">Slug *</Label>
              <Input
                id="categorySlug"
                {...categoryForm.register("slug")}
                placeholder="eletronicos"
              />
              {categoryForm.formState.errors.slug && (
                <p className="text-sm text-red-600 mt-1">
                  {categoryForm.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="categoryDescription">Descrição</Label>
              <Textarea
                id="categoryDescription"
                {...categoryForm.register("description")}
                placeholder="Descrição da categoria..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddCategoryOpen(false);
                  categoryForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                Criar Categoria
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}