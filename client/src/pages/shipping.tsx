import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Package,
  MapPin, 
  Calendar,
  Clock,
  CreditCard,
  Shield,
  Info,
  Calculator,
  Search,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Home,
  Building
} from "lucide-react";

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  price: string;
  icon: React.ReactNode;
  features: string[];
  regions: string[];
  color: string;
}

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  standardTime: string;
  expressTime: string;
  freeShippingMin: number;
}

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Entrega Padrão",
    description: "Entrega confiável com rastreamento completo",
    timeframe: "3-7 dias úteis",
    price: "R$ 15,90",
    icon: <Truck className="w-6 h-6" />,
    features: [
      "Rastreamento em tempo real",
      "Seguro incluso até R$ 500",
      "Entrega de segunda a sexta",
      "Tentativas de reentrega gratuitas"
    ],
    regions: ["Todo o Brasil"],
    color: "blue"
  },
  {
    id: "express",
    name: "Entrega Expressa",
    description: "Para quando você precisa receber rapidamente",
    timeframe: "1-3 dias úteis",
    price: "R$ 29,90",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Prioridade na distribuição",
      "Rastreamento em tempo real",
      "Seguro incluso até R$ 1.000",
      "Entrega de segunda a sábado"
    ],
    regions: ["Capitais e regiões metropolitanas"],
    color: "purple"
  },
  {
    id: "same-day",
    name: "Entrega no Mesmo Dia",
    description: "Receba hoje mesmo em regiões selecionadas",
    timeframe: "4-8 horas",
    price: "R$ 49,90",
    icon: <Clock className="w-6 h-6" />,
    features: [
      "Entrega no mesmo dia",
      "Rastreamento ao vivo",
      "Seguro incluso até R$ 2.000",
      "Disponível de segunda a sábado"
    ],
    regions: ["São Paulo, Rio de Janeiro, Belo Horizonte"],
    color: "green"
  },
  {
    id: "pickup",
    name: "Retirada no Local",
    description: "Retire gratuitamente em nossos pontos",
    timeframe: "1-2 dias úteis",
    price: "Gratuito",
    icon: <Building className="w-6 h-6" />,
    features: [
      "Totalmente gratuito",
      "Disponível em 24h",
      "Múltiplos pontos de retirada",
      "Horário estendido"
    ],
    regions: ["Principais cidades"],
    color: "orange"
  }
];

const shippingZones: ShippingZone[] = [
  {
    id: "zone1",
    name: "Zona 1 - Região Sudeste",
    regions: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Espírito Santo"],
    standardTime: "2-4 dias úteis",
    expressTime: "1-2 dias úteis",
    freeShippingMin: 200
  },
  {
    id: "zone2",
    name: "Zona 2 - Sul e Centro-Oeste",
    regions: ["Rio Grande do Sul", "Santa Catarina", "Paraná", "Mato Grosso do Sul", "Mato Grosso", "Goiás", "Distrito Federal"],
    standardTime: "3-5 dias úteis",
    expressTime: "2-3 dias úteis",
    freeShippingMin: 250
  },
  {
    id: "zone3",
    name: "Zona 3 - Nordeste",
    regions: ["Bahia", "Pernambuco", "Ceará", "Paraíba", "Rio Grande do Norte", "Alagoas", "Sergipe", "Maranhão", "Piauí"],
    standardTime: "4-6 dias úteis",
    expressTime: "3-4 dias úteis",
    freeShippingMin: 300
  },
  {
    id: "zone4",
    name: "Zona 4 - Norte",
    regions: ["Amazonas", "Pará", "Acre", "Rondônia", "Roraima", "Amapá", "Tocantins"],
    standardTime: "5-8 dias úteis",
    expressTime: "4-6 dias úteis",
    freeShippingMin: 350
  }
];

const faqShipping = [
  {
    question: "Como funciona o frete grátis?",
    answer: "Oferecemos frete grátis para pedidos que atingem o valor mínimo da sua região. Os valores variam conforme a zona de entrega: Sudeste (R$ 200), Sul/Centro-Oeste (R$ 250), Nordeste (R$ 300) e Norte (R$ 350). O desconto é aplicado automaticamente no checkout."
  },
  {
    question: "Posso alterar o endereço após finalizar o pedido?",
    answer: "Sim, é possível alterar o endereço de entrega enquanto o pedido não foi enviado. Entre em contato conosco o mais rápido possível através do chat ou telefone. Após o envio, não será possível alterar o endereço."
  },
  {
    question: "O que acontece se eu não estiver em casa?",
    answer: "Nossa transportadora fará até 3 tentativas de entrega em dias úteis. Se não conseguir entregar, o produto ficará disponível para retirada na agência por até 7 dias. Após esse período, o produto retorna para nosso centro de distribuição."
  },
  {
    question: "Vocês entregam em apartamentos?",
    answer: "Sim, entregamos em apartamentos. É importante informar o número do apartamento, bloco e ponto de referência. Em condomínios com portaria, a entrega pode ser feita na portaria mediante autorização do morador."
  },
  {
    question: "Como posso rastrear minha entrega?",
    answer: "Após o envio, você receberá um código de rastreamento por email e SMS. Você pode acompanhar sua entrega em tempo real através do nosso site, aplicativo ou diretamente no site da transportadora."
  }
];

export default function Shipping() {
  const [cepQuery, setCepQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const calculateShipping = () => {
    if (cepQuery.length >= 8) {
      // Simulated CEP calculation - in real app would call API
      setSelectedZone("zone1");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
              <Link href="/help" className="text-gray-600 hover:text-gray-900">
                Central de Ajuda
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contato
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">
              Início
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/help" className="text-blue-600 hover:underline">
              Central de Ajuda
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Informações de Envio</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <Truck className="w-4 h-4 mr-2" />
            Informações de Envio
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Entrega</span> Rápida e Segura
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Enviamos seus produtos com segurança para todo o Brasil. Conheça nossas opções de entrega 
            e calcule o frete para sua região.
          </p>
          
          {/* CEP Calculator */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calcular Frete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Digite seu CEP"
                  value={cepQuery}
                  onChange={(e) => setCepQuery(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1"
                />
                <Button onClick={calculateShipping}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Informe seu CEP para ver opções e prazos de entrega
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Opções de Entrega</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha a opção que melhor atende às suas necessidades. Todas incluem rastreamento e seguro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingOptions.map((option) => (
              <Card key={option.id} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className={`flex items-center mb-4 text-${option.color}-600`}>
                    {option.icon}
                    <CardTitle className="ml-3 text-lg">{option.name}</CardTitle>
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-sm">
                      {option.timeframe}
                    </Badge>
                    <span className="text-lg font-bold text-gray-900">
                      {option.price}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Inclui:</h4>
                      <ul className="space-y-1">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-1 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Disponível em:</h4>
                      <p className="text-sm text-gray-600">
                        {option.regions.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Zonas de Entrega
                </CardTitle>
                <CardDescription>
                  Prazos e condições variam conforme sua região
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shippingZones.map((zone) => (
                    <div key={zone.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                        <Badge variant="outline">
                          Frete grátis a partir de R$ {zone.freeShippingMin}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Estados:</strong> {zone.regions.join(", ")}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Entrega Padrão:</span>
                          <br />
                          <span className="text-gray-600">{zone.standardTime}</span>
                        </div>
                        <div>
                          <span className="font-medium">Entrega Expressa:</span>
                          <br />
                          <span className="text-gray-600">{zone.expressTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-orange-600" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Seguro Incluso</h4>
                        <p className="text-sm text-blue-800">
                          Todos os nossos envios incluem seguro contra avarias e extravios, 
                          com valores que variam conforme o tipo de entrega escolhida.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Package className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Embalagem Sustentável</h4>
                        <p className="text-sm text-green-800">
                          Utilizamos materiais 100% recicláveis e biodegradáveis em nossas embalagens, 
                          contribuindo para um planeta mais verde.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Restrições de Entrega</h4>
                        <p className="text-sm text-yellow-800">
                          Alguns produtos podem ter restrições de envio para determinadas regiões. 
                          Verifique a disponibilidade durante o checkout.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Dias Úteis</h4>
                        <p className="text-sm text-gray-700">
                          Os prazos consideram apenas dias úteis (segunda a sexta-feira). 
                          Feriados nacionais podem afetar os prazos de entrega.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes sobre Envio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqShipping.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Track Package */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  Rastrear Encomenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Código de rastreamento" />
                  <Button className="w-full">
                    Rastrear Pedido
                  </Button>
                  <p className="text-xs text-gray-500">
                    Digite o código recebido por email ou SMS
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2 text-green-600" />
                  Dúvidas sobre Entrega?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Nossa equipe de logística está pronta para ajudar
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center text-sm">
                      <Truck className="w-4 h-4 mr-2 text-gray-500" />
                      (11) 3000-0000 ramal 301
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <Package className="w-4 h-4 mr-2 text-gray-500" />
                      entregas@florestaviva.com.br
                    </div>
                    <div className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Seg-Sex: 8h às 18h | Sáb: 9h às 14h
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/contact">
                      Chat Online
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Dicas para Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Mantenha-se disponível no horário informado</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Tenha um documento com foto em mãos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Confira o produto antes de assinar</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Guarde a nota fiscal e embalagem</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-orange-600" />
                  Pontos de Retirada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Retire gratuitamente em nossos pontos parceiros
                </p>
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Encontrar Pontos
                </Button>
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
                Entregamos sustentabilidade e qualidade em todo o Brasil com rapidez e segurança.
              </p>
              <p className="text-gray-400 text-sm">
                © 2025 Floresta Viva. Todos os direitos reservados.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <div className="space-y-2">
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
                <Link href="/shipping" className="block text-gray-400 hover:text-white transition-colors">
                  Informações de Envio
                </Link>
                <Link href="/returns" className="block text-gray-400 hover:text-white transition-colors">
                  Devoluções
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
                <Link href="/careers" className="block text-gray-400 hover:text-white transition-colors">
                  Carreiras
                </Link>
                <Link href="/press" className="block text-gray-400 hover:text-white transition-colors">
                  Imprensa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}