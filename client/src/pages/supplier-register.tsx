import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSupplierSchema, type InsertSupplier } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Building2, Store, User, Mail, Lock, Phone, MapPin, Globe, FileText, AlertCircle } from "lucide-react";

export default function SupplierRegister() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      email: "",
      password: "",
      companyName: "",
      contactName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Brasil",
      cnpj: "",
      website: "",
      description: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      return apiRequest("POST", "/api/supplier/register", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seu cadastro foi enviado para análise. Você receberá um email quando for aprovado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Houve um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSupplier) => {
    registerMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Cadastro Enviado!</CardTitle>
            <CardDescription>
              Seu cadastro foi enviado para análise. Nossa equipe irá revisar as informações e você receberá um email de confirmação quando for aprovado.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full">Voltar ao Início</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Fornecedor</h1>
          <p className="text-gray-600">
            Cadastre sua empresa como fornecedor e comece a vender em nossa plataforma
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Preencha os dados da sua empresa para análise
            </CardDescription>
          </CardHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Processo de Aprovação</p>
                  <p className="text-amber-700">
                    Todos os cadastros passam por análise. Você receberá um email quando sua conta for aprovada e poderá começar a adicionar produtos.
                  </p>
                </div>
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="companyName"
                    {...form.register("companyName")}
                    placeholder="Ex: Minha Empresa Ltda"
                    className="mt-1"
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome do Contato *
                  </Label>
                  <Input
                    id="contactName"
                    {...form.register("contactName")}
                    placeholder="João Silva"
                    className="mt-1"
                  />
                  {form.formState.errors.contactName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.contactName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cnpj">
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    {...form.register("cnpj")}
                    placeholder="00.000.000/0000-00"
                    className="mt-1"
                  />
                  {form.formState.errors.cnpj && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.cnpj.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="contato@empresa.com"
                    className="mt-1"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://www.empresa.com"
                    className="mt-1"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="Mínimo 8 caracteres"
                    className="mt-1"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </h3>
                
                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="Rua, número, bairro"
                    className="mt-1"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder="São Paulo"
                      className="mt-1"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postalCode">CEP *</Label>
                    <Input
                      id="postalCode"
                      {...form.register("postalCode")}
                      placeholder="01000-000"
                      className="mt-1"
                    />
                    {form.formState.errors.postalCode && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      {...form.register("country")}
                      defaultValue="Brasil"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descrição da Empresa
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Conte um pouco sobre sua empresa, produtos ou serviços..."
                  className="mt-1 min-h-[100px]"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  "Cadastrar Empresa"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/supplier/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Fazer login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-600 hover:text-gray-700">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}