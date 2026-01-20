import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierLoginSchema, type SupplierLogin } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Store, Mail, Lock } from "lucide-react";

export default function SupplierLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    const supplier = localStorage.getItem('supplier');
    if (supplier) {
      try {
        const supplierData = JSON.parse(supplier);
        if (supplierData.id) {
          setLocation('/supplier/dashboard');
        }
      } catch {
        // Se houver erro ao fazer parse, remove o item inválido
        localStorage.removeItem('supplier');
      }
    }
  }, [setLocation]);

  const form = useForm<SupplierLogin>({
    resolver: zodResolver(supplierLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: SupplierLogin) => {
      return apiRequest("POST", "/api/supplier/login", data);
    },
    onSuccess: (supplier) => {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${supplier.companyName}!`,
      });

      // Store supplier info in localStorage for now (in production, use proper session management)
      localStorage.setItem('supplier', JSON.stringify(supplier));

      // Redirect to supplier dashboard
      setLocation("/supplier/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupplierLogin) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal do Fornecedor</h1>
          <p className="text-gray-600">
            Acesse sua conta para gerenciar produtos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar na conta</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o painel de fornecedor
            </CardDescription>
          </CardHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="seu@email.com"
                  className="mt-1"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Sua senha"
                  className="mt-1"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link href="/supplier/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Cadastrar empresa
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
