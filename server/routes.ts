import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, customerLoginSchema, insertSupplierSchema, supplierLoginSchema, insertCartItemSchema, insertOrderSchema, insertProductSchema, insertCategorySchema, passwordResetRequestSchema, passwordResetSchema, type Customer, type Supplier, type Product, type ProductWithCategory } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "./emailService";
import { getProductRecommendations } from "./recommendation/recommender";
import { createVindiTransaction, getVindiTransaction } from "./vindiService";
import { generateTokenPair, verifyRefreshToken, revokeRefreshToken, storeRefreshToken, getStoredRefreshToken, revokeToken } from "./auth/jwt";
import { requireAuth, requirePermission, type AuthenticatedRequest } from "./auth/middleware";
import { searchProducts, syncProductToElasticsearch, invalidateSearchCache } from "./services/search";
import { invalidateRecommendationCache } from "./services/recommendation-cache";
import { calculateShipping } from "./services/shipping";
import { createOrderTransactionally, createDeliveryForOrder } from "./services/orders";
import { getTrackingHistory, getLatestTracking } from "./services/tracking";
import { createFeedback, getProductFeedback, requestFeedbackForOrder } from "./services/feedback";
import { getSalesAnalytics, getCustomerAnalytics, getProductPerformance, syncAnalyticsToBigQuery } from "./services/analytics";
import { processPayment, handleWebhook } from "./services/payment";
import { getCartFromRedis, syncCartToPostgreSQL, syncCartFromPostgreSQL, clearCartRedis } from "./services/cart";
import healthRouter from "./routes/health";

// Helper function to parse address JSON if it's a valid JSON string
function transformCustomerResponse(customer: Customer): Customer {
  if (customer.address && typeof customer.address === 'string') {
    try {
      const parsed = JSON.parse(customer.address);
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...customer, address: parsed as any };
      }
    } catch {
      // If parsing fails, keep the original string
    }
  }
  return customer;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check routes (must be early for load balancer checks)
  app.use(healthRouter);
  // Generate session ID for cart functionality
  app.use((req, res, next) => {
    if (!req.headers['x-session-id']) {
      req.headers['x-session-id'] = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
  });

  // ... (outras rotas de pagamento, auth, etc., permanecem iguais) ...

  // =================================================================
  // === NOVOS ENDPOINTS DE PAGAMENTO VINDI (CORRIGIDOS) =============
  // =================================================================

  /**
   * Endpoint para criar uma nova transação de pagamento.
   * Recebe os dados do frontend, VALIDA CUIDADOSAMENTE, e repassa para o vindiService.
   */
  app.post('/api/create-payment', async (req, res) => {
    try {
      // Desestrutura o corpo da requisição para facilitar o acesso e a validação
      const { amount, paymentMethod, customer, shipping, cartItems, cardToken } = req.body;

      // --- Bloco de Validação Detalhado ---
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "O valor da transação é inválido." });
      }
      if (!paymentMethod) {
        return res.status(400).json({ message: "O método de pagamento não foi especificado." });
      }
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: "O carrinho está vazio ou em formato inválido." });
      }

      // Validação do Cliente
      if (!customer) {
        return res.status(400).json({ message: "Os dados do cliente estão ausentes." });
      }
      // AJUSTE: Adicionada a validação para o campo 'phone'
      if (!customer.customerName || !customer.customerEmail || !customer.cpf || !customer.phone) {
        return res.status(400).json({ message: "Dados do cliente incompletos (nome, email, CPF ou telefone)." });
      }

      // Validação do Endereço de Entrega
      if (!shipping) {
        return res.status(400).json({ message: "Os dados de entrega estão ausentes." });
      }
      const requiredShippingFields = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
      for (const field of requiredShippingFields) {
        if (!shipping[field]) {
          return res.status(400).json({ message: `Dado de entrega ausente: '${field}'.` });
        }
      }

      // Validação para cartão de crédito
      if (paymentMethod === 'credit_card' && !cardToken) {
        return res.status(400).json({ message: 'Token do cartão é obrigatório para este método de pagamento.' });
      }
      // --- Fim da Validação ---

      console.log(`[Backend] Dados validados para pagamento Vindi: ${paymentMethod} - Valor: ${amount}`);

      // Monta o objeto de dados no formato exato que o vindiService espera
      const paymentDataForService = {
        amount,
        paymentMethod,
        customer: {
          name: customer.customerName,
          email: customer.customerEmail,
          cpf: customer.cpf,
          phone: customer.phone // AJUSTE: Repassando o telefone para o serviço
        },
        shipping,
        cartItems,
        cardToken,
      };

      // Chama a função que se comunica com a Vindi
      const vindiResponse = await createVindiTransaction(paymentDataForService);

      console.log('[Backend] Transação criada com sucesso na Vindi.');

      // Retorna a resposta da Vindi para o frontend
      res.status(200).json(vindiResponse);

    } catch (error: any) {
      console.error('[Backend] Erro ao processar pagamento Vindi:', error);
      res.status(500).json({ message: error.message || 'Ocorreu um erro no servidor ao processar o pagamento.' });
    }
  });

  /**
   * Endpoint para consultar os detalhes de um pedido/transação.
   * Usado pela página de sucesso para exibir os detalhes finais.
   */
  app.get('/api/orders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        return res.status(400).json({ message: 'ID (token) do pedido é obrigatório.' });
      }
      console.log(`[Backend] Consultando pedido na Vindi com token: ${orderId}`);
      const orderDetails = await getVindiTransaction(orderId);
      console.log('[Backend] Pedido encontrado com sucesso na Vindi.');
      res.status(200).json(orderDetails);
    } catch (error: any) {
      console.error('[Backend] Erro ao buscar pedido na Vindi:', error);
      res.status(500).json({ message: error.message || 'Ocorreu um erro no servidor ao buscar o pedido.' });
    }
  });

  // =================================================================
  // === FIM DOS ENDPOINTS VINDI =====================================
  // =================================================================


  // Customer Authentication Routes (sem alteração)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const existingCustomer = await storage.getCustomerByEmail(validatedData.email);
      if (existingCustomer) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      const customer = await storage.createCustomer(validatedData);
      const transformedCustomer = transformCustomerResponse(customer);
      const { password: _, ...customerResponse } = transformedCustomer;
      // Envia email de boas-vindas (não bloqueia a resposta)
      import('./emailService').then(({ sendWelcomeEmail }) => {
        sendWelcomeEmail(customer.email, customer.firstName).catch(() => {});
      });
      res.status(201).json(customerResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = customerLoginSchema.parse(req.body);
      const customer = await storage.validateCustomerPassword(validatedData.email, validatedData.password);
      if (!customer) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }
      const transformedCustomer = transformCustomerResponse(customer);
      const { password: _, ...customerResponse } = transformedCustomer;

      const useJWT = req.query.jwt === 'true' || req.body.jwt === true;
      if (useJWT) {
        const tokens = generateTokenPair(customer, 'customer');
        await storeRefreshToken(customer.id, 'customer', tokens.refreshToken);
        res.json({ ...customerResponse, ...tokens });
      } else {
        res.json(customerResponse);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/auth/customer/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      const transformedCustomer = transformCustomerResponse(customer);
      const { password: _, ...customerResponse } = transformedCustomer;
      res.json(customerResponse);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/auth/customer/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const customer = await storage.updateCustomer(id, updateData);
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      const transformedCustomer = transformCustomerResponse(customer);
      const { password: _, ...customerResponse } = transformedCustomer;
      res.json(customerResponse);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/customer/:id/change-password", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "A nova senha deve ter pelo menos 8 caracteres" });
      }

      const customer = await storage.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      // Valida senha atual
      const isValidPassword = await storage.validateCustomerPassword(customer.email, currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Senha atual incorreta" });
      }

      // Atualiza senha
      const updated = await storage.updateCustomerPassword(id, newPassword);
      if (!updated) {
        return res.status(500).json({ message: "Erro ao atualizar senha" });
      }

      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Supplier Authentication Routes (sem alteração)
  app.post("/api/supplier/register", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const existingSupplier = await storage.getSupplierByEmail(validatedData.email);
      if (existingSupplier) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      const supplier = await storage.createSupplier(validatedData);
      const { password: _, ...supplierResponse } = supplier;
      res.status(201).json(supplierResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/supplier/login", async (req, res) => {
    try {
      const validatedData = supplierLoginSchema.parse(req.body);
      const supplier = await storage.validateSupplierPassword(validatedData.email, validatedData.password);
      if (!supplier) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }
      const { password: _, ...supplierResponse } = supplier;

      const useJWT = req.query.jwt === 'true' || req.body.jwt === true;
      if (useJWT) {
        const tokens = generateTokenPair(supplier, 'supplier');
        await storeRefreshToken(supplier.id, 'supplier', tokens.refreshToken);
        res.json({ ...supplierResponse, ...tokens });
      } else {
        res.json(supplierResponse);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/supplier/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplierById(id);
      if (!supplier) {
        return res.status(404).json({ message: "Fornecedor não encontrado" });
      }
      const { password: _, ...supplierResponse } = supplier;
      res.json(supplierResponse);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/suppliers", async (req, res) => {
    try {
      const { isApproved, isActive } = req.query;
      const filters: any = {};
      if (isApproved !== undefined) {
        filters.isApproved = isApproved === 'true';
      }
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }
      const suppliers = await storage.getSuppliers(filters);
      const suppliersResponse = suppliers.map(({ password: _, ...supplier }) => supplier);
      res.json(suppliersResponse);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Supplier Products Routes (Protected) (sem alteração)
  app.get("/api/supplier/products", async (req, res) => {
    try {
      const { supplierId } = req.query;
      if (!supplierId) {
        return res.status(400).json({ message: "ID do fornecedor é obrigatório" });
      }
      const products = await storage.getProducts({ supplierId: parseInt(supplierId as string) });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/supplier/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      await invalidateRecommendationCache();
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/supplier/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      await invalidateRecommendationCache();
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/supplier/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      await invalidateRecommendationCache();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Supplier Categories Routes (sem alteração)
  app.post("/api/supplier/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Supplier Orders Routes (sem alteração)
  app.get("/api/supplier/orders/:supplierId", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const orders = await storage.getOrdersBySupplier(supplierId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Admin authentication session storage (sem alteração)
  const adminSessions = new Set<string>();

  // Admin authentication middleware (sem alteração)
  const requireAdminAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers['x-admin-session-id'] as string;
    if (!sessionId || !adminSessions.has(sessionId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Admin authentication routes (sem alteração)
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
      const sessionId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      adminSessions.add(sessionId);
      res.json({ success: true, sessionId, message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  app.get('/api/admin/auth', (req, res) => {
    const sessionId = req.headers['x-admin-session-id'] as string;
    if (sessionId && adminSessions.has(sessionId)) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    const sessionId = req.headers['x-admin-session-id'] as string;
    if (sessionId) {
      adminSessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // Admin product management routes (sem alteração)
  app.get('/api/admin/products/pending', requireAdminAuth, async (req, res) => {
    try {
      const products = await storage.getProducts({ isApproved: false });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/admin/products/:id/approve', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.approveProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json({ message: 'Produto aprovado com sucesso', product });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/admin/products/:id/reject', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.rejectProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json({ message: 'Produto rejeitado', product });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Admin supplier management routes (sem alteração)
  app.get('/api/admin/suppliers', requireAdminAuth, async (req, res) => {
    try {
      const { isApproved, isActive } = req.query;
      const filters: any = {};
      if (isApproved !== undefined) {
        filters.isApproved = isApproved === 'true';
      }
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }
      const suppliers = await storage.getSuppliers(filters);
      const suppliersResponse = suppliers.map(({ password: _, ...supplier }) => supplier);
      res.json(suppliersResponse);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post('/api/admin/suppliers/:id/approve', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.approveSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      const { password: _, ...supplierResponse } = supplier;
      res.json({ message: 'Fornecedor aprovado com sucesso', supplier: supplierResponse });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao aprovar fornecedor' });
    }
  });

  // Categories (sem alteração)
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Search endpoint with Elasticsearch
  app.get("/api/products/search", async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        supplierId: req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined,
        brand: req.query.brand as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        search: req.query.search as string,
        isOnSale: req.query.isOnSale === "true" ? true : req.query.isOnSale === "false" ? false : undefined,
        isFeatured: req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : undefined,
        isApproved: req.query.isApproved !== undefined ? req.query.isApproved === "true" : true,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const products = await searchProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // =================================================================
  // === ROTA DE PRODUTOS TOTALMENTE REFEITA =========================
  // =================================================================
  app.get("/api/products", async (req, res) => {
    try {
      const {
        recommendedFor,
        categoryId,
        // MUDANÇA 1: Adicionamos os novos parâmetros que o frontend envia
        category: categoryName, // `category` vira `categoryName` para não confundir
        filter: specialFilter,  // `filter` vira `specialFilter`
        supplierId,
        brand,
        minPrice,
        maxPrice,
        minRating,
        search,
        isOnSale,
        isFeatured,
        isApproved,
        sortBy = "name",
        sortOrder = "asc"
      } = req.query;

      if (recommendedFor && typeof recommendedFor === 'string') {
        const productIds = recommendedFor.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        const recommendedProducts = await getProductRecommendations(productIds);
        return res.json(recommendedProducts);
      }

      let effectiveCategoryId = categoryId ? parseInt(categoryId as string) : undefined;

      // MUDANÇA 2: Traduz o NOME da categoria para um ID
      // Se o frontend enviou um nome de categoria, vamos encontrar o ID dele.
      if (categoryName && typeof categoryName === 'string') {
        const category = await storage.getCategoryByName(categoryName);
        if (category) {
          effectiveCategoryId = category.id;
        } else {
          // Se a categoria não existe, retorna uma lista vazia.
          return res.json([]);
        }
      }

      const filters = {
        // Agora usamos o ID da categoria, seja ele vindo diretamente ou traduzido do nome
        categoryId: effectiveCategoryId,
        supplierId: supplierId ? parseInt(supplierId as string) : undefined,
        brand: brand as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        search: search as string,
        isOnSale: isOnSale === "true" ? true : isOnSale === "false" ? false : undefined,
        isFeatured: isFeatured === "true" ? true : isFeatured === "false" ? false : undefined,
        isApproved: isApproved !== undefined ? isApproved === "true" : true,
      };

      // MUDANÇA 3: Traduz o filtro especial ('new' ou 'sale')
      if (specialFilter === 'new') {
        filters.isFeatured = true;
      }
      if (specialFilter === 'sale') {
        filters.isOnSale = true;
      }

      // Se há busca, usa Elasticsearch para melhor performance e suporte a acentos
      let products: ProductWithCategory[];
      if (filters.search) {
        try {
          const sb = typeof sortBy === 'string' ? (sortBy as string) : undefined;
          const so: 'asc' | 'desc' = sortOrder === 'desc' ? 'desc' : 'asc';
          products = await searchProducts({
            ...filters,
            sortBy: sb,
            sortOrder: so,
          });
        } catch (error) {
          console.error('Elasticsearch search failed, falling back to PostgreSQL:', error);
          products = await storage.getProducts(filters);
        }
      } else {
        products = await storage.getProducts(filters);
      }

      products.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Product];
        let bValue: any = b[sortBy as keyof Product];

        if (sortBy === "price" || sortBy === "rating") {
          aValue = parseFloat(aValue as string) || 0;
          bValue = parseFloat(bValue as string) || 0;
        }

        if (sortOrder === "desc") {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      res.json(products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      res.status(500).json({ message: "Failed to fetch products", error: error instanceof Error ? error.message : String(error) });
    }
  });


  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // #################################################################
  // ### ROTA DO CARRINHO QUE PRECISA SER CORRIGIDA ##################
  // #################################################################
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });

      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(id, quantity);

      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);

      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Admin Routes (sem alteração)
  app.post("/api/products", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);

      const productWithCategory = await storage.getProducts({});
      const newProduct = productWithCategory.find(p => p.id === product.id);
      if (newProduct) {
        await syncProductToElasticsearch(newProduct);
        await invalidateSearchCache();
        await invalidateRecommendationCache();
      }

      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productWithCategory = await storage.getProducts({});
      const updatedProduct = productWithCategory.find(p => p.id === id);
      if (updatedProduct) {
        await syncProductToElasticsearch(updatedProduct);
        await invalidateSearchCache();
        await invalidateRecommendationCache();
      }

      res.json(product);
    } catch (error) {
      console.error('### ERRO DETALHADO NO UPDATE DO PRODUTO: ###', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      await invalidateRecommendationCache();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin Routes - Categories (Protected) (sem alteração)
  app.post("/api/categories", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin Routes - Suppliers (Protected) (sem alteração)
  app.post("/api/admin/suppliers/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.approveSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao aprovar fornecedor' });
    }
  });

  app.post("/api/admin/products/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.approveProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get all orders for admin (Protected) (sem alteração)
  app.get("/api/orders", requireAdminAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Orders (sem alteração)
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const total = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);
      const validatedOrder = insertOrderSchema.parse({
        sessionId,
        total: total.toFixed(2),
        status: "pending"
      });
      const order = await storage.createOrder(validatedOrder);
      for (const cartItem of cartItems) {
        await storage.addOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price
        });
      }
      await storage.clearCart(sessionId);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Payment Routes (REMOVIDO E SUBSTITUÍDO)
  /* A lógica original do Stripe foi removida daqui.
      Os novos endpoints da Vindi estão no topo do arquivo.
  */

  // Get order status (O endpoint original foi substituído pelo da Vindi no topo do arquivo)
  /*
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  */

  // Password reset routes (sem alteração)
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email, userType } = passwordResetRequestSchema.parse(req.body);
      let userExists = false;
      let userId: number | undefined;
      if (userType === 'customer') {
        const customer = await storage.getCustomerByEmail(email);
        userExists = !!customer;
        userId = customer?.id;
      } else if (userType === 'supplier') {
        const supplier = await storage.getSupplierByEmail(email);
        userExists = !!supplier;
        userId = supplier?.id;
      } else if (userType === 'admin') {
        userExists = email === 'admin@loja.com';
        userId = 1;
      }
      if (!userExists) {
        return res.status(404).json({ message: 'Email não encontrado para este tipo de usuário' });
      }
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await storage.createPasswordResetToken({ email, token, userType, expiresAt });
      const emailSent = await sendPasswordResetEmail(email, token, userType);
      if (!emailSent) {
        return res.status(500).json({ message: 'Erro ao enviar email. Tente novamente.' });
      }
      res.json({ message: 'Email de recuperação enviado com sucesso' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: 'Token inválido' });
      }
      if (resetToken.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Token expirado' });
      }
      if (resetToken.usedAt) {
        return res.status(400).json({ message: 'Token já foi utilizado' });
      }
      let passwordUpdated = false;
      if (resetToken.userType === 'customer') {
        const customer = await storage.getCustomerByEmail(resetToken.email);
        if (customer) {
          passwordUpdated = await storage.updateCustomerPassword(customer.id, newPassword);
        }
      } else if (resetToken.userType === 'supplier') {
        const supplier = await storage.getSupplierByEmail(resetToken.email);
        if (supplier) {
          passwordUpdated = await storage.updateSupplierPassword(supplier.id, newPassword);
        }
      } else if (resetToken.userType === 'admin') {
        passwordUpdated = await storage.updateAdminPassword(newPassword);
      }
      if (!passwordUpdated) {
        return res.status(500).json({ message: 'Erro ao atualizar senha' });
      }
      await storage.markTokenAsUsed(token);
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/cleanup-tokens', async (req, res) => {
    try {
      await storage.cleanupExpiredTokens();
      res.json({ message: 'Tokens expirados removidos' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao limpar tokens' });
    }
  });

  // JWT Authentication Routes
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const payload = verifyRefreshToken(refreshToken);
      const storedToken = await getStoredRefreshToken(payload.userId, payload.userType);

      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const tokens = generateTokenPair(
        { id: payload.userId, email: payload.email } as Customer | Supplier,
        payload.userType as 'customer' | 'supplier'
      );
      await storeRefreshToken(payload.userId, payload.userType, tokens.refreshToken);

      res.json(tokens);
    } catch (error: any) {
      res.status(401).json({ message: error.message || 'Invalid refresh token' });
    }
  });

  app.post('/api/auth/logout', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await revokeToken(token, 15 * 60);
      }

      if (req.user) {
        await revokeRefreshToken(req.user.userId, req.user.userType);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error during logout' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (req.user.userType === 'customer') {
        const customer = await storage.getCustomerById(req.user.userId);
        if (!customer) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        const { password: _, ...customerResponse } = customer;
        res.json(customerResponse);
      } else if (req.user.userType === 'supplier') {
        const supplier = await storage.getSupplierById(req.user.userId);
        if (!supplier) {
          return res.status(404).json({ message: 'Supplier not found' });
        }
        const { password: _, ...supplierResponse } = supplier;
        res.json(supplierResponse);
      } else {
        res.json({ id: req.user.userId, userType: 'admin', email: req.user.email });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });

  // Shipping calculation
  app.post('/api/shipping/calculate', async (req, res) => {
    try {
      const { products, address } = req.body;
      const options = await calculateShipping(products, address);
      res.json(options);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Error calculating shipping' });
    }
  });

  // Enhanced order creation with transactional stock management
  app.post('/api/orders/create', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cartItems = await getCartFromRedis(sessionId);

      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const orderData = {
        sessionId,
        customerId: req.body.customerId,
        customerEmail: req.body.customerEmail,
        customerName: req.body.customerName,
        shippingAddress: req.body.shippingAddress,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingMethod: req.body.shippingMethod,
        shippingPrice: req.body.shippingPrice,
      };

      const orderId = await createOrderTransactionally(orderData);

      const orderItems = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
      }));

      const destination = {
        id: 0,
        name: req.body.customerName || 'Customer',
        lat: parseFloat(req.body.latitude || '-23.5505'),
        lng: parseFloat(req.body.longitude || '-46.6333'),
        type: 'customer' as const,
      };

      await createDeliveryForOrder(orderId, orderItems, destination);
      await clearCartRedis(sessionId);

      // Email de pedido criado (se informarmos email do cliente)
      if (req.body.customerEmail) {
        const itemsForEmail = orderItems.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        }));
        import('./emailService').then(({ sendOrderCreatedEmail }) => {
          sendOrderCreatedEmail({
            email: req.body.customerEmail,
            customerName: req.body.customerName,
            orderId,
            items: itemsForEmail,
            total: itemsForEmail.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0).toFixed(2),
          }).catch(() => {});
        });
      }

      res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to create order' });
    }
  });

  // Tracking endpoints
  app.get('/api/tracking/:deliveryId', async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.deliveryId);
      const history = await getTrackingHistory(deliveryId);
      const latest = await getLatestTracking(deliveryId);
      res.json({ history, latest });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tracking data' });
    }
  });

  // Feedback endpoints
  app.post('/api/feedback', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { orderId, productId, rating, comment } = req.body;
      await createFeedback({
        orderId,
        productId,
        customerId: req.user?.userId,
        rating,
        comment,
      });
      res.json({ message: 'Feedback submitted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Error submitting feedback' });
    }
  });

  app.get('/api/feedback/product/:productId', async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const feedbacks = await getProductFeedback(productId);
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching feedback' });
    }
  });

  app.post('/api/feedback/request/:orderId', async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      await requestFeedbackForOrder(orderId);
      res.json({ message: 'Feedback request created' });
    } catch (error) {
      res.status(500).json({ message: 'Error creating feedback request' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/sales', requireAuth, requirePermission('analytics:read'), async (req: AuthenticatedRequest, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const period = startDate && endDate ? { startDate, endDate } : undefined;
      const analytics = await getSalesAnalytics(period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching sales analytics' });
    }
  });

  app.get('/api/analytics/customers', requireAuth, requirePermission('analytics:read'), async (req: AuthenticatedRequest, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const period = startDate && endDate ? { startDate, endDate } : undefined;
      const analytics = await getCustomerAnalytics(period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customer analytics' });
    }
  });

  app.get('/api/analytics/products', requireAuth, requirePermission('analytics:read'), async (req: AuthenticatedRequest, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const period = startDate && endDate ? { startDate, endDate } : undefined;
      const analytics = await getProductPerformance(period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product analytics' });
    }
  });

  // Payment webhooks
  app.post('/api/webhooks/stripe', async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await handleWebhook('stripe', req.body, signature);
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/webhooks/vindi', async (req, res) => {
    try {
      await handleWebhook('vindi', req.body, '');
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Enhanced payment endpoint
  app.post('/api/payment/process', async (req, res) => {
    try {
      const result = await processPayment(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Payment processing failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
