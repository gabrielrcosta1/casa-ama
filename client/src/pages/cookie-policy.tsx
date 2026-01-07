import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cookie, Shield, Settings, Eye, BarChart3, Globe, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white">
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
              <Cookie className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Política de Cookies</h1>
            </div>
            <p className="text-amber-100 text-lg max-w-2xl mx-auto">
              Como utilizamos cookies para melhorar sua experiência na Floresta Viva
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center space-x-2 text-amber-800">
                <Cookie className="w-5 h-5" />
                <span>O que são Cookies?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies são pequenos arquivos de texto que são armazenados em seu dispositivo quando você visita nosso site. 
                Eles nos ajudam a fornecer uma experiência personalizada e melhorar nossos serviços.
              </p>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 font-medium">
                  🍪 <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
                </p>
                <p className="text-amber-700 text-sm mt-2">
                  Esta política explica como e por que usamos cookies em nossa plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Settings className="w-5 h-5" />
                <span>Tipos de Cookies que Utilizamos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Cookies Essenciais</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Obrigatórios</Badge>
                    </div>
                    <p className="text-green-700 text-sm">
                      Necessários para o funcionamento básico do site, incluindo autenticação, 
                      carrinho de compras e segurança.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-green-600">
                      <li>• Sessão de login do usuário</li>
                      <li>• Itens do carrinho de compras</li>
                      <li>• Preferências de segurança</li>
                      <li>• Tokens de autenticação</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Cookies Analíticos</h4>
                      <Badge variant="outline" className="border-blue-300 text-blue-800">Opcional</Badge>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Nos ajudam a entender como os visitantes interagem com nosso site 
                      para melhorar a experiência do usuário.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-blue-600">
                      <li>• Páginas mais visitadas</li>
                      <li>• Tempo de permanência</li>
                      <li>• Jornada do usuário</li>
                      <li>• Origem do tráfego</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">Cookies de Funcionalidade</h4>
                      <Badge variant="outline" className="border-purple-300 text-purple-800">Opcional</Badge>
                    </div>
                    <p className="text-purple-700 text-sm">
                      Permitem que o site lembre suas escolhas e forneça recursos aprimorados 
                      e mais personalizados.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-purple-600">
                      <li>• Idioma preferido</li>
                      <li>• Tema escuro/claro</li>
                      <li>• Localização regional</li>
                      <li>• Configurações personalizadas</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-5 h-5 text-pink-600" />
                      <h4 className="font-semibold text-pink-800">Cookies de Marketing</h4>
                      <Badge variant="outline" className="border-pink-300 text-pink-800">Opcional</Badge>
                    </div>
                    <p className="text-pink-700 text-sm">
                      Usados para rastrear visitantes em sites para exibir anúncios 
                      relevantes e envolventes.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-pink-600">
                      <li>• Publicidade direcionada</li>
                      <li>• Campanhas de retargeting</li>
                      <li>• Análise de conversão</li>
                      <li>• Personalização de ofertas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Cookies */}
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center space-x-2 text-indigo-800">
                <Globe className="w-5 h-5" />
                <span>Cookies de Terceiros</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700">
                Utilizamos serviços de terceiros confiáveis que podem definir cookies em nosso site:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Stripe</h4>
                  <p className="text-gray-600 text-sm mb-2">Processamento seguro de pagamentos</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Prevenção de fraudes</li>
                    <li>• Processamento de transações</li>
                    <li>• Conformidade PCI DSS</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">SendGrid</h4>
                  <p className="text-gray-600 text-sm mb-2">Envio de emails transacionais</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Confirmações de pedidos</li>
                    <li>• Recuperação de senha</li>
                    <li>• Notificações importantes</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Google Analytics</h4>
                  <p className="text-gray-600 text-sm mb-2">Análise de tráfego e comportamento</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Métricas de desempenho</li>
                    <li>• Análise de audiência</li>
                    <li>• Otimização de experiência</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Redes Sociais</h4>
                  <p className="text-gray-600 text-sm mb-2">Integração com plataformas sociais</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Botões de compartilhamento</li>
                    <li>• Login social</li>
                    <li>• Widgets incorporados</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <Settings className="w-5 h-5" />
                <span>Gerenciamento de Cookies</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Como Controlar Cookies</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h5 className="font-medium text-emerald-800 mb-2">Configurações do Navegador</h5>
                    <p className="text-emerald-700 text-sm">
                      Você pode configurar seu navegador para aceitar, rejeitar ou notificar sobre cookies. 
                      Cada navegador tem configurações diferentes para gerenciar cookies.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h5 className="font-medium text-emerald-800 mb-2">Opt-out de Cookies de Terceiros</h5>
                    <p className="text-emerald-700 text-sm">
                      Você pode optar por não receber cookies de terceiros visitando suas respectivas 
                      páginas de configuração de privacidade.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Instruções por Navegador</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800">Chrome</h5>
                    <p className="text-gray-600 text-sm">Configurações → Privacidade e segurança → Cookies</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800">Firefox</h5>
                    <p className="text-gray-600 text-sm">Opções → Privacidade e Segurança → Cookies</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800">Safari</h5>
                    <p className="text-gray-600 text-sm">Preferências → Privacidade → Gerenciar dados</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800">Edge</h5>
                    <p className="text-gray-600 text-sm">Configurações → Privacidade → Cookies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact of Disabling Cookies */}
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Impacto da Desativação de Cookies</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Desativar cookies pode afetar sua experiência em nosso site. Aqui estão alguns impactos possíveis:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Cookies Essenciais Desativados</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Impossibilidade de fazer login</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Carrinho de compras não funciona</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Perda de itens durante navegação</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Problemas de segurança</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Cookies Opcionais Desativados</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Experiência menos personalizada</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Necessidade de reconfigurar preferências</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Anúncios menos relevantes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Análises menos precisas</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <BarChart3 className="w-5 h-5" />
                <span>Retenção e Expiração</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Diferentes tipos de cookies têm períodos de retenção diferentes:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-blue-800">Cookies de Sessão</h5>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Temporários</Badge>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Expiram quando você fecha o navegador. Usados para carrinho de compras e autenticação temporária.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-blue-800">Cookies Persistentes</h5>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">30 dias - 2 anos</Badge>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Permanecem no dispositivo por um período específico. Usados para lembrar preferências e melhorar a experiência.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-blue-800">Cookies de Terceiros</h5>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Variável</Badge>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Controlados pelas respectivas empresas. Consulte suas políticas de privacidade para detalhes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact and Updates */}
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <Cookie className="w-5 h-5" />
                <span>Atualizações e Contato</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Alterações nesta Política</h4>
                <p className="text-gray-700">
                  Podemos atualizar esta política de cookies periodicamente para refletir mudanças em nossas práticas 
                  ou por outros motivos operacionais, legais ou regulamentares.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Entre em Contato</h4>
                <p className="text-gray-700 mb-3">
                  Se você tiver dúvidas sobre nossa política de cookies, entre em contato conosco:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Email:</strong> privacidade@florestaviva.com.br</p>
                  <p><strong>Telefone:</strong> (11) 3000-0000</p>
                  <p><strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo, SP</p>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-emerald-800 text-sm">
                  🌱 <strong>Compromisso com a Transparência:</strong> Acreditamos na transparência total sobre como 
                  coletamos e usamos suas informações para criar uma experiência de compra sustentável e personalizada.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Top */}
          <div className="text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800">
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