import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Scale, Users, ShoppingCart, Package, AlertTriangle, Mail } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Scale className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Termos de Uso</h1>
            </div>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Condições e diretrizes para uso da plataforma Floresta Viva
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <Scale className="w-5 h-5" />
                <span>Aceitação dos Termos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar a plataforma Floresta Viva, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. 
                Estes termos se aplicam a todos os visitantes, usuários e outras pessoas que acessam ou usam o serviço.
              </p>
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-emerald-800 font-medium">
                  🌱 <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Users className="w-5 h-5" />
                <span>Contas de Usuário</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Responsabilidades do Usuário</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Fornecer informações precisas e atualizadas durante o cadastro</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Manter a confidencialidade de suas credenciais de acesso</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Notificar imediatamente sobre uso não autorizado de sua conta</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Ser responsável por todas as atividades realizadas em sua conta</span>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Tipos de Conta</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-800">Cliente</h5>
                    <p className="text-sm text-blue-700">Compra de produtos e acesso a recursos do cliente</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h5 className="font-medium text-purple-800">Fornecedor</h5>
                    <p className="text-sm text-purple-700">Venda de produtos através da plataforma</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <h5 className="font-medium text-orange-800">Administrador</h5>
                    <p className="text-sm text-orange-700">Gestão completa da plataforma</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Terms */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <ShoppingCart className="w-5 h-5" />
                <span>Termos de Compra</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Processo de Compra</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Todos os preços estão em Reais (BRL) e incluem impostos aplicáveis</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Pagamentos são processados de forma segura através do Stripe</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Confirmação de pedido será enviada por email após o pagamento</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Produtos sujeitos à disponibilidade em estoque</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Política de Cancelamento</h5>
                <p className="text-blue-700 text-sm">
                  Pedidos podem ser cancelados em até 24 horas após a confirmação, 
                  desde que não tenham sido enviados. Reembolsos são processados em até 7 dias úteis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Terms */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Package className="w-5 h-5" />
                <span>Termos para Fornecedores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Requisitos e Responsabilidades</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Fornecer informações precisas sobre produtos, incluindo descrições e imagens</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Manter estoque atualizado e disponibilidade dos produtos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Cumprir prazos de entrega acordados com os clientes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Fornecer suporte ao cliente para produtos vendidos</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Comissões e Pagamentos</h4>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <ul className="space-y-1 text-purple-800 text-sm">
                    <li>• Taxa de comissão: 5% sobre o valor de cada venda</li>
                    <li>• Pagamentos realizados semanalmente às quintas-feiras</li>
                    <li>• Período mínimo de retenção: 7 dias para garantias</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Atividades Proibidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Uso Indevido da Plataforma</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Violação de direitos autorais ou propriedade intelectual</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Publicação de conteúdo ofensivo, difamatório ou ilegal</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Tentativas de hackear ou comprometer a segurança</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Uso de bots ou sistemas automatizados não autorizados</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Práticas Comerciais</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Venda de produtos falsificados ou contrabandeados</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Manipulação de preços ou informações de produtos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Criação de avaliações falsas ou enganosas</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">×</span>
                      <span>Concorrência desleal ou práticas antiéticas</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-medium text-red-800 mb-2">Consequências de Violações</h5>
                <p className="text-red-700 text-sm">
                  Violações destes termos podem resultar em suspensão temporária ou permanente da conta, 
                  remoção de produtos e/ou ações legais conforme aplicável.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Liability and Disclaimers */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Scale className="w-5 h-5" />
                <span>Limitação de Responsabilidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Isenções de Responsabilidade</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>A plataforma é fornecida "como está" sem garantias explícitas ou implícitas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>Não garantimos disponibilidade ininterrupta ou ausência de erros</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>Usuários são responsáveis por backup de seus dados importantes</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Limitações de Danos</h4>
                <p className="text-gray-700 text-sm">
                  Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, 
                  especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou uso, 
                  mesmo que tenhamos sido avisados da possibilidade de tais danos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modifications and Contact */}
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <Mail className="w-5 h-5" />
                <span>Alterações e Contato</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Modificações dos Termos</h4>
                <p className="text-gray-700">
                  Reservamos o direito de modificar estes termos a qualquer momento. As alterações 
                  entrarão em vigor imediatamente após a publicação na plataforma. É responsabilidade 
                  do usuário revisar periodicamente estes termos.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Entre em Contato</h4>
                <p className="text-gray-700 mb-3">
                  Para dúvidas sobre estes termos de uso, entre em contato conosco:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Email:</strong> juridico@florestaviva.com.br</p>
                  <p><strong>Telefone:</strong> (11) 3000-0000</p>
                  <p><strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo, SP</p>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-emerald-800 text-sm">
                  🌿 <strong>Compromisso Ambiental:</strong> Ao usar nossa plataforma, você está contribuindo 
                  para um futuro mais sustentável através do comércio responsável e práticas ambientalmente conscientes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Top */}
          <div className="text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}