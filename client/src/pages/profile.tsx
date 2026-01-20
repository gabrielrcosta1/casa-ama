import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Loader2, Save, Key } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/use-customer-auth';
import { useToast } from '@/hooks/use-toast';
import { insertCustomerSchema, type InsertCustomer } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function Profile() {
  const { customer, isAuthenticated, updateProfile, isLoading: authLoading } = useCustomerAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<Partial<InsertCustomer>>({
    resolver: zodResolver(insertCustomerSchema.partial()),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Brasil',
    },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Garante que a página sempre comece no topo ao montar
  useEffect(() => {
    // Usa requestAnimationFrame para garantir que o scroll aconteça após o render
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    // Também força scroll após um pequeno delay para garantir
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Carrega dados do cliente
  useEffect(() => {
    // Aguarda o carregamento inicial antes de verificar autenticação
    if (authLoading) {
      return;
    }

    // Só redireciona se realmente não estiver autenticado após o carregamento
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (customer) {
      profileForm.reset({
        email: customer.email || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        address: typeof customer.address === 'string' ? customer.address : '',
        city: customer.city || '',
        postalCode: customer.postalCode || '',
        country: customer.country || 'Brasil',
      });

      // Verifica se o endereço é um objeto (JSON parseado) ou string JSON
      let addressToUse = customer.address;

      // Se for string, tenta fazer parse
      if (typeof addressToUse === 'string' && addressToUse.trim().startsWith('{')) {
        try {
          addressToUse = JSON.parse(addressToUse);
        } catch {
          // Se falhar, mantém como string
        }
      }

      // Se o endereço for um objeto, preenche os campos
      if (addressToUse && typeof addressToUse === 'object' && addressToUse !== null) {
        const savedAddress = addressToUse as any;
        if (savedAddress.cep) {
          // Formata o CEP com máscara
          const cepValue = savedAddress.cep.replace(/\D/g, '');
          const formattedCep = cepValue.length > 5 ? cepValue.slice(0, 5) + '-' + cepValue.slice(5) : cepValue;

          setAddressFields({
            cep: formattedCep,
            rua: savedAddress.rua || '',
            numero: savedAddress.numero || '',
            complemento: savedAddress.complemento || '',
            bairro: savedAddress.bairro || '',
            cidade: savedAddress.cidade || '',
            estado: savedAddress.estado || '',
          });
          setCepLookedUp(true);
        }
      }

      // Garante que a página está no topo após carregar os dados
      // Usa requestAnimationFrame e setTimeout para garantir que o scroll aconteça após o render
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }, 10);
      });
    }
  }, [customer, isAuthenticated, authLoading, navigate, profileForm]);

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
      profileForm.setValue('city', data.localidade || '');
      profileForm.setValue('postalCode', cep.length > 5 ? cep.slice(0, 5) + '-' + cep.slice(5) : cep);
      // Foca no campo número apenas se o usuário estiver interagindo (não no carregamento inicial)
      setTimeout(() => {
        const numeroField = document.getElementById('profile-numero');
        if (numeroField && document.activeElement?.tagName !== 'INPUT') {
          numeroField.focus();
        }
      }, 100);
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
  }, [addressFields.cep, isCepLoading, toast, profileForm]);

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
      profileForm.setValue('postalCode', formattedCep);
    } else {
      setAddressFields(prev => ({ ...prev, [field]: value }));
      if (field === 'cidade') {
        profileForm.setValue('city', value);
      }
    }
  };

  const onProfileSubmit = async (data: Partial<InsertCustomer>) => {
    if (!customer) return;

    setIsUpdatingProfile(true);
    try {
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

      const updateData: Partial<InsertCustomer> = {
        ...data,
        address: finalAddress,
        city: addressFields.cidade || data.city || '',
        postalCode: addressFields.cep.replace(/\D/g, '') || data.postalCode || '',
      };

      await updateProfile(updateData);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    if (!customer) return;

    setIsChangingPassword(true);
    try {
      const response = await apiRequest('POST', `/api/auth/customer/${customer.id}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao alterar senha');
      }

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return null;
  }

  // Força scroll para o topo quando o componente renderiza completamente
  useEffect(() => {
    const forceScrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    // Múltiplas tentativas para garantir que funcione
    forceScrollToTop();
    requestAnimationFrame(forceScrollToTop);
    setTimeout(forceScrollToTop, 0);
    setTimeout(forceScrollToTop, 50);
    setTimeout(forceScrollToTop, 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais e segurança</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Alterar Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Dados Pessoais
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome *</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu nome" {...field} disabled={isUpdatingProfile} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sobrenome *</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu sobrenome" {...field} disabled={isUpdatingProfile} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
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
                                disabled={isUpdatingProfile}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefone
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} disabled={isUpdatingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço (Opcional)
                      </h3>

                      <div>
                        <FormLabel htmlFor="profile-cep">CEP</FormLabel>
                        <div className="relative">
                          <Input
                            id="profile-cep"
                            value={addressFields.cep}
                            onChange={(e) => handleAddressChange('cep', e.target.value)}
                            placeholder="00000-000"
                            maxLength={9}
                            inputMode="numeric"
                            disabled={isUpdatingProfile || isCepLoading}
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
                              <FormLabel htmlFor="profile-rua">Rua</FormLabel>
                              <Input
                                id="profile-rua"
                                value={addressFields.rua}
                                onChange={(e) => handleAddressChange('rua', e.target.value)}
                                placeholder="Nome da sua rua"
                                disabled={isUpdatingProfile || isCepLoading}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel htmlFor="profile-numero">Número</FormLabel>
                                <Input
                                  id="profile-numero"
                                  value={addressFields.numero}
                                  onChange={(e) => handleAddressChange('numero', e.target.value)}
                                  placeholder="123"
                                  disabled={isUpdatingProfile || isCepLoading}
                                  inputMode="numeric"
                                />
                              </div>
                              <div>
                                <FormLabel htmlFor="profile-complemento">Complemento</FormLabel>
                                <Input
                                  id="profile-complemento"
                                  value={addressFields.complemento}
                                  onChange={(e) => handleAddressChange('complemento', e.target.value)}
                                  placeholder="Apto, Bloco, etc."
                                  disabled={isUpdatingProfile || isCepLoading}
                                />
                              </div>
                            </div>

                            <div>
                              <FormLabel htmlFor="profile-bairro">Bairro</FormLabel>
                              <Input
                                id="profile-bairro"
                                value={addressFields.bairro}
                                onChange={(e) => handleAddressChange('bairro', e.target.value)}
                                placeholder="Seu bairro"
                                disabled={isUpdatingProfile || isCepLoading}
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-2">
                                <FormLabel htmlFor="profile-cidade">Cidade</FormLabel>
                                <Input
                                  id="profile-cidade"
                                  value={addressFields.cidade}
                                  onChange={(e) => handleAddressChange('cidade', e.target.value)}
                                  placeholder="Sua cidade"
                                  disabled={isUpdatingProfile || isCepLoading}
                                />
                              </div>
                              <div>
                                <FormLabel htmlFor="profile-estado">Estado</FormLabel>
                                <Input
                                  id="profile-estado"
                                  value={addressFields.estado}
                                  onChange={(e) => handleAddressChange('estado', e.target.value.toUpperCase())}
                                  placeholder="UF"
                                  maxLength={2}
                                  disabled={isUpdatingProfile || isCepLoading}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <FormField
                        control={profileForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} disabled={isUpdatingProfile} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Altere sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Atual</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Digite sua senha atual"
                                {...field}
                                disabled={isChangingPassword}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                disabled={isChangingPassword}
                              >
                                {showCurrentPassword ? (
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

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Mínimo 8 caracteres"
                                {...field}
                                disabled={isChangingPassword}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                disabled={isChangingPassword}
                              >
                                {showNewPassword ? (
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

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nova Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirme sua nova senha"
                                {...field}
                                disabled={isChangingPassword}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isChangingPassword}
                              >
                                {showConfirmPassword ? (
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

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Alterando...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Alterar Senha
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
