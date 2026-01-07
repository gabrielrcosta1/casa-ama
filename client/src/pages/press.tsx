import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Image as ImageIcon,
  Award,
  TrendingUp,
  Users,
  Globe,
  Sprout
} from "lucide-react";

interface PressRelease {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  downloadUrl?: string;
  isRecent?: boolean;
}

interface MediaKit {
  id: string;
  title: string;
  description: string;
  type: "image" | "document" | "video";
  downloadUrl: string;
  fileSize: string;
}

interface AwardRecognition {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  category: string;
}

const pressReleases: PressRelease[] = [
  {
    id: "1",
    title: "CASA D'AMAZÔNIA lança plataforma para conectar produtores ribeirinhos ao mercado nacional",
    date: "2025-01-20",
    excerpt: "Iniciativa inovadora de e-commerce visa gerar renda e fortalecer a bioeconomia na região, com mais de 50 famílias beneficiadas no lançamento.",
    category: "Lançamento",
    downloadUrl: "/press/release-lancamento-plataforma.pdf",
    isRecent: true
  },
  {
    id: "2",
    title: "Parceria com cooperativas locais garante rastreabilidade e comércio justo para o açaí",
    date: "2024-12-15",
    excerpt: "Programa fortalece a produção sustentável e assegura qualidade superior do produto, desde a colheita até o consumidor final.",
    category: "Comunidade",
    downloadUrl: "/press/release-parceria-cooperativas.pdf",
    isRecent: true
  },
  {
    id: "3",
    title: "CASA D'AMAZÔNIA recebe certificação de Comércio Justo e Orgânico",
    date: "2024-11-25",
    excerpt: "Selo internacional reconhece o compromisso da empresa com práticas socioambientais responsáveis e o respeito aos produtores.",
    category: "Sustentabilidade",
    downloadUrl: "/press/release-certificacao-organica.pdf"
  },
  {
    id: "4",
    title: "Marca de 10 toneladas de polpa de açaí comercializadas é atingida em menos de um ano",
    date: "2024-10-05",
    excerpt: "Crescimento expressivo demonstra a alta demanda por produtos amazônicos autênticos e de origem comprovada no mercado brasileiro.",
    category: "Mercado",
    downloadUrl: "/press/release-10-toneladas-acai.pdf"
  }
];

const mediaKit: MediaKit[] = [
  {
    id: "1",
    title: "Logo Oficial - CASA D'AMAZÔNIA",
    description: "Nosso logotipo em alta resolução para uso em mídias digitais e impressas.",
    type: "image",
    downloadUrl: "/media/cda-logo-pack.zip",
    fileSize: "3.1 MB"
  },
  {
    id: "2",
    title: "Fotos dos Produtores e da Região",
    description: "Imagens que retratam a origem de nossos produtos e as comunidades parceiras.",
    type: "image",
    downloadUrl: "/media/cda-produtores-fotos.zip",
    fileSize: "25 MB"
  },
  {
    id: "3",
    title: "Manifesto da Marca",
    description: "Documento com nossos valores, missão e o impacto que buscamos gerar.",
    type: "document",
    downloadUrl: "/media/cda-manifesto.pdf",
    fileSize: "1.5 MB"
  },
  {
    id: "4",
    title: "Vídeo Institucional - Da Floresta para Você",
    description: "Curta-metragem sobre a jornada de nossos produtos.",
    type: "video",
    downloadUrl: "/media/cda-video-institucional.mp4",
    fileSize: "98 MB"
  }
];

const awards: AwardRecognition[] = [
  {
    id: "1",
    title: "Prêmio Bioeconomia Amazônia",
    organization: "Instituto de Conservação e Desenvolvimento Sustentável da Amazônia (IDESAM)",
    year: "2024",
    description: "Reconhecimento pelo modelo de negócio inovador que valoriza a floresta em pé.",
    category: "Sustentabilidade"
  },
  {
    id: "2",
    title: "Startup de Impacto Socioambiental",
    organization: "Folha de S. Paulo / Schwab Foundation",
    year: "2024",
    description: "Destaque por gerar impacto positivo e escalável para comunidades tradicionais.",
    category: "Impacto Social"
  },
  {
    id: "3",
    title: "Selo de Origem e Comércio Justo",
    organization: "World Fair Trade Organization (WFTO)",
    year: "2023",
    description: "Certificação pelo compromisso com a transparência e a remuneração justa de produtores.",
    category: "Certificação"
  }
];

const companyStats = [
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    value: "50+",
    label: "Famílias Ribeirinhas",
    description: "Parceiras no fornecimento de matéria-prima"
  },
  {
    icon: <Sprout className="w-8 h-8 text-green-600" />,
    value: "20+",
    label: "Produtos da Sócio-biodiversidade",
    description: "Itens que valorizam a riqueza da floresta"
  },
  {
    icon: <Globe className="w-8 h-8 text-purple-600" />,
    value: "15",
    label: "Estados Atendidos",
    description: "Levando o sabor da Amazônia para o Brasil"
  },
  {
    icon: <Award className="w-8 h-8 text-amber-600" />,
    value: "5+",
    label: "Reconhecimentos de Impacto",
    description: "Prêmios que validam nossa missão"
  }
];

export default function Press() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredReleases = selectedCategory === "all" 
    ? pressReleases 
    : pressReleases.filter(release => release.category.toLowerCase() === selectedCategory);

  const categories = ["all", "lançamento", "comunidade", "sustentabilidade", "mercado"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
            <FileText className="w-4 h-4 mr-2" />
            Centro de Imprensa
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            CASA D'AMAZÔNIA <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">na Mídia</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Acesse nossas últimas notícias, comunicados e materiais de apoio. Conecte-se com a nossa história e o nosso impacto na Amazônia.
          </p>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Jornada em Números</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dados que refletem nosso compromisso e crescimento na valorização da bioeconomia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => (
              <Card key={index} className="text-center p-6 bg-white shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Press Releases */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Comunicados Oficiais</h2>
              <p className="text-gray-600 mb-6">As últimas notícias e anúncios da CASA D'AMAZÔNIA.</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize acai-button-variant"
                  >
                    {category === "all" ? "Todos" : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {filteredReleases.map((release) => (
                <Card key={release.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{release.category}</Badge>
                      {release.isRecent && (
                        <Badge className="bg-red-100 text-red-800">Novo</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{release.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(release.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </div>
                    <CardDescription>{release.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end items-center">
                      {release.downloadUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar PDF
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Contato para Imprensa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Mariana Costa</p>
                  <p className="text-sm text-gray-600">Assessoria de Comunicação</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    imprensa@casadamazonia.com.br
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    (92) 3000-0000 | Ramal 101
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-green-600" />
                  Kit de Mídia
                </CardTitle>
                <CardDescription>Recursos para download</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mediaKit.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <span className="text-xs text-gray-500">{item.fileSize}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-amber-600" />
                  Prêmios e Reconhecimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {awards.map((award) => (
                    <div key={award.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{award.title}</h4>
                        <span className="text-xs text-gray-500">{award.year}</span>
                      </div>
                      <p className="text-xs text-primary mb-1">{award.organization}</p>
                      <p className="text-xs text-gray-600">{award.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <Card className="bg-gradient-to-r from-green-100/50 to-amber-100/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Receba nossas Novidades
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Inscreva-se para receber em primeira mão os comunicados e as histórias que nascem na Amazônia e ganham o mundo através da nossa casa.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder="Seu email profissional"
                    className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button className="acai-button">
                  Inscrever-se
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}