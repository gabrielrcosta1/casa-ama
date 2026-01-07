import { db } from "./db";
import { categories, products, suppliers, customers } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Hash padrão para senhas de exemplo (senha: "senha123")
    const defaultPasswordHash = await bcrypt.hash("senha123", 10);

    // 1. Inserir categorias
    console.log("📦 Inserindo categorias...");
    const categoryData = [
      {
        name: "Frutas da Amazônia",
        slug: "frutas-amazonia",
        description: "Frutas frescas e exóticas da região amazônica"
      },
      {
        name: "Castanhas e Sementes",
        slug: "castanhas-sementes",
        description: "Castanhas do Pará, castanha de caju, sementes e oleaginosas"
      },
      {
        name: "Produtos Naturais",
        slug: "produtos-naturais",
        description: "Óleos, extratos e produtos naturais da Amazônia"
      },
      {
        name: "Artesanato",
        slug: "artesanato",
        description: "Artesanato indígena e regional da Amazônia"
      },
      {
        name: "Mel e Derivados",
        slug: "mel-derivados",
        description: "Mel de abelhas nativas e produtos derivados"
      },
      {
        name: "Chás e Ervas",
        slug: "chas-ervas",
        description: "Chás medicinais e ervas da floresta amazônica"
      },
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(categoryData)
      .returning()
      .onConflictDoNothing();

    console.log(`✅ ${insertedCategories.length} categorias inseridas`);

    // Buscar IDs das categorias (incluindo as que já existiam)
    const allCategories = await db.select().from(categories);
    const categoriesMap = new Map<string, number>();
    for (const cat of allCategories) {
      categoriesMap.set(cat.slug, cat.id);
    }

    // 2. Inserir fornecedores
    console.log("🏢 Inserindo fornecedores...");
    const supplierData = [
      {
        email: "fornecedor1@amazonia.com.br",
        password: defaultPasswordHash,
        companyName: "Amazônia Nativa Produtos",
        contactName: "João Silva",
        phone: "(92) 99999-1111",
        address: "Av. Getúlio Vargas, 1234",
        city: "Manaus",
        postalCode: "69020-000",
        country: "Brasil",
        cnpj: "12.345.678/0001-90",
        website: "https://amazonianativa.com.br",
        description: "Especializada em frutas e produtos naturais da Amazônia",
        isApproved: true,
        isActive: true,
      },
      {
        email: "fornecedor2@amazonia.com.br",
        password: defaultPasswordHash,
        companyName: "Castanhas do Norte",
        contactName: "Maria Santos",
        phone: "(91) 98888-2222",
        address: "Rua das Castanhas, 567",
        city: "Belém",
        postalCode: "66020-000",
        country: "Brasil",
        cnpj: "23.456.789/0001-01",
        website: "https://castanhasdonorte.com.br",
        description: "Produtora de castanhas e oleaginosas",
        isApproved: true,
        isActive: true,
      },
      {
        email: "fornecedor3@amazonia.com.br",
        password: defaultPasswordHash,
        companyName: "Arte Indígena Amazônica",
        contactName: "Pedro Oliveira",
        phone: "(68) 97777-3333",
        address: "Av. Brasil, 890",
        city: "Rio Branco",
        postalCode: "69900-000",
        country: "Brasil",
        cnpj: "34.567.890/0001-12",
        description: "Artesanato indígena autêntico",
        isApproved: true,
        isActive: true,
      },
    ];

    await db
      .insert(suppliers)
      .values(supplierData)
      .onConflictDoNothing({ target: suppliers.email });

    // Buscar todos os suppliers (incluindo os que já existiam)
    const allSuppliers = await db.select().from(suppliers);
    const suppliersMap = new Map<string, number>();
    for (const s of allSuppliers) {
      suppliersMap.set(s.email, s.id);
    }
    const insertedSuppliers = allSuppliers.filter(s =>
      supplierData.some(sd => sd.email === s.email)
    );

    console.log(`✅ ${insertedSuppliers.length} fornecedores inseridos/verificados`);

    // 3. Inserir produtos
    console.log("🛍️ Inserindo produtos...");
    const productData = [
      // Frutas da Amazônia
      {
        name: "Açaí Premium 1kg",
        description: "Açaí puro e congelado, direto da Amazônia. Rico em antioxidantes e energia natural.",
        price: "45.90",
        originalPrice: "52.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [
          "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
          "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800"
        ],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("frutas-amazonia"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 150,
        rating: "4.8",
        reviewCount: 234,
        isOnSale: true,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Cupuaçu Orgânico 500g",
        description: "Polpa de cupuaçu congelada, 100% natural. Perfeito para sucos e sobremesas.",
        price: "28.50",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("frutas-amazonia"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 200,
        rating: "4.6",
        reviewCount: 156,
        isOnSale: false,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Graviola 1kg",
        description: "Polpa de graviola congelada, sabor única e refrescante da Amazônia.",
        price: "32.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("frutas-amazonia"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 120,
        rating: "4.7",
        reviewCount: 189,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Bacuri Premium 500g",
        description: "Polpa de bacuri congelada, fruta exótica e deliciosa da região amazônica.",
        price: "38.90",
        originalPrice: "42.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("frutas-amazonia"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 80,
        rating: "4.5",
        reviewCount: 98,
        isOnSale: true,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Taperebá (Cajá) 500g",
        description: "Polpa de taperebá congelada, sabor ácido e refrescante característico.",
        price: "26.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("frutas-amazonia"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 95,
        rating: "4.4",
        reviewCount: 67,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      // Castanhas e Sementes
      {
        name: "Castanha do Pará Premium 500g",
        description: "Castanha do Pará selecionada, rica em selênio e gorduras boas. Produto 100% natural.",
        price: "89.90",
        originalPrice: "99.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Castanhas do Norte",
        categoryId: categoriesMap.get("castanhas-sementes"),
        supplierId: suppliersMap.get("fornecedor2@amazonia.com.br"),
        inStock: true,
        stockQuantity: 300,
        rating: "4.9",
        reviewCount: 456,
        isOnSale: true,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Castanha de Caju Torrada 500g",
        description: "Castanha de caju torrada e salgada, crocante e saborosa.",
        price: "42.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Castanhas do Norte",
        categoryId: categoriesMap.get("castanhas-sementes"),
        supplierId: suppliersMap.get("fornecedor2@amazonia.com.br"),
        inStock: true,
        stockQuantity: 250,
        rating: "4.7",
        reviewCount: 312,
        isOnSale: false,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Sementes de Chia 250g",
        description: "Sementes de chia orgânicas, fonte de ômega-3 e fibras.",
        price: "18.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Castanhas do Norte",
        categoryId: categoriesMap.get("castanhas-sementes"),
        supplierId: suppliersMap.get("fornecedor2@amazonia.com.br"),
        inStock: true,
        stockQuantity: 400,
        rating: "4.6",
        reviewCount: 278,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Mix de Castanhas 500g",
        description: "Mix premium com castanha do Pará, caju, amêndoas e nozes.",
        price: "95.90",
        originalPrice: "109.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Castanhas do Norte",
        categoryId: categoriesMap.get("castanhas-sementes"),
        supplierId: suppliersMap.get("fornecedor2@amazonia.com.br"),
        inStock: true,
        stockQuantity: 180,
        rating: "4.8",
        reviewCount: 201,
        isOnSale: true,
        isFeatured: true,
        isApproved: true,
      },
      // Produtos Naturais
      {
        name: "Óleo de Açaí 250ml",
        description: "Óleo de açaí puro, extraído a frio. Rico em antioxidantes e vitamina E.",
        price: "65.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("produtos-naturais"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 120,
        rating: "4.7",
        reviewCount: 145,
        isOnSale: false,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Óleo de Copaíba 30ml",
        description: "Óleo essencial de copaíba, conhecido por suas propriedades anti-inflamatórias.",
        price: "45.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("produtos-naturais"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 90,
        rating: "4.6",
        reviewCount: 112,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Extrato de Guaraná 500ml",
        description: "Extrato natural de guaraná, fonte de energia e cafeína natural.",
        price: "38.90",
        originalPrice: "44.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("produtos-naturais"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 150,
        rating: "4.5",
        reviewCount: 89,
        isOnSale: true,
        isFeatured: false,
        isApproved: true,
      },
      // Artesanato
      {
        name: "Cesto Indígena Artesanal",
        description: "Cesto tradicional feito à mão por artesãos indígenas, usando fibras naturais.",
        price: "125.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Arte Indígena Amazônica",
        categoryId: categoriesMap.get("artesanato"),
        supplierId: suppliersMap.get("fornecedor3@amazonia.com.br"),
        inStock: true,
        stockQuantity: 45,
        rating: "4.9",
        reviewCount: 78,
        isOnSale: false,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Pulseira Indígena de Sementes",
        description: "Pulseira artesanal feita com sementes naturais da Amazônia, design único.",
        price: "35.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Arte Indígena Amazônica",
        categoryId: categoriesMap.get("artesanato"),
        supplierId: suppliersMap.get("fornecedor3@amazonia.com.br"),
        inStock: true,
        stockQuantity: 120,
        rating: "4.7",
        reviewCount: 156,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Máscara Cerimonial Indígena",
        description: "Máscara cerimonial autêntica, peça única de arte indígena amazônica.",
        price: "289.90",
        originalPrice: "329.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Arte Indígena Amazônica",
        categoryId: categoriesMap.get("artesanato"),
        supplierId: suppliersMap.get("fornecedor3@amazonia.com.br"),
        inStock: true,
        stockQuantity: 12,
        rating: "5.0",
        reviewCount: 23,
        isOnSale: true,
        isFeatured: true,
        isApproved: true,
      },
      // Mel e Derivados
      {
        name: "Mel de Abelhas Nativas 500g",
        description: "Mel puro de abelhas nativas sem ferrão, sabor único e propriedades medicinais.",
        price: "68.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("mel-derivados"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 200,
        rating: "4.8",
        reviewCount: 267,
        isOnSale: false,
        isFeatured: true,
        isApproved: true,
      },
      {
        name: "Própolis Verde 30ml",
        description: "Extrato de própolis verde da Amazônia, potente antibiótico natural.",
        price: "52.90",
        originalPrice: "59.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("mel-derivados"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 150,
        rating: "4.7",
        reviewCount: 189,
        isOnSale: true,
        isFeatured: false,
        isApproved: true,
      },
      // Chás e Ervas
      {
        name: "Chá de Guaraná 100g",
        description: "Chá de guaraná em pó, energético natural e rico em cafeína.",
        price: "28.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("chas-ervas"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 180,
        rating: "4.6",
        reviewCount: 134,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Chá de Erva-Mate 250g",
        description: "Erva-mate orgânica da Amazônia, tradicional e energizante.",
        price: "22.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("chas-ervas"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 220,
        rating: "4.5",
        reviewCount: 98,
        isOnSale: false,
        isFeatured: false,
        isApproved: true,
      },
      {
        name: "Mix de Ervas Medicinais 100g",
        description: "Mix especial de ervas medicinais da floresta: guaraná, catuaba e marapuama.",
        price: "45.90",
        originalPrice: "52.90",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4e6b4a5e?w=800",
        images: [],
        brand: "Amazônia Nativa",
        categoryId: categoriesMap.get("chas-ervas"),
        supplierId: suppliersMap.get("fornecedor1@amazonia.com.br"),
        inStock: true,
        stockQuantity: 95,
        rating: "4.7",
        reviewCount: 167,
        isOnSale: true,
        isFeatured: true,
        isApproved: true,
      },
    ];

    const insertedProducts = await db
      .insert(products)
      .values(productData)
      .returning();

    console.log(`✅ ${insertedProducts.length} produtos inseridos`);

    // 4. Inserir clientes de exemplo
    console.log("👥 Inserindo clientes de exemplo...");
    const customerData = [
      {
        email: "cliente1@example.com",
        password: defaultPasswordHash,
        firstName: "Ana",
        lastName: "Costa",
        phone: "(11) 98765-4321",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        postalCode: "01234-567",
        country: "Brasil",
      },
      {
        email: "cliente2@example.com",
        password: defaultPasswordHash,
        firstName: "Carlos",
        lastName: "Silva",
        phone: "(21) 97654-3210",
        address: "Av. Atlântica, 456",
        city: "Rio de Janeiro",
        postalCode: "22021-000",
        country: "Brasil",
      },
      {
        email: "cliente3@example.com",
        password: defaultPasswordHash,
        firstName: "Mariana",
        lastName: "Santos",
        phone: "(85) 96543-2109",
        address: "Rua Beira Mar, 789",
        city: "Fortaleza",
        postalCode: "60165-121",
        country: "Brasil",
      },
    ];

    const insertedCustomers = await db
      .insert(customers)
      .values(customerData)
      .returning()
      .onConflictDoNothing({ target: customers.email });

    console.log(`✅ ${insertedCustomers.length} clientes inseridos`);

    console.log("\n🎉 Seed do banco de dados concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`   - ${insertedCategories.length} categorias`);
    console.log(`   - ${insertedSuppliers.length} fornecedores`);
    console.log(`   - ${insertedProducts.length} produtos`);
    console.log(`   - ${insertedCustomers.length} clientes`);
    console.log("\n🔑 Credenciais de exemplo (senha: senha123):");
    console.log("   Fornecedores:");
    insertedSuppliers.forEach(s => {
      console.log(`     - ${s.email}`);
    });
    console.log("   Clientes:");
    insertedCustomers.forEach(c => {
      console.log(`     - ${c.email}`);
    });
  } catch (error) {
    console.error("❌ Erro ao fazer seed do banco de dados:", error);
    process.exit(1);
  }
}

// Executar seed quando chamado diretamente
seedDatabase().finally(() => process.exit(0));
