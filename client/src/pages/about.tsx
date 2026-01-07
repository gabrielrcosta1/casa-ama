import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Users, Shield, Heart, Award, Globe, ArrowRight, CheckCircle } from "lucide-react";

export default function About() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in-up">
            <Leaf className="w-4 h-4 mr-2" />
            Conectando pessoas à biodiversidade amazônica
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in-up animation-delay-200">
            Nossa História: <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CASA D'AMAZÔNIA</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
            Somos um marketplace dedicado a levar a riqueza sustentável da Amazônia para sua casa,
            conectando consumidores conscientes com produtores comprometidos com a preservação da floresta.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Promover um futuro mais sustentável através de um comércio que valoriza produtos autênticos da Amazônia,
                práticas de extrativismo responsável e o desenvolvimento de uma bioeconomia forte e justa.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Produtos Autênticos</h3>
                    <p className="text-muted-foreground">Curadoria rigorosa de produtos que respeitam a floresta e suas comunidades.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Fornecedores Verificados</h3>
                    <p className="text-muted-foreground">Parceiros comprometidos com o comércio justo e práticas sustentáveis.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Impacto Positivo</h3>
                    <p className="text-muted-foreground">Cada compra contribui para a conservação da Amazônia.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Produtos da Floresta</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <div className="text-sm text-muted-foreground">Produtores Parceiros</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5.000+</div>
                  <div className="text-sm text-muted-foreground">Clientes Satisfeitos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100 ha</div>
                  <div className="text-sm text-muted-foreground">Área de Manejo Sustentável</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Valores</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os princípios que guiam nossas decisões e definem nossa identidade.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Sustentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compromisso com práticas que preservam a biodiversidade para as futuras gerações.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Transparência</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Informações claras sobre a origem, produção e o impacto socioambiental de cada produto.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Respeito</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Valorizamos os conhecimentos tradicionais e a cultura das comunidades da floresta.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Construímos uma comunidade engajada de consumidores e produtores pelo bem da Amazônia.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossa Equipe</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Apaixonados pela Amazônia e por inovação, trabalhando juntos por um futuro mais verde.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-background">
              <CardHeader>
                <div className="mx-auto w-24 h-24 acai-gradient rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">AO</span>
                </div>
                <CardTitle>Ana Oliveira</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mb-2">CEO & Fundadora</Badge>
                  <p className="text-muted-foreground">
                    Especialista em bioeconomia com 15 anos de experiência em e-commerce sustentável.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center bg-background">
              <CardHeader>
                <div className="mx-auto w-24 h-24 acai-gradient rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">MS</span>
                </div>
                <CardTitle>Marcus Silva</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mb-2">CTO</Badge>
                  <p className="text-muted-foreground">
                    Desenvolvedor fullstack especializado em plataformas de marketplace e tecnologias de impacto.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center bg-background">
              <CardHeader>
                <div className="mx-auto w-24 h-24 acai-gradient rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">LC</span>
                </div>
                <CardTitle>Lucia Costa</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mb-2">Diretora de Parcerias</Badge>
                  <p className="text-muted-foreground">
                    Responsável pela curadoria de produtores e pelo desenvolvimento de cadeias produtivas justas.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Certificações e Reconhecimentos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa dedicação à sustentabilidade é reconhecida por organizações que lideram o setor.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Selo Origens Brasil®</h3>
              <p className="text-sm text-muted-foreground">Rastreabilidade e comércio ético</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Sistema B</h3>
              <p className="text-sm text-muted-foreground">Empresa com propósito social e ambiental</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Selo Eureciclo</h3>
              <p className="text-sm text-muted-foreground">Logística reversa de embalagens</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">ODS</h3>
              <p className="text-sm text-muted-foreground">Alinhados aos Objetivos de Desenvolvimento Sustentável</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* MUDANÇA: Estilos ajustados para espelhar a seção Hero da página Home. */}
      <section className="acai-gradient text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground mb-6 drop-shadow-lg">
            Faça Parte da Nossa Missão
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Junte-se a milhares de pessoas que já escolheram um estilo de vida mais sustentável com a Amazônia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="acai-button w-full sm:w-auto font-bold text-lg px-8 py-3">
                Explorar Produtos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/supplier/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-lg px-8 py-3">
                Tornar-se Fornecedor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}