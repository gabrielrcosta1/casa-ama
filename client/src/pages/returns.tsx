import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RefreshCw, 
  Package,
  Calendar, 
  CheckCircle,
  Clock,
  Truck,
  CreditCard,
  AlertCircle,
  Info,
  FileText,
  Shield,
  Phone,
  Mail,
  ArrowLeft,
  Download
} from "lucide-react";

interface ReturnStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "pending";
}

interface ReturnPolicy {
  id: string;
  title: string;
  description: string;
  timeLimit: string;
  conditions: string[];
  icon: React.ReactNode;
}

const returnSteps: ReturnStep[] = [
  {
    id: 1,
    title: "Solicitar Devolução",
    description: "Acesse sua conta e solicite a devolução do produto",
    icon: <FileText className="w-5 h-5" />,
    status: "completed"
  },
  {
    id: 2,
    title: "Aguardar Aprovação",
    description: "Nossa equipe analisará sua solicitação em até 24h",
    icon: <Clock className="w-5 h-5" />,
    status: "current"
  },
  {
    id: 3,
    title: "Embalagem e Coleta",
    description: "Embale o produto e aguarde a coleta gratuita",
    icon: <Package className="w-5 h-5" />,
    status: "pending"
  },
  {
    id: 4,
    title: "Análise do Produto",
    description: "Verificaremos as condições do produto recebido",
    icon: <CheckCircle className="w-5 h-5" />,
    status: "pending"
  },
  {
    id: 5,
    title: "Reembolso",
    description: "Processamento do reembolso em até 10 dias úteis",
    icon: <CreditCard className="w-5 h-5" />,
    status: "pending"
  }
];

const returnPolicies: ReturnPolicy[] = [
  {
    id: "arrependimento",
    title: "Direito de Arrependimento",
    description: "Produtos comprados online podem ser devolvidos sem justificativa",
    timeLimit: "7 dias",
    conditions: [
      "Produto deve estar em perfeitas condições",
      "Embalagem original preservada",
      "Etiquetas e lacres intactos",
      "Nota fiscal incluída"
    ],
    icon: <RefreshCw className="w-6 h-6 text-blue-600" />
  },
  {
    id: "defeito",
    title: "Produto com Defeito",
    description: "Produtos com defeito de fabricação ou divergência na descrição",
    timeLimit: "90 dias",
    conditions: [
      "Defeito comprovado por laudo técnico",
      "Produto não danificado por mau uso",
      "Garantia do fabricante válida",
      "Fotos do defeito anexadas"
    ],
    icon: <AlertCircle className="w-6 h-6 text-red-600" />
  },
  {
    id: "garantia",
    title: "Garantia Estendida",
    description: "Produtos cobertos pela garantia estendida da Floresta Viva",
    timeLimit: "1 ano",
    conditions: [
      "Produto adquirido com garantia estendida",
      "Uso conforme manual do fabricante",
      "Sem sinais de violação ou reparo",
      "Certificado de garantia válido"
    ],
    icon: <Shield className="w-6 h-6 text-green-600" />
  }
];

const faqReturns = [
  {
    question: "Quanto tempo tenho para solicitar uma devolução?",
    answer: "Você tem 7 dias corridos a partir do recebimento do produto para solicitar devolução por arrependimento, conforme o Código de Defesa do Consumidor. Para produtos com defeito, o prazo é de 90 dias."
  },
  {
    question: "A coleta é gratuita?",
    answer: "Sim! Para devoluções por arrependimento ou produtos com defeito, oferecemos coleta gratuita em todo o Brasil. Nossa transportadora entrará em contato para agendar a coleta."
  },
  {
    question: "Como recebo meu reembolso?",
    answer: "O reembolso é processado na mesma forma de pagamento utilizada na compra. Cartões de crédito: até 2 faturas. PIX/débito: até 10 dias úteis. Boleto: até 10 dias úteis na conta bancária informada."
  },
  {
    question: "Posso trocar por outro produto?",
    answer: "Atualmente trabalhamos apenas com devoluções e reembolso. Para adquirir outro produto, você pode fazer uma nova compra após receber o reembolso da devolução."
  },
  {
    question: "E se o produto chegou danificado?",
    answer: "Produtos que chegaram danificados devem ser reportados em até 48h do recebimento. Entre em contato conosco e não aceite a entrega se notar avarias na embalagem."
  }
];

export default function Returns() {
  const [orderNumber, setOrderNumber] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("");
  const [description, setDescription] = useState("");

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
            <span className="text-gray-700">Devoluções</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <RefreshCw className="w-4 h-4 mr-2" />
            Devoluções e Trocas
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Devoluções</span> Simples e Seguras
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Não ficou satisfeito com sua compra? Sem problemas! Nosso processo de devolução é 
            simples, rápido e totalmente gratuito.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Solicitar Devolução
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Package className="w-4 h-4 mr-2" />
              Rastrear Devolução
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Return Process Steps */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona o Processo</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Siga estes 5 passos simples para devolver seu produto e receber o reembolso.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {returnSteps.map((step, index) => (
              <Card key={step.id} className={`text-center ${
                step.status === 'current' ? 'ring-2 ring-blue-500 bg-blue-50' : 
                step.status === 'completed' ? 'bg-green-50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    step.status === 'current' ? 'bg-blue-600 text-white' :
                    step.status === 'completed' ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                  {index < returnSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <div className="w-6 h-0.5 bg-gray-300"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Return Policies */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Políticas de Devolução</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça seus direitos e as condições para cada tipo de devolução.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {returnPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {policy.icon}
                    <CardTitle className="ml-3">{policy.title}</CardTitle>
                  </div>
                  <CardDescription>{policy.description}</CardDescription>
                  <Badge variant="outline" className="w-fit">
                    Prazo: {policy.timeLimit}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-gray-900 mb-3">Condições:</h4>
                  <ul className="space-y-2">
                    {policy.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Return Request Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Solicitar Devolução Online
                </CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo para iniciar sua solicitação de devolução.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Pedido *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: FV-2025-001234"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Encontre o número do pedido no email de confirmação
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Devolução *
                  </label>
                  <Select value={returnType} onValueChange={setReturnType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motivo da devolução" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arrependimento">Arrependimento (7 dias)</SelectItem>
                      <SelectItem value="defeito">Produto com Defeito</SelectItem>
                      <SelectItem value="divergencia">Divergência na Descrição</SelectItem>
                      <SelectItem value="danificado">Produto Danificado na Entrega</SelectItem>
                      <SelectItem value="garantia">Acionamento de Garantia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo Específico *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Produto diferente do esperado"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição Detalhada
                  </label>
                  <Textarea
                    placeholder="Descreva detalhadamente o problema ou motivo da devolução..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Importante</h4>
                      <p className="text-sm text-yellow-700">
                        Para agilizar o processo, tenha em mãos fotos do produto (se aplicável) 
                        e certifique-se de que ele está em condições originais.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="flex-1">
                    Enviar Solicitação
                  </Button>
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Perguntas Frequentes sobre Devoluções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqReturns.map((faq, index) => (
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
            {/* Quick Status Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Rastrear Devolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Número do pedido ou protocolo" />
                  <Button className="w-full">
                    Consultar Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-green-600" />
                  Precisa de Ajuda?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Nossa equipe especializada está pronta para ajudar
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      (11) 3000-0000 ramal 102
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      devolucoes@florestaviva.com.br
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

            {/* Useful Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2 text-purple-600" />
                  Documentos Úteis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Política de Devoluções (PDF)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Termo de Devolução
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Código de Defesa do Consumidor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Dicas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Mantenha a embalagem original</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Não remova etiquetas e lacres</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Inclua todos os acessórios</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Guarde o protocolo de devolução</span>
                  </div>
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
                Devoluções simples e seguras. Sua satisfação é nossa prioridade.
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