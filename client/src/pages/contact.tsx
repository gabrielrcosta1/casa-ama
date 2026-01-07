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
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle, ShoppingBag, Leaf } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Assunto é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      category: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    try {
      // Simulação de envio de formulário
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua mensagem e entraremos em contato em breve.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato por um de nossos canais.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            Entre em contato conosco
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Fale com a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CASA D'AMAZÔNIA</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Estamos aqui para ajudar! Entre em contato para dúvidas, sugestões ou suporte. 
            Nossa equipe está pronta para atendê-lo da melhor forma possível.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-primary" />
                    Telefone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Atendimento ao Cliente</p>
                  <p className="font-semibold text-lg">(92) 3000-0000</p>
                  <p className="text-gray-600 mb-2 mt-4">WhatsApp</p>
                  <p className="font-semibold text-lg">(92) 99999-9999</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-primary" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Atendimento Geral</p>
                  <p className="font-semibold">contato@casadamazonia.com.br</p>
                  <p className="text-gray-600 mb-2 mt-4">Fornecedores</p>
                  <p className="font-semibold">fornecedores@casadamazonia.com.br</p>
                  <p className="text-gray-600 mb-2 mt-4">Suporte Técnico</p>
                  <p className="font-semibold">suporte@casadamazonia.com.br</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    Horário de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Segunda a Sexta</span>
                      <span className="font-semibold">8h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sábado</span>
                      <span className="font-semibold">9h às 14h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domingo</span>
                      <span className="font-semibold">Fechado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Nossa Casa</p>
                  <p className="font-semibold">Avenida Amazônia, 123</p>
                  <p className="font-semibold">Centro - Manaus/AM</p>
                  <p className="font-semibold">CEP: 69000-000</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Envie sua Mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(92) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="suporte">
                                  <div className="flex items-center">
                                    <HelpCircle className="w-4 h-4 mr-2" />
                                    Suporte Técnico
                                  </div>
                                </SelectItem>
                                <SelectItem value="vendas">
                                  <div className="flex items-center">
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Vendas e Produtos
                                  </div>
                                </SelectItem>
                                <SelectItem value="fornecedor">
                                   <div className="flex items-center">
                                    <Leaf className="w-4 h-4 mr-2" />
                                    Sou Fornecedor
                                  </div>
                                </SelectItem>
                                <SelectItem value="parceria">Parcerias</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assunto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Descreva brevemente o assunto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva detalhadamente sua dúvida, sugestão ou solicitação..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Dica:</strong> Para suporte técnico, inclua detalhes como navegador, 
                        sistema operacional e descrição do problema para um atendimento mais rápido.
                      </p>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Perguntas Frequentes</CardTitle>
              <CardDescription>
                Confira as dúvidas mais comuns de nossos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Como faço para rastrear meu pedido?</h4>
                  <p className="text-gray-600 text-sm">
                    Você pode rastrear seu pedido através do email de confirmação enviado após a compra 
                    ou entrando em sua conta no site.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Qual o prazo de entrega?</h4>
                  <p className="text-gray-600 text-sm">
                    O prazo varia conforme sua localização e o produto escolhido. 
                    Consulte o prazo no checkout antes de finalizar a compra.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Posso trocar ou devolver um produto?</h4>
                  <p className="text-gray-600 text-sm">
                    Sim! Você tem até 7 dias para trocar ou devolver produtos, 
                    conforme o Código de Defesa do Consumidor.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Como me tornar um fornecedor?</h4>
                  <p className="text-gray-600 text-sm">
                    Entre em contato através do email fornecedores@casadamazonia.com.br para mais informações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
