import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package,
  Truck, 
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  Home,
  Building2,
  ArrowRight
} from "lucide-react";

interface TrackingStep {
  id: string;
  status: string;
  description: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

interface OrderDetails {
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  shippingMethod: string;
  recipientName: string;
  recipientAddress: string;
  trackingCode: string;
  carrier: string;
  carrierUrl: string;
}

const mockOrderDetails: OrderDetails = {
  orderNumber: "FV-2025-001234",
  status: "Em trânsito",
  estimatedDelivery: "2025-01-27",
  shippingMethod: "Entrega Expressa",
  recipientName: "Maria Silva",
  recipientAddress: "Rua das Flores, 123 - Jardim Primavera, São Paulo - SP, 01234-567",
  trackingCode: "BR123456789FV",
  carrier: "Transportadora Verde",
  carrierUrl: "https://transportadoraverde.com.br/rastreamento"
};

const mockTrackingSteps: TrackingStep[] = [
  {
    id: "1",
    status: "Pedido Confirmado",
    description: "Seu pedido foi confirmado e está sendo preparado",
    location: "São Paulo - SP",
    date: "2025-01-23",
    time: "14:30",
    completed: true
  },
  {
    id: "2",
    status: "Produto Separado",
    description: "Produto foi separado e embalado para envio",
    location: "Centro de Distribuição - São Paulo",
    date: "2025-01-24",
    time: "09:15",
    completed: true
  },
  {
    id: "3",
    status: "Enviado",
    description: "Produto foi coletado pela transportadora",
    location: "São Paulo - SP",
    date: "2025-01-24",
    time: "16:45",
    completed: true
  },
  {
    id: "4",
    status: "Em Trânsito",
    description: "Produto está a caminho do destino",
    location: "Centro de Triagem - Guarulhos",
    date: "2025-01-25",
    time: "08:20",
    completed: true,
    current: true
  },
  {
    id: "5",
    status: "Saiu para Entrega",
    description: "Produto está no veículo de entrega",
    location: "Base de Entrega - São Paulo",
    date: "",
    time: "",
    completed: false
  },
  {
    id: "6",
    status: "Entregue",
    description: "Produto foi entregue ao destinatário",
    location: "São Paulo - SP",
    date: "",
    time: "",
    completed: false
  }
];

const quickTrackingTips = [
  {
    title: "Código de Rastreamento",
    description: "Use o código que recebeu por email ou SMS",
    icon: <Search className="w-5 h-5 text-blue-600" />
  },
  {
    title: "Número do Pedido",
    description: "Também aceita o número do seu pedido",
    icon: <Package className="w-5 h-5 text-green-600" />
  },
  {
    title: "Atualizações em Tempo Real",
    description: "Informações atualizadas a cada 30 minutos",
    icon: <Clock className="w-5 h-5 text-purple-600" />
  }
];

export default function TrackOrder() {
  const [trackingQuery, setTrackingQuery] = useState("");
  const [trackingResult, setTrackingResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTracking = async () => {
    if (trackingQuery.length < 5) return;
    
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setTrackingResult(true);
      setIsLoading(false);
    }, 1500);
  };

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(mockOrderDetails.trackingCode);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "entregue":
        return "bg-green-100 text-green-800";
      case "em trânsito":
        return "bg-blue-100 text-blue-800";
      case "saiu para entrega":
        return "bg-orange-100 text-orange-800";
      case "enviado":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <span className="text-gray-700">Rastrear Pedido</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <Package className="w-4 h-4 mr-2" />
            Rastreamento de Pedidos
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Acompanhe</span> seu Pedido
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Digite o código de rastreamento ou número do pedido para acompanhar sua entrega em tempo real.
          </p>
          
          {/* Tracking Search */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  type="text"
                  placeholder="Digite o código de rastreamento ou número do pedido"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleTracking()}
                />
                <Button 
                  onClick={handleTracking} 
                  disabled={trackingQuery.length < 5 || isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Ex: FV-2025-001234 ou BR123456789FV
              </p>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {quickTrackingTips.map((tip, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    {tip.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Results */}
      {trackingResult && (
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Tracking Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Package className="w-5 h-5 mr-2 text-blue-600" />
                        Detalhes do Pedido
                      </span>
                      <Badge className={getStatusColor(mockOrderDetails.status)}>
                        {mockOrderDetails.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Informações do Pedido</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Número do Pedido:</span>
                            <span className="font-medium">{mockOrderDetails.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Método de Envio:</span>
                            <span className="font-medium">{mockOrderDetails.shippingMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Previsão de Entrega:</span>
                            <span className="font-medium text-green-600">
                              {new Date(mockOrderDetails.estimatedDelivery).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Endereço de Entrega</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Destinatário:</span>
                            <div className="font-medium">{mockOrderDetails.recipientName}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Endereço:</span>
                            <div className="font-medium">{mockOrderDetails.recipientAddress}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-green-600" />
                      Histórico de Rastreamento
                    </CardTitle>
                    <CardDescription>
                      Acompanhe todas as etapas da sua entrega
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockTrackingSteps.map((step, index) => (
                        <div key={step.id} className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed 
                              ? step.current 
                                ? 'bg-blue-600 text-white animate-pulse' 
                                : 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-current"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-semibold ${
                                step.current ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                                {step.status}
                                {step.current && (
                                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                                    Atual
                                  </Badge>
                                )}
                              </h4>
                              {step.date && (
                                <div className="text-sm text-gray-500">
                                  {new Date(step.date).toLocaleDateString('pt-BR')} às {step.time}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">
                              {step.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {step.location}
                            </div>
                          </div>
                          
                          {index < mockTrackingSteps.length - 1 && (
                            <div className={`absolute left-4 top-12 w-0.5 h-6 ${
                              step.completed ? 'bg-green-300' : 'bg-gray-200'
                            }`} style={{ marginLeft: '15px' }}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tracking Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Código de Rastreamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-medium">
                            {mockOrderDetails.trackingCode}
                          </span>
                          <Button variant="ghost" size="sm" onClick={copyTrackingCode}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">
                          <strong>Transportadora:</strong> {mockOrderDetails.carrier}
                        </p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={mockOrderDetails.carrierUrl}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Rastrear na Transportadora
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estimated Delivery */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-green-600" />
                      Previsão de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {new Date(mockOrderDetails.estimatedDelivery).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Estimativa baseada no método de envio escolhido
                      </p>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-800">
                          Sua entrega está dentro do prazo esperado!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-purple-600" />
                      Precisa de Ajuda?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Dúvidas sobre sua entrega?
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          (11) 3000-0000 ramal 301
                        </div>
                        <div className="flex items-center justify-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          rastreamento@florestaviva.com.br
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

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/returns">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Solicitar Devolução
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/shipping">
                          <Truck className="w-4 h-4 mr-2" />
                          Informações de Envio
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/help">
                          <Info className="w-4 h-4 mr-2" />
                          Central de Ajuda
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Additional Info */}
      {!trackingResult && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Rastrear seu Pedido</h2>
              <p className="text-lg text-gray-600">
                Siga estes passos simples para acompanhar sua entrega
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Encontre o Código</h3>
                  <p className="text-sm text-gray-600">
                    Procure no email de confirmação ou SMS enviado após a compra
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Digite o Código</h3>
                  <p className="text-sm text-gray-600">
                    Insira o código de rastreamento no campo acima
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Acompanhe</h3>
                  <p className="text-sm text-gray-600">
                    Veja todas as etapas da sua entrega em tempo real
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-2xl font-bold mb-4 block">
                Floresta Viva
              </Link>
              <p className="text-gray-400 mb-4 max-w-md">
                Acompanhe sua entrega em tempo real e tenha total transparência sobre seu pedido.
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
                <Link href="/track-order" className="block text-gray-400 hover:text-white transition-colors">
                  Rastrear Pedido
                </Link>
                <Link href="/shipping" className="block text-gray-400 hover:text-white transition-colors">
                  Informações de Envio
                </Link>
                <Link href="/returns" className="block text-gray-400 hover:text-white transition-colors">
                  Devoluções
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
                <Link href="/careers" className="block text-gray-400 hover:text-white transition-colors">
                  Carreiras
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}