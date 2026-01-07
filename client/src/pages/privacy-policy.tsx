import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Database, Lock, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen leaf-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              🌿 Voltar ao Início
            </Button>
          </Link>
          
          <div className="amazon-gradient rounded-2xl text-primary-foreground p-8 relative overflow-hidden">
            <div className="absolute inset-0 leaf-pattern opacity-20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4 flex items-center">
                <Shield className="h-10 w-10 mr-4" />
                🔒 Política de Privacidade
              </h1>
              <p className="text-xl opacity-90">
                Floresta Viva - Proteção e transparência dos seus dados
              </p>
              <p className="text-sm opacity-75 mt-2">
                Última atualização: 16 de agosto de 2025
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introdução */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Eye className="h-6 w-6 mr-3 text-primary" />
                🌱 Introdução
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-green max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                A Floresta Viva valoriza sua privacidade e está comprometida em proteger suas informações pessoais. 
                Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados 
                quando você utiliza nossa plataforma de e-commerce sustentável.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política. 
                Recomendamos que leia este documento cuidadosamente.
              </p>
            </CardContent>
          </Card>

          {/* Informações Coletadas */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Database className="h-6 w-6 mr-3 text-primary" />
                📊 Informações que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">🔐 Dados Pessoais</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Nome completo e informações de contato</li>
                    <li>Endereço de e-mail e número de telefone</li>
                    <li>Endereços de entrega e cobrança</li>
                    <li>Data de nascimento (quando fornecida)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">🛒 Dados de Transação</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Histórico de pedidos e compras</li>
                    <li>Informações de pagamento (processadas com segurança)</li>
                    <li>Preferências de produtos e categorias</li>
                    <li>Avaliações e comentários sobre produtos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">💻 Dados Técnicos</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Endereço IP e localização aproximada</li>
                    <li>Tipo de dispositivo e navegador utilizado</li>
                    <li>Páginas visitadas e tempo de permanência</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Como Usamos os Dados */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Lock className="h-6 w-6 mr-3 text-primary" />
                🎯 Como Usamos Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">🚀 Operações do Serviço</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Processar e entregar seus pedidos</li>
                    <li>Gerenciar sua conta e perfil</li>
                    <li>Fornecer atendimento ao cliente</li>
                    <li>Enviar confirmações e atualizações de pedidos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">📈 Melhorias e Personalizações</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Personalizar recomendações de produtos</li>
                    <li>Melhorar a experiência de navegação</li>
                    <li>Analisar tendências e comportamentos de compra</li>
                    <li>Desenvolver novos recursos e serviços</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">📧 Comunicações</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Enviar newsletters e promoções (com seu consentimento)</li>
                    <li>Notificar sobre atualizações de políticas</li>
                    <li>Compartilhar informações sobre sustentabilidade</li>
                    <li>Responder a dúvidas e solicitações</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compartilhamento de Dados */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Shield className="h-6 w-6 mr-3 text-primary" />
                🤝 Compartilhamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Floresta Viva não vende, aluga ou compartilha suas informações pessoais com terceiros, 
                exceto nas seguintes situações:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    <strong>Prestadores de Serviços:</strong> Empresas que nos auxiliam no processamento de pagamentos, 
                    entrega de produtos e análise de dados.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    <strong>Obrigações Legais:</strong> Quando exigido por lei, ordem judicial ou autoridades competentes.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    <strong>Segurança:</strong> Para proteger nossos direitos, segurança e propriedade, 
                    bem como de nossos usuários.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança dos Dados */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Lock className="h-6 w-6 mr-3 text-primary" />
                🛡️ Segurança dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger 
                suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">🔐 Medidas Técnicas</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Criptografia SSL/TLS</li>
                    <li>• Autenticação segura</li>
                    <li>• Firewalls e monitoramento</li>
                    <li>• Backups regulares</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">👥 Medidas Organizacionais</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Treinamento de funcionários</li>
                    <li>• Controle de acesso</li>
                    <li>• Políticas de segurança</li>
                    <li>• Auditorias regulares</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seus Direitos */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Eye className="h-6 w-6 mr-3 text-primary" />
                ⚖️ Seus Direitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui os seguintes direitos:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">📋 Acesso</h4>
                    <p className="text-sm text-muted-foreground">Solicitar informações sobre o tratamento de seus dados</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">✏️ Correção</h4>
                    <p className="text-sm text-muted-foreground">Corrigir dados incompletos, inexatos ou desatualizados</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">🗑️ Eliminação</h4>
                    <p className="text-sm text-muted-foreground">Solicitar a exclusão de dados desnecessários</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">📱 Portabilidade</h4>
                    <p className="text-sm text-muted-foreground">Transferir seus dados para outro fornecedor</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">🚫 Oposição</h4>
                    <p className="text-sm text-muted-foreground">Opor-se ao tratamento de dados desnecessários</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">❌ Revogação</h4>
                    <p className="text-sm text-muted-foreground">Revogar consentimento a qualquer momento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Database className="h-6 w-6 mr-3 text-primary" />
                🍪 Política de Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência em nosso site:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">📊 Tipos de Cookies</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Essenciais:</strong> Necessários para o funcionamento básico do site
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Funcionais:</strong> Lembram suas preferências e configurações
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Analíticos:</strong> Ajudam a entender como você usa nosso site
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Marketing:</strong> Personalizam anúncios e ofertas (com seu consentimento)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato e DPO */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Mail className="h-6 w-6 mr-3 text-primary" />
                📞 Contato e Encarregado de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">🏢 Floresta Viva</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      contato@florestaviva.com.br
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      (11) 9999-9999
                    </p>
                    <p className="flex items-start">
                      <span className="text-primary mr-2">📍</span>
                      Rua das Árvores, 123<br />
                      São Paulo - SP, 01234-567
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">👨‍💼 Encarregado de Dados (DPO)</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      dpo@florestaviva.com.br
                    </p>
                    <p>
                      Responsável por garantir o cumprimento da LGPD e atender suas solicitações relacionadas aos dados pessoais.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alterações na Política */}
          <Card className="amazon-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Eye className="h-6 w-6 mr-3 text-primary" />
                🔄 Alterações na Política
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas 
                ou por exigências legais. Sempre que houver alterações significativas, notificaremos você por e-mail ou 
                através de um aviso em nosso site. A data da última atualização está indicada no início deste documento.
              </p>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>💡 Dica:</strong> Recomendamos que revisite esta política regularmente para se manter 
                  informado sobre como protegemos suas informações.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer da Política */}
        <div className="mt-12 text-center">
          <div className="amazon-mist p-6 rounded-2xl border border-primary/20">
            <p className="text-muted-foreground mb-4">
              🌳 Obrigado por confiar na Floresta Viva para proteger seus dados e preservar nosso planeta
            </p>
            <Link href="/">
              <Button className="amazon-button">
                🌿 Voltar à Loja
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}