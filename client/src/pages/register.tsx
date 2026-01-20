import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Loader2 } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/use-customer-auth';
import { useToast } from '@/hooks/use-toast';
import { insertCustomerSchema, type InsertCustomer } from '@shared/schema';
import { AnimatePresence, motion } from 'framer-motion';

interface AddressFields {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register: registerCustomer, isLoading, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [addressFields, setAddressFields] = useState<AddressFields>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepLookedUp, setCepLookedUp] = useState(false);

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Brasil',
    },
  });

  const handleCepBlur = useCallback(async () => {
    const cep = addressFields.cep.replace(/\D/g, '');
    if (isCepLoading || cep.length !== 8) return;

    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) throw new Error("CEP não encontrado");
      setAddressFields(prev => ({
        ...prev,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));
      setCepLookedUp(true);
      form.setValue('city', data.localidade || '');
      form.setValue('postalCode', cep.length > 5 ? cep.slice(0, 5) + '-' + cep.slice(5) : cep);
      setTimeout(() => document.getElementById('address-numero')?.focus(), 100);
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível encontrar o CEP digitado.",
        variant: "destructive",
      });
      setCepLookedUp(false);
    } finally {
      setIsCepLoading(false);
    }
  }, [addressFields.cep, isCepLoading, toast, form]);

  useEffect(() => {
    const cep = addressFields.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      handleCepBlur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressFields.cep]);

  const handleAddressChange = (field: keyof AddressFields, value: string) => {
    if (field === 'cep') {
      const cepValue = value.replace(/\D/g, '').slice(0, 8);
      const formattedCep = cepValue.length > 5 ? cepValue.slice(0, 5) + '-' + cepValue.slice(5) : cepValue;
      setAddressFields(prev => ({ ...prev, cep: formattedCep }));
      form.setValue('postalCode', formattedCep);
    } else {
      setAddressFields(prev => ({ ...prev, [field]: value }));
      if (field === 'cidade') {
        form.setValue('city', value);
      }
    }
  };

  const onSubmit = async (data: InsertCustomer) => {
    setError('');

    // Se o usuário preencheu o CEP, monta o endereço estruturado
    let finalAddress = data.address || '';
    if (addressFields.cep && cepLookedUp) {
      const addressObject = {
        cep: addressFields.cep.replace(/\D/g, ''),
        rua: addressFields.rua,
        numero: addressFields.numero,
        complemento: addressFields.complemento,
        bairro: addressFields.bairro,
        cidade: addressFields.cidade,
        estado: addressFields.estado,
      };
      finalAddress = JSON.stringify(addressObject);
    }

    const submitData: InsertCustomer = {
      ...data,
      address: finalAddress,
      city: addressFields.cidade || data.city || '',
      postalCode: addressFields.cep.replace(/\D/g, '') || data.postalCode || '',
    };

    try {
      await registerCustomer(submitData);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à nossa loja online!",
      });
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Criar Conta
          </CardTitle>
          <CardDescription>
            Crie sua conta para fazer compras e acompanhar seus pedidos
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informações Pessoais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu sobrenome" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefone
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Login Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Dados de Acesso
                </h3>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço (Opcional)
                </h3>

                <div>
                  <FormLabel htmlFor="address-cep">CEP</FormLabel>
                  <div className="relative">
                    <Input
                      id="address-cep"
                      value={addressFields.cep}
                      onChange={(e) => handleAddressChange('cep', e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      inputMode="numeric"
                      disabled={isLoading || isCepLoading}
                    />
                    {isCepLoading && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {cepLookedUp && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <FormLabel htmlFor="address-rua">Rua</FormLabel>
                        <Input
                          id="address-rua"
                          value={addressFields.rua}
                          onChange={(e) => handleAddressChange('rua', e.target.value)}
                          placeholder="Nome da sua rua"
                          disabled={isLoading || isCepLoading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel htmlFor="address-numero">Número</FormLabel>
                          <Input
                            id="address-numero"
                            value={addressFields.numero}
                            onChange={(e) => handleAddressChange('numero', e.target.value)}
                            placeholder="123"
                            disabled={isLoading || isCepLoading}
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <FormLabel htmlFor="address-complemento">Complemento</FormLabel>
                          <Input
                            id="address-complemento"
                            value={addressFields.complemento}
                            onChange={(e) => handleAddressChange('complemento', e.target.value)}
                            placeholder="Apto, Bloco, etc."
                            disabled={isLoading || isCepLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <FormLabel htmlFor="address-bairro">Bairro</FormLabel>
                        <Input
                          id="address-bairro"
                          value={addressFields.bairro}
                          onChange={(e) => handleAddressChange('bairro', e.target.value)}
                          placeholder="Seu bairro"
                          disabled={isLoading || isCepLoading}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <FormLabel htmlFor="address-cidade">Cidade</FormLabel>
                          <Input
                            id="address-cidade"
                            value={addressFields.cidade}
                            onChange={(e) => handleAddressChange('cidade', e.target.value)}
                            placeholder="Sua cidade"
                            disabled={isLoading || isCepLoading}
                          />
                        </div>
                        <div>
                          <FormLabel htmlFor="address-estado">Estado</FormLabel>
                          <Input
                            id="address-estado"
                            value={addressFields.estado}
                            onChange={(e) => handleAddressChange('estado', e.target.value.toUpperCase())}
                            placeholder="UF"
                            maxLength={2}
                            disabled={isLoading || isCepLoading}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Fazer login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
