import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Heart, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Send, 
  Briefcase,
  GraduationCap,
  Coffee,
  Shield,
  Zap,
  Target,
  Sprout
} from "lucide-react";

const applicationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  position: z.string().min(1, "Posição é obrigatória"),
  experience: z.string().min(1, "Nível de experiência é obrigatório"),
  linkedin: z.string().url("URL do LinkedIn inválida").optional().or(z.literal("")),
  portfolio: z.string().url("URL do portfólio inválida").optional().or(z.literal("")),
  coverLetter: z.string().min(50, "Carta de apresentação deve ter pelo menos 50 caracteres"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  isUrgent?: boolean;
}

const jobPositions: JobPosition[] = [
  {
    id: "1",
    title: "Desenvolvedor Full Stack Sênior",
    department: "Tecnologia",
    location: "Manaus, AM",
    type: "CLT",
    level: "Sênior",
    salary: "R$ 9.000 - R$ 13.000",
    description: "Lidere o desenvolvimento da nossa plataforma de e-commerce, conectando produtores da Amazônia a clientes de todo o Brasil.",
    requirements: [
      "5+ anos de experiência em desenvolvimento web",
      "Domínio em React, Node.js e TypeScript",
      "Experiência com bancos de dados PostgreSQL",
      "Conhecimento em práticas de DevOps (Docker, CI/CD)",
      "Paixão por produtos da Amazônia"
    ],
    benefits: [
      "Plano de saúde e odontológico",
      "Vale refeição/alimentação de R$ 950",
      "Home office híbrido (3x por semana no escritório)",
      "Plano de carreira estruturado",
      "Participação nos lucros e resultados"
    ],
    isRemote: false,
    isUrgent: true
  },
  {
    id: "2",
    title: "Especialista em Logística (Produtos da Amazônia)",
    department: "Operações",
    location: "Remoto",
    type: "CLT",
    level: "Pleno",
    salary: "R$ 6.000 - R$ 9.000",
    description: "Estruture a logística de envio de produtos sensíveis da Amazônia para todo o país, garantindo qualidade e rapidez.",
    requirements: [
      "3+ anos de experiência em logística de e-commerce",
      "Conhecimento em cadeia de frio e transporte de alimentos",
      "Habilidade de negociação com transportadoras",
      "Excel avançado e conhecimento em sistemas de WMS",
      "Experiência com produtos regionais é um diferencial"
    ],
    benefits: [
      "100% remoto",
      "Plano de saúde",
      "Vale refeição/alimentação de R$ 800",
      "Auxílio home office",
      "Horário flexível"
    ],
    isRemote: true
  },
  {
    id: "3",
    title: "Biólogo / Engenheiro de Alimentos",
    department: "Qualidade & Fornecedores",
    location: "Manaus, AM",
    type: "CLT",
    level: "Júnior/Pleno",
    salary: "R$ 4.500 - R$ 7.500",
    description: "Seja o ponto de contato com nossos fornecedores ribeirinhos, garantindo a qualidade e sustentabilidade dos produtos.",
    requirements: [
      "Formação em Biologia, Engenharia de Alimentos, Agronomia ou áreas correlatas",
      "Conhecimento em certificações orgânicas e de comércio justo",
      "Disponibilidade para viagens pela região amazônica",
      "Excelente comunicação interpessoal",
      "Paixão pela cultura e biodiversidade local"
    ],
    benefits: [
      "Plano de saúde completo",
      "Vale refeição/alimentação R$ 750",
      "Trabalho de campo com propósito",
      "Participação em eventos de bioeconomia",
      "Bônus por performance"
    ],
    isRemote: false
  }
];

const companyValues = [
  {
    icon: <Heart className="w-8 h-8 text-green-600" />,
    title: "Raízes na Amazônia",
    description: "Nosso compromisso é com a floresta, sua biodiversidade e suas comunidades."
  },
  {
    icon: <Users className="w-8 h-8 text-amber-600" />,
    title: "Comunidade",
    description: "Acreditamos que o sucesso é coletivo, unindo colaboradores, produtores e clientes."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
    title: "Inovação com Propósito",
    description: "Usamos a tecnologia para levar a riqueza da Amazônia mais longe, de forma sustentável."
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Qualidade Autêntica",
    description: "Garantimos a pureza e a origem de cada produto que chega até você."
  }
];

const benefits = [
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    title: "Plano de Saúde e Bem-Estar",
    description: "Cobertura médica e odontológica para você e sua família."
  },
  {
    icon: <Coffee className="w-6 h-6 text-amber-600" />,
    title: "Flexibilidade",
    description: "Opções de trabalho híbrido ou remoto e horários flexíveis."
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-green-600" />,
    title: "Desenvolvimento Contínuo",
    description: "Incentivo a cursos, certificações e plano de carreira claro."
  },
  {
    icon: <Sprout className="w-6 h-6 text-yellow-600" />,
    title: "Impacto Real",
    description: "Seu trabalho contribui diretamente para a bioeconomia e a conservação da Amazônia."
  }
];

export default function Careers() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [showApplication, setShowApplication] = useState(false);

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      linkedin: "",
      portfolio: "",
      coverLetter: "",
    },
  });

  const onSubmit = async (data: ApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Candidatura enviada!",
        description: "Recebemos seus dados. Boa sorte no processo seletivo!",
      });
      
      form.reset();
      setShowApplication(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema. Tente novamente ou nos contate por email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = (positionId: string) => {
    const position = jobPositions.find(p => p.id === positionId);
    if (position) {
      setSelectedPosition(position.title);
      form.setValue("position", position.title);
      setShowApplication(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4 mr-2" />
            Trabalhe na CASA D'AMAZÔNIA
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Construa o <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Futuro</span> da Amazônia
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Junte-se à nossa missão de valorizar a bioeconomia e conectar os tesouros da Amazônia ao mundo. 
            Aqui, seu talento gera impacto socioambiental positivo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="acai-button" onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Vagas Abertas
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowApplication(true)}>
              Candidatura Espontânea
            </Button>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Pilares</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estes são os princípios que guiam nossas decisões, nossa cultura e nosso impacto.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <Card key={index} className="text-center p-6 bg-white shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefícios e Vantagens</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cuidamos da nossa gente para que possam cuidar da nossa missão.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 bg-white shadow-lg">
                <CardContent className="pt-0">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Positions */}
      <section id="positions" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vagas Abertas</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre a oportunidade ideal para crescer e gerar impacto conosco.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobPositions.map((job) => (
              <Card key={job.id} className="relative bg-white shadow-lg hover:shadow-xl transition-shadow">
                {job.isUrgent && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Urgente
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{job.department}</Badge>
                    <Badge variant="outline">{job.level}</Badge>
                    <Badge variant="outline">{job.type}</Badge>
                    {job.isRemote && (
                      <Badge className="bg-green-100 text-green-800">
                        Remoto
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{job.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Principais Requisitos:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-primary">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      className="w-full acai-button" 
                      onClick={() => handleApply(job.id)}
                    >
                      Candidatar-se
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Formulário de Candidatura</CardTitle>
                    <CardDescription>
                      {selectedPosition ? `Posição: ${selectedPosition}` : "Candidatura Espontânea"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApplication(false)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl><Input placeholder="(92) 99999-9999" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="experience" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Experiência *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Selecione seu nível" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="junior">Júnior (0-2 anos)</SelectItem>
                              <SelectItem value="pleno">Pleno (3-5 anos)</SelectItem>
                              <SelectItem value="senior">Sênior (5+ anos)</SelectItem>
                              <SelectItem value="especialista">Especialista (8+ anos)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="position" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posição de Interesse *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione uma posição" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jobPositions.map((job) => (
                              <SelectItem key={job.id} value={job.title}>{job.title}</SelectItem>
                            ))}
                            <SelectItem value="candidatura-espontanea">Candidatura Espontânea</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="linkedin" render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl><Input placeholder="https://linkedin.com/in/seuperfil" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="portfolio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfólio/GitHub</FormLabel>
                          <FormControl><Input placeholder="https://seuportfolio.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="coverLetter" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carta de Apresentação *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte-nos por que você quer fazer parte da CASA D'AMAZÔNIA e como seu trabalho pode gerar impacto..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Lembrete:</strong> Caso queira nos enviar seu currículo, mande para o e-mail
                        <strong> carreiras@casadamazonia.com.br</strong> com o título da vaga.
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowApplication(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1 acai-button" disabled={isSubmitting}>
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Candidatura
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}