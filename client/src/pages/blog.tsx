import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  User, 
  Clock, 
  Search,
  Tag,
  ArrowRight,
  Leaf,
  TrendingUp,
  Lightbulb,
  Heart,
  BookOpen,
  MessageCircle,
  Share2
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  imageUrl: string;
  featured?: boolean;
  views: number;
  comments: number;
}

interface BlogCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "5 Dicas para Tornar Sua Casa Mais Sustentável em 2025",
    excerpt: "Descubra como pequenas mudanças no seu dia a dia podem fazer uma grande diferença para o meio ambiente e ainda economizar dinheiro.",
    content: "Conteúdo completo do artigo...",
    author: "Maria Silva",
    authorImage: "/authors/maria-silva.jpg",
    publishDate: "2025-01-20",
    readTime: "8 min",
    category: "Sustentabilidade",
    tags: ["dicas", "casa", "sustentabilidade", "economia"],
    imageUrl: "/blog/casa-sustentavel.jpg",
    featured: true,
    views: 2450,
    comments: 18
  },
  {
    id: "2",
    title: "O Futuro do E-commerce: Tendências para 2025",
    excerpt: "Análise das principais tendências que vão moldar o comércio eletrônico brasileiro nos próximos anos, com foco em sustentabilidade.",
    content: "Conteúdo completo do artigo...",
    author: "João Santos",
    authorImage: "/authors/joao-santos.jpg",
    publishDate: "2025-01-18",
    readTime: "12 min",
    category: "E-commerce",
    tags: ["tendências", "tecnologia", "mercado", "inovação"],
    imageUrl: "/blog/futuro-ecommerce.jpg",
    featured: true,
    views: 1890,
    comments: 24
  },
  {
    id: "3",
    title: "Como Escolher Fornecedores Sustentáveis para Seu Negócio",
    excerpt: "Guia completo para empresários que querem implementar práticas sustentáveis na cadeia de suprimentos.",
    content: "Conteúdo completo do artigo...",
    author: "Ana Costa",
    authorImage: "/authors/ana-costa.jpg",
    publishDate: "2025-01-15",
    readTime: "10 min",
    category: "Negócios",
    tags: ["fornecedores", "sustentabilidade", "negócios", "cadeia"],
    imageUrl: "/blog/fornecedores-sustentaveis.jpg",
    views: 1340,
    comments: 12
  },
  {
    id: "4",
    title: "Tecnologia Verde: Inovações que Estão Mudando o Mundo",
    excerpt: "Conheça as principais inovações tecnológicas que estão revolucionando a forma como lidamos com questões ambientais.",
    content: "Conteúdo completo do artigo...",
    author: "Pedro Oliveira",
    authorImage: "/authors/pedro-oliveira.jpg",
    publishDate: "2025-01-12",
    readTime: "15 min",
    category: "Tecnologia",
    tags: ["tecnologia", "inovação", "verde", "sustentabilidade"],
    imageUrl: "/blog/tecnologia-verde.jpg",
    views: 980,
    comments: 8
  },
  {
    id: "5",
    title: "Economia Circular: O Que Sua Empresa Precisa Saber",
    excerpt: "Entenda os conceitos fundamentais da economia circular e como implementá-la em seu modelo de negócio.",
    content: "Conteúdo completo do artigo...",
    author: "Carla Ferreira",
    authorImage: "/authors/carla-ferreira.jpg",
    publishDate: "2025-01-10",
    readTime: "7 min",
    category: "Sustentabilidade",
    tags: ["economia circular", "sustentabilidade", "negócios"],
    imageUrl: "/blog/economia-circular.jpg",
    views: 1560,
    comments: 15
  },
  {
    id: "6",
    title: "Logística Sustentável: Entrega Verde é o Futuro",
    excerpt: "Como a Floresta Viva está revolucionando a logística com práticas sustentáveis e tecnologia limpa.",
    content: "Conteúdo completo do artigo...",
    author: "Roberto Lima",
    authorImage: "/authors/roberto-lima.jpg",
    publishDate: "2025-01-08",
    readTime: "9 min",
    category: "Logística",
    tags: ["logística", "entrega", "sustentabilidade", "tecnologia"],
    imageUrl: "/blog/logistica-sustentavel.jpg",
    views: 1120,
    comments: 9
  }
];

const categories: BlogCategory[] = [
  {
    id: "sustentabilidade",
    name: "Sustentabilidade",
    description: "Dicas e insights sobre práticas sustentáveis",
    icon: <Leaf className="w-6 h-6 text-green-600" />,
    count: 15
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Tendências e estratégias do comércio digital",
    icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
    count: 12
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    description: "Inovações e soluções tecnológicas",
    icon: <Lightbulb className="w-6 h-6 text-yellow-600" />,
    count: 8
  },
  {
    id: "negocios",
    name: "Negócios",
    description: "Estratégias e insights empresariais",
    icon: <Heart className="w-6 h-6 text-purple-600" />,
    count: 10
  }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category.toLowerCase() === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              Floresta Viva
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Início
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                Sobre Nós
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contato
              </Link>
              <Link href="/careers" className="text-gray-600 hover:text-gray-900">
                Carreiras
              </Link>
              <Link href="/press" className="text-gray-600 hover:text-gray-900">
                Imprensa
              </Link>
              <Link href="/blog" className="text-primary font-medium">
                Blog
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Blog Floresta Viva
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Conteúdo sobre <span className="text-green-600">Sustentabilidade</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Explore artigos, dicas e insights sobre sustentabilidade, tecnologia verde, 
            e-commerce responsável e inovações que estão transformando nosso mundo.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-full border-gray-300"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorias</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Navegue pelos nossos conteúdos organizados por temas de interesse.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <Badge variant="secondary">{category.count} artigos</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Filter Controls */}
          <div className="flex justify-center mt-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Todos os Posts
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {selectedCategory === "all" && searchQuery === "" && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Artigos em Destaque</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="aspect-video bg-gradient-to-r from-green-400 to-blue-500"></div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{post.category}</Badge>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Destaque
                          </Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {post.author}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(post.publishDate).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                        <Button className="w-full">
                          Ler Artigo
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedCategory === "all" ? "Todos os Artigos" : `Artigos de ${categories.find(c => c.id === selectedCategory)?.name}`}
                {searchQuery && ` - Resultados para "${searchQuery}"`}
              </h2>
              
              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum artigo encontrado</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? `Nenhum artigo corresponde à sua busca por "${searchQuery}"`
                        : "Nenhum artigo encontrado nesta categoria"
                      }
                    </p>
                    <Button onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}>
                      Ver Todos os Artigos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <div className="aspect-video md:aspect-square bg-gradient-to-r from-green-400 to-blue-500"></div>
                        </div>
                        <div className="md:w-2/3">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <Badge>{post.category}</Badge>
                              <div className="flex space-x-2">
                                {post.featured && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                    Destaque
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardTitle className="text-xl">{post.title}</CardTitle>
                            <CardDescription>{post.excerpt}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {post.author}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(post.publishDate).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {post.readTime}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{post.views} visualizações</span>
                                <div className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  {post.comments}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm">
                                  Ler Mais
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-4">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Artigos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="border-b pb-3 last:border-b-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.publishDate).toLocaleDateString('pt-BR')}
                      </div>
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(blogPosts.flatMap(post => post.tags))).slice(0, 10).map((tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>
                  Receba nossos artigos diretamente no seu email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input type="email" placeholder="Seu email" />
                  <Button className="w-full">
                    Inscrever-se
                  </Button>
                  <p className="text-xs text-gray-500">
                    Enviamos apenas conteúdo de qualidade, sem spam.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-2xl font-bold mb-4 block">
                Floresta Viva
              </Link>
              <p className="text-gray-400 mb-4 max-w-md">
                Compartilhando conhecimento sobre sustentabilidade e inovação para um futuro melhor.
              </p>
              <p className="text-gray-400 text-sm">
                © 2025 Floresta Viva. Todos os direitos reservados.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Links Rápidos</h3>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                  Início
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
                <Link href="/careers" className="block text-gray-400 hover:text-white transition-colors">
                  Carreiras
                </Link>
                <Link href="/press" className="block text-gray-400 hover:text-white transition-colors">
                  Imprensa
                </Link>
                <Link href="/blog" className="block text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Fornecedores</h3>
              <div className="space-y-2">
                <Link href="/supplier/login" className="block text-gray-400 hover:text-white transition-colors">
                  Portal do Fornecedor
                </Link>
                <Link href="/supplier/register" className="block text-gray-400 hover:text-white transition-colors">
                  Cadastro de Fornecedor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}