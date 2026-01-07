import {
  customers, suppliers, categories, products, cartItems, orders, orderItems, passwordResetTokens,
  type Customer, type Supplier, type Category, type Product, type CartItem, type Order, type OrderItem,
  type InsertCustomer, type InsertSupplier, type InsertCategory, type InsertProduct, type InsertCartItem, type InsertOrder, type InsertOrderItem,
  type ProductWithCategory, type CartItemWithProduct, type SupplierWithProducts,
  type PasswordResetToken, type InsertPasswordResetToken
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, asc, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Customers
  getCustomerById(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  validateCustomerPassword(email: string, password: string): Promise<Customer | null>;

  // Suppliers
  getSupplierById(id: number): Promise<Supplier | undefined>;
  getSupplierByEmail(email: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  validateSupplierPassword(email: string, password: string): Promise<Supplier | null>;
  getSuppliers(filters?: { isApproved?: boolean; isActive?: boolean }): Promise<Supplier[]>;
  approveSupplier(id: number): Promise<Supplier | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Products
  getProducts(filters?: {
    categoryId?: number;
    supplierId?: number;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    isOnSale?: boolean;
    isFeatured?: boolean;
    isApproved?: boolean;
  }): Promise<ProductWithCategory[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  approveProduct(id: number): Promise<Product | undefined>;
  rejectProduct(id: number): Promise<Product | undefined>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  getOrdersBySupplier(supplierId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string, paymentStatus: string): Promise<Order | undefined>;

  // Password reset tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(token: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<void>;
  updateCustomerPassword(id: number, newPassword: string): Promise<boolean>;
  updateSupplierPassword(id: number, newPassword: string): Promise<boolean>;
  updateAdminPassword(newPassword: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private passwordResetTokens: Map<string, PasswordResetToken>;

  private customerIdCounter: number;
  private supplierIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private passwordResetTokenIdCounter: number;

  constructor() {
    this.customers = new Map();
    this.suppliers = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.passwordResetTokens = new Map();

    this.customerIdCounter = 1;
    this.supplierIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.passwordResetTokenIdCounter = 1;

    this.seedData();
  }

  private seedData() {
    // Seed categories
    const electronicsCategory: Category = {
      id: this.categoryIdCounter++,
      name: "Electronics",
      description: null,
      slug: "electronics"
    };
    this.categories.set(electronicsCategory.id, electronicsCategory);

    const clothingCategory: Category = {
      id: this.categoryIdCounter++,
      name: "Clothing",
      description: null,
      slug: "clothing"
    };
    this.categories.set(clothingCategory.id, clothingCategory);

    // Seed products
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        name: "iPhone 14 Pro Max",
        description: "The most advanced iPhone with Pro camera system, A16 Bionic chip, and all-day battery life.",
        price: "899.00",
        originalPrice: "999.00",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        brand: "Apple",
        categoryId: electronicsCategory.id,
        supplierId: null,
        stockQuantity: 10,
        isApproved: true,
        inStock: true,
        rating: "4.8",
        reviewCount: 127,
        isOnSale: true,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Samsung Galaxy S23 Ultra",
        description: "Premium Android phone with S Pen, advanced camera system, and powerful performance.",
        price: "799.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        brand: "Samsung",
        categoryId: electronicsCategory.id,
        supplierId: null,
        stockQuantity: 15,
        isApproved: true,
        inStock: true,
        rating: "4.6",
        reviewCount: 89,
        isOnSale: false,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Google Pixel 7 Pro",
        description: "Pure Android experience with exceptional camera AI and Google integration.",
        price: "649.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: [],
        brand: "Google",
        categoryId: electronicsCategory.id,
        supplierId: null,
        stockQuantity: 8,
        isApproved: true,
        inStock: true,
        rating: "4.9",
        reviewCount: 203,
        isOnSale: false,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "OnePlus 11 5G",
        description: "Fast charging flagship with Snapdragon processor and premium build quality.",
        price: "549.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: [],
        brand: "OnePlus",
        categoryId: electronicsCategory.id,
        supplierId: null,
        stockQuantity: 12,
        isApproved: true,
        inStock: true,
        rating: "4.4",
        reviewCount: 76,
        isOnSale: false,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Xiaomi Mi 13 Pro",
        description: "High-performance smartphone with Leica cameras and fast wireless charging.",
        price: "399.00",
        originalPrice: "499.00",
        image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: [],
        brand: "Xiaomi",
        categoryId: electronicsCategory.id,
        supplierId: null,
        stockQuantity: 20,
        isApproved: true,
        inStock: true,
        rating: "4.3",
        reviewCount: 94,
        isOnSale: true,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Sony Xperia 1 IV",
        description: "Professional photography smartphone with 4K display and advanced video features.",
        price: "749.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: [],
        brand: "Sony",
        categoryId: electronicsCategory.id,
        supplierId: null,
        stockQuantity: 5,
        isApproved: true,
        inStock: true,
        rating: "4.7",
        reviewCount: 52,
        isOnSale: false,
        isFeatured: false,
        createdAt: new Date()
      }
    ];

    sampleProducts.forEach(product => {
      const newProduct: Product = {
        ...product,
        id: this.productIdCounter++,
        categoryId: product.categoryId || null,
        originalPrice: product.originalPrice || null,
        inStock: product.inStock ?? true,
        rating: product.rating || null,
        reviewCount: product.reviewCount || 0,
        isOnSale: product.isOnSale ?? false,
        isFeatured: product.isFeatured ?? false,
        createdAt: product.createdAt || new Date()
      };
      this.products.set(newProduct.id, newProduct);
    });
  }

  // Customer methods
  async getCustomerById(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const customersArray = Array.from(this.customers.values());
    return customersArray.find(customer => customer.email === email);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const hashedPassword = await bcrypt.hash(customerData.password, 10);

    const newCustomer: Customer = {
      ...customerData,
      id: this.customerIdCounter++,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: customerData.phone || null,
      address: customerData.address || null,
      city: customerData.city || null,
      postalCode: customerData.postalCode || null,
      country: customerData.country || "Brasil",
    };

    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) {
      return undefined;
    }

    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customerData,
      id: id,
      updatedAt: new Date(),
    };

    if (customerData.password) {
      updatedCustomer.password = await bcrypt.hash(customerData.password, 10);
    }

    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async validateCustomerPassword(email: string, password: string): Promise<Customer | null> {
    const customer = await this.getCustomerByEmail(email);
    if (!customer) {
      return null;
    }

    const isValid = await bcrypt.compare(password, customer.password);
    return isValid ? customer : null;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    for (const category of this.categories.values()) {
        if (category.name === name) {
            return category;
        }
    }
    return undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      ...category,
      description: category.description || null,
      id: this.categoryIdCounter++
    };
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: InsertCategory): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      return undefined;
    }

    const updatedCategory: Category = {
      ...existingCategory,
      ...category,
      description: category.description || null,
      id: id
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getProducts(filters?: {
    categoryId?: number;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    isOnSale?: boolean;
    isFeatured?: boolean;
  }): Promise<ProductWithCategory[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.brand) {
        products = products.filter(p => p.brand.toLowerCase() === filters.brand!.toLowerCase());
      }
      if (filters.minPrice) {
        products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
      }
      if (filters.minRating) {
        products = products.filter(p => parseFloat(p.rating || "0") >= filters.minRating!);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm)
        );
      }
      if (filters.isOnSale !== undefined) {
        products = products.filter(p => p.isOnSale === filters.isOnSale);
      }
      if (filters.isFeatured !== undefined) {
        products = products.filter(p => p.isFeatured === filters.isFeatured);
      }
    }

    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined
    }));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: this.productIdCounter++,
      createdAt: new Date(),
      categoryId: product.categoryId || null,
      originalPrice: product.originalPrice || null,
      inStock: product.inStock ?? true,
      rating: product.rating || null,
      reviewCount: product.reviewCount || 0,
      isOnSale: product.isOnSale ?? false,
      isFeatured: product.isFeatured ?? false
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...product,
      id: id,
      categoryId: product.categoryId || null,
      originalPrice: product.originalPrice || null,
      inStock: product.inStock ?? true,
      rating: product.rating || null,
      reviewCount: product.reviewCount || 0,
      isOnSale: product.isOnSale ?? false,
      isFeatured: product.isFeatured ?? false
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId);

    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product not found for cart item ${item.id}`);
      }
      return {
        ...item,
        product
      };
    });
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(cartItem => cartItem.productId === item.productId && cartItem.sessionId === item.sessionId);

    if (existingItem) {
      // Update quantity
      existingItem.quantity += item.quantity || 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      // Create new cart item
      const newCartItem: CartItem = {
        ...item,
        id: this.cartItemIdCounter++,
        createdAt: new Date(),
        quantity: item.quantity || 1,
        sessionId: item.sessionId || null,
        customerId: item.customerId || null
      };
      this.cartItems.set(newCartItem.id, newCartItem);
      return newCartItem;
    }
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([, item]) => item.sessionId === sessionId);

    itemsToDelete.forEach(([id]) => {
      this.cartItems.delete(id);
    });

    return true;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: this.orderIdCounter++,
      createdAt: new Date(),
      status: order.status || "pending",
      sessionId: order.sessionId || null,
      customerId: order.customerId || null,
      customerEmail: order.customerEmail || null,
      customerName: order.customerName || null,
      shippingAddress: order.shippingAddress || null
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem: OrderItem = {
      ...orderItem,
      id: this.orderItemIdCounter++
    };
    this.orderItems.set(newOrderItem.id, newOrderItem);
    return newOrderItem;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersBySupplier(supplierId: number): Promise<Order[]> {
    // For MemStorage, we'll return empty for now since order-supplier relationship isn't modeled
    return [];
  }

  async updateOrderStatus(id: number, status: string, paymentStatus: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.paymentStatus = paymentStatus;
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  async approveProduct(id: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      product.isApproved = true;
      this.products.set(id, product);
      return product;
    }
    return undefined;
  }

  async rejectProduct(id: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      product.isApproved = false;
      this.products.set(id, product);
      return product;
    }
    return undefined;
  }

  // Password reset token methods
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const newToken: PasswordResetToken = {
      ...tokenData,
      id: this.passwordResetTokenIdCounter++,
      createdAt: new Date(),
      usedAt: null,
    };
    this.passwordResetTokens.set(newToken.token, newToken);
    return newToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return this.passwordResetTokens.get(token);
  }

  async markTokenAsUsed(token: string): Promise<boolean> {
    const resetToken = this.passwordResetTokens.get(token);
    if (resetToken) {
      resetToken.usedAt = new Date();
      this.passwordResetTokens.set(token, resetToken);
      return true;
    }
    return false;
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    for (const [token, resetToken] of this.passwordResetTokens.entries()) {
      if (resetToken.expiresAt < now) {
        this.passwordResetTokens.delete(token);
      }
    }
  }

  async updateCustomerPassword(id: number, newPassword: string): Promise<boolean> {
    const customer = this.customers.get(id);
    if (customer) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      customer.password = hashedPassword;
      this.customers.set(id, customer);
      return true;
    }
    return false;
  }

  async updateSupplierPassword(id: number, newPassword: string): Promise<boolean> {
    const supplier = this.suppliers.get(id);
    if (supplier) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      supplier.password = hashedPassword;
      this.suppliers.set(id, supplier);
      return true;
    }
    return false;
  }

  async updateAdminPassword(newPassword: string): Promise<boolean> {
    // For MemStorage, we'll store admin password in an environment variable or similar
    // In a real implementation, this would update the admin record in database
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  // Customer methods
  async getCustomerById(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const hashedPassword = await bcrypt.hash(customerData.password, 10);

    const [customer] = await db
      .insert(customers)
      .values({
        ...customerData,
        password: hashedPassword,
      })
      .returning();
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const updateData: any = { ...customerData };

    if (customerData.password) {
      updateData.password = await bcrypt.hash(customerData.password, 10);
    }

    updateData.updatedAt = new Date();

    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async validateCustomerPassword(email: string, password: string): Promise<Customer | null> {
    const customer = await this.getCustomerByEmail(email);
    if (!customer) {
      return null;
    }

    const isValid = await bcrypt.compare(password, customer.password);
    return isValid ? customer : null;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, insertCategory: InsertCategory): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(insertCategory)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Supplier methods
  async getSupplierById(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getSupplierByEmail(email: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.email, email));
    return supplier || undefined;
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const hashedPassword = await bcrypt.hash(supplierData.password, 10);

    const [supplier] = await db
      .insert(suppliers)
      .values({
        ...supplierData,
        password: hashedPassword,
        isApproved: true, // Auto-approve for testing
        isActive: true,
      })
      .returning();
    return supplier;
  }

  async updateSupplier(id: number, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const updateData: any = { ...supplierData };

    if (supplierData.password) {
      updateData.password = await bcrypt.hash(supplierData.password, 10);
    }

    updateData.updatedAt = new Date();

    const [supplier] = await db
      .update(suppliers)
      .set(updateData)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier || undefined;
  }

  async validateSupplierPassword(email: string, password: string): Promise<Supplier | null> {
    const supplier = await this.getSupplierByEmail(email);
    if (!supplier) {
      return null;
    }

    const isValid = await bcrypt.compare(password, supplier.password);
    return isValid ? supplier : null;
  }

  async getSuppliers(filters?: { isApproved?: boolean; isActive?: boolean }): Promise<Supplier[]> {
    const conditions = [];

    if (filters?.isApproved !== undefined) {
      conditions.push(eq(suppliers.isApproved, filters.isApproved));
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(suppliers.isActive, filters.isActive));
    }

    if (conditions.length === 0) {
      return await db.select().from(suppliers);
    }

    return await db.select().from(suppliers).where(and(...conditions));
  }

  async approveSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .update(suppliers)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier || undefined;
  }

  async getProducts(filters?: {
    categoryId?: number;
    supplierId?: number;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    isOnSale?: boolean;
    isFeatured?: boolean;
    isApproved?: boolean;
  }): Promise<ProductWithCategory[]> {
    const result = await db
      .select({
        product: products,
        category: categories,
        supplier: suppliers
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id));

    // Apply filters in memory for simplicity
    let filteredResults = result;

    if (filters) {
      filteredResults = result.filter(row => {
        const product = row.product;

        if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
        if (filters.supplierId && product.supplierId !== filters.supplierId) return false;
        if (filters.brand && product.brand !== filters.brand) return false;
        if (filters.minPrice && parseFloat(product.price) < filters.minPrice) return false;
        if (filters.maxPrice && parseFloat(product.price) > filters.maxPrice) return false;
        if (filters.minRating && parseFloat(product.rating || "0") < filters.minRating) return false;
        if (filters.search) {
          const normalize = (str: string) => str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
          const normalizedName = normalize(product.name);
          const normalizedDescription = normalize(product.description || '');
          const normalizedBrand = normalize(product.brand || '');
          const normalizedSearch = normalize(filters.search);

          if (!normalizedName.includes(normalizedSearch) &&
              !normalizedDescription.includes(normalizedSearch) &&
              !normalizedBrand.includes(normalizedSearch)) {
            return false;
          }
        }
        if (filters.isOnSale !== undefined && product.isOnSale !== filters.isOnSale) return false;
        if (filters.isFeatured !== undefined && product.isFeatured !== filters.isFeatured) return false;
        if (filters.isApproved !== undefined && product.isApproved !== filters.isApproved) return false;

        return true;
      });
    }

    return filteredResults.map(row => ({
      ...row.product,
      category: row.category || undefined,
      supplier: row.supplier || undefined
    }));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        isApproved: true, // Auto-approve products for testing
      })
      .returning();
    return product;
  }

  async updateProduct(id: number, insertProduct: InsertProduct): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async approveProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ isApproved: true })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const result = await db
      .select({
        cartItem: cartItems,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return result.map(row => ({
      ...row.cartItem,
      product: row.product
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.sessionId, item.sessionId),
        eq(cartItems.productId, item.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return (result.rowCount || 0) > 0;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersBySupplier(supplierId: number): Promise<Order[]> {
    // Get orders that contain products from this supplier
    const result = await db
      .select({
        order: orders,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(products.supplierId, supplierId))
      .orderBy(desc(orders.createdAt));

    // Remove duplicates and return unique orders
    const uniqueOrders = Array.from(
      new Map(result.map(row => [row.order.id, row.order])).values()
    );

    return uniqueOrders;
  }

  async updateOrderStatus(id: number, status: string, paymentStatus: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, paymentStatus })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async approveProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ isApproved: true })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async rejectProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ isApproved: false })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }
}

export const storage = new DatabaseStorage();
