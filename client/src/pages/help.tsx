import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Shield,
  User,
  Settings,
  Star,
  FileText,
  AlertCircle
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  views: number;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const helpCategories: HelpCategory[] = [
  {
    id: "pedidos",
    name: "Pedidos",
    description: "Como fazer pedidos, acompanhar status e cancelar",
    icon: <ShoppingCart className="w-6 h-6" />,
    count: 12,
    color: "blue"
  },
  {
    id: "entrega",
    name: "Entrega",
    description: "Prazos, rastreamento e informações de envio",
    icon: <Truck className="w-6 h-6" />,
    count: 8,
    color: "green"
  },
  {
    id: "pagamento",
    name: "Pagamento",
    description: "Métodos de pagamento, faturas e reembolsos",
    icon: <CreditCard className="w-6 h-6" />,
    count: 10,
    color: "purple"
  },
  {
    id: "produtos",
    name: "Produtos",
    description: "Informações sobre produtos e estoque",
    icon: <Package className="w-6 h-6" />,
    count: 15,
    color: "orange"
  },
  {
    id: "devolucoes",
    name: "Devoluções",
    description: "Como devolver ou trocar produtos",
    icon: <RefreshCw className="w-6 h-6" />,
    count: 6,
    color: "red"
  },
  {
    id: "conta",
    name: "Minha Conta",
    description: "Cadastro, login e configurações de perfil",
    icon: <User className="w-6 h-6" />,
    count: 9,
    color: "indigo"
  },
  {
    id: "seguranca",
    name: "Segurança",
    description: "Proteção de dados e transações seguras",
    icon: <Shield className="w-6 h-6" />,
    count: 7,
    color: "gray"
  },
  {
    id: "fornecedores",
    name: "Fornecedores",
    description: "Portal de fornecedores e parcerias",
    icon: <Settings className="w-6 h-6" />,
    count: 11,
    color: "teal"
  }
];

const faqs: FAQ[] = [
  {
    id: "1",
    question: "Como posso rastrear meu pedido?",
    answer: "Você pode rastrear seu pedido de várias formas: 1) Através do email de confirmação enviado após a compra, que contém o código de rastreamento; 2) Fazendo login na sua conta e acessando 'Meus Pedidos'; 3) Usando nossa ferramenta de rastreamento na página inicial inserindo o número do pedido. O rastreamento é atualizado em tempo real e você receberá notificações por email sobre mudanças no status.",
    category: "pedidos",
    tags: ["rastreamento", "pedido", "status"],
    helpful: 156,
    views: 2340
  },
  {
    id: "2",
    question: "Qual é o prazo de entrega?",
    answer: "Os prazos de entrega variam conforme sua localização e o tipo de produto: • Capital e região metropolitana: 1-3 dias úteis • Interior: 3-7 dias úteis • Produtos de fornecedores externos: 5-10 dias úteis • Frete grátis: disponível para pedidos acima de R$ 200. Você pode consultar o prazo exato no checkout antes de finalizar a compra.",
    category: "entrega",
    tags: ["prazo", "entrega", "frete"],
    helpful: 189,
    views: 3210
  },
  {
    id: "3",
    question: "Como cancelar um pedido?",
    answer: "Para cancelar um pedido: 1) Acesse 'Meus Pedidos' na sua conta; 2) Localize o pedido que deseja cancelar; 3) Clique em 'Cancelar Pedido' (disponível apenas se o pedido ainda não foi enviado); 4) Confirme o cancelamento. Se o pedido já foi enviado, você pode rejeitá-lo na entrega ou iniciar um processo de devolução.",
    category: "pedidos",
    tags: ["cancelar", "pedido", "reembolso"],
    helpful: 98,
    views: 1560
  },
  {
    id: "4",
    question: "Posso pagar com PIX?",
    answer: "Sim! Aceitamos PIX como forma de pagamento. É rápido, seguro e seu pedido é processado imediatamente após a confirmação do pagamento. Também aceitamos cartão de crédito (até 12x sem juros), cartão de débito, boleto bancário e transferência bancária.",
    category: "pagamento",
    tags: ["pix", "pagamento", "métodos"],
    helpful: 245,
    views: 4100
  },
  {
    id: "5",
    question: "Como faço para devolver um produto?",
    answer: "Você tem até 7 dias para devolver produtos conforme o Código de Defesa do Consumidor: 1) Acesse 'Meus Pedidos' e clique em 'Solicitar Devolução'; 2) Informe o motivo da devolução; 3) Embale o produto nas condições originais; 4) Aguarde nosso contato para agendamento da coleta (sem custo). O reembolso é processado em até 10 dias úteis.",
    category: "devolucoes",
    tags: ["devolução", "troca", "reembolso"],
    helpful: 134,
    views: 2890
  },
  {
    id: "6",
    question: "Como me cadastrar como fornecedor?",
    answer: "Para se tornar um fornecedor da Floresta Viva: 1) Acesse a página 'Portal do Fornecedor'; 2) Clique em 'Cadastrar Empresa'; 3) Preencha os dados da sua empresa e documentos; 4) Nossa equipe analisará seu cadastro em até 5 dias úteis; 5) Após aprovação, você receberá acesso ao painel de vendas. Priorizamos fornecedores com práticas sustentáveis.",
    category: "fornecedores",
    tags: ["fornecedor", "cadastro", "parceria"],
    helpful: 87,
    views: 1230
  }
];

const quickActions = [
  {
    title: "Rastrear Pedido",
    description: "Acompanhe seu pedido em tempo real",
    icon: <Package className="w-8 h-8 text-blue-600" />,
    action: "track"
  },
  {
    title: "Falar com Atendimento",
    description: "Chat ao vivo ou telefone",
    icon: <MessageCircle className="w-8 h-8 text-green-600" />,
    action: "contact"
  },
  {
    title: "Solicitar Devolução",
    description: "Inicie um processo de troca ou devolução",
    icon: <RefreshCw className="w-8 h-8 text-orange-600" />,
    action: "return"
  },
  {
    title: "Meus Pedidos",
    description: "Visualize histórico e status",
    icon: <FileText className="w-8 h-8 text-purple-600" />,
    action: "orders"
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
              <Link href="/help" className="text-primary font-medium">
                Ajuda
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
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4 mr-2" />
            Central de Ajuda
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Como podemos <span className="text-blue-600">ajudar</span>?
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Encontre respostas rápidas para suas dúvidas ou entre em contato com nossa equipe especializada.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Digite sua dúvida ou busque por palavras-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 w-full rounded-full border-gray-300 text-lg"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorias de Ajuda</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Navegue pelas categorias para encontrar respostas específicas para suas necessidades.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category) => (
              <Card 
                key={category.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className={`flex items-center mb-4 text-${category.color}-600`}>
                    {category.icon}
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <Badge variant="secondary">{category.count} artigos</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - FAQ */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "all" ? "Perguntas Frequentes" : `${helpCategories.find(c => c.id === selectedCategory)?.name || "Categoria"}`}
                {searchQuery && ` - Resultados para "${searchQuery}"`}
              </h2>
              
              {selectedCategory !== "all" && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory("all")}
                >
                  Ver Todas
                </Button>
              )}
            </div>

            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma resposta encontrada</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? `Não encontramos resultados para "${searchQuery}"`
                      : "Nenhuma pergunta encontrada nesta categoria"
                    }
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}>
                      Ver Todas as Perguntas
                    </Button>
                    <p className="text-sm text-gray-500">ou</p>
                    <Link href="/contact">
                      <Button variant="outline">
                        Falar com Atendimento
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <Card key={faq.id}>
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge variant="outline" className="mr-2">
                              {helpCategories.find(c => c.id === faq.category)?.name}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {faq.views} visualizações
                            </span>
                          </div>
                          <CardTitle className="text-lg text-left">
                            {faq.question}
                          </CardTitle>
                        </div>
                        <div className="ml-4">
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedFAQ === faq.id && (
                      <CardContent>
                        <div className="border-t pt-4">
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {faq.answer}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">Esta resposta foi útil?</span>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  👍 Sim ({faq.helpful})
                                </Button>
                                <Button variant="ghost" size="sm">
                                  👎 Não
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Falar com Atendimento
                </CardTitle>
                <CardDescription>
                  Não encontrou sua resposta? Nossa equipe está pronta para ajudar!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/contact">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Online
                    </Link>
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center mb-2">
                      <Phone className="w-4 h-4 mr-1" />
                      (11) 3000-0000
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <Mail className="w-4 h-4 mr-1" />
                      ajuda@florestaviva.com.br
                    </div>
                    <div className="flex items-center justify-center text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Seg-Sex: 8h às 18h | Sáb: 9h às 14h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Artigos Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {faqs.slice(0, 5).map((faq) => (
                    <div 
                      key={faq.id} 
                      className="border-b pb-2 last:border-b-0 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSelectedCategory(faq.category);
                        setExpandedFAQ(faq.id);
                      }}
                    >
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {faq.question}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{faq.views} visualizações</span>
                        <span>👍 {faq.helpful}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/login" className="block text-sm text-blue-600 hover:underline">
                    Acessar Minha Conta
                  </Link>
                  <Link href="/returns" className="block text-sm text-blue-600 hover:underline">
                    Devoluções e Trocas
                  </Link>
                  <Link href="/shipping" className="block text-sm text-blue-600 hover:underline">
                    Informações de Envio
                  </Link>
                  <Link href="/track-order" className="block text-sm text-blue-600 hover:underline">
                    Rastrear Pedido
                  </Link>
                  <Link href="#" className="block text-sm text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                  <Link href="#" className="block text-sm text-blue-600 hover:underline">
                    Termos de Uso
                  </Link>
                  <Link href="/supplier/login" className="block text-sm text-blue-600 hover:underline">
                    Portal do Fornecedor
                  </Link>
                  <Link href="/about" className="block text-sm text-blue-600 hover:underline">
                    Sobre a Floresta Viva
                  </Link>
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
                Estamos aqui para ajudar você em cada etapa da sua jornada de compras sustentáveis.
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
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  Central de Ajuda
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