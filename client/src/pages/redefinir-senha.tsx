import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { passwordResetSchema, type PasswordReset } from "@shared/schema";

export default function RedefinirSenha() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [token, setToken] = useState<string>("");

  const form = useForm<PasswordReset>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    // Extract token from URL parameters
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tokenParam = urlParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      form.setValue('token', tokenParam);
    } else {
      setMessage({
        type: 'error',
        text: 'Token não encontrado na URL. Verifique o link do email.'
      });
    }
  }, [location, form]);

  const onSubmit = async (data: PasswordReset) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await apiRequest("POST", "/api/auth/reset-password", data);
      setMessage({
        type: 'success',
        text: 'Senha redefinida com sucesso! Você pode fazer login com sua nova senha.'
      });
      form.reset();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao redefinir senha'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Digite sua nova senha abaixo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova Senha</CardTitle>
            <CardDescription>
              Escolha uma senha segura com pelo menos 8 caracteres
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && message.type === 'success' ? (
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <a href="/login">Fazer Login como Cliente</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/fornecedor/login">Fazer Login como Fornecedor</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/admin/login">Fazer Login como Admin</a>
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Digite sua nova senha"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {message && message.type === 'error' && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading || !token}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      'Redefinir Senha'
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {!message && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lembrou da sua senha?{" "}
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Fazer login
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}