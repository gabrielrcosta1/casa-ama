import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    toast({
      title: "Inscrito!",
      description: "Obrigado por se inscrever na nossa newsletter.",
    });
    setEmail("");
  };

  const footerLinks = {
    company: [
      { label: "Sobre Nós", href: "/about" },
      { label: "Contato", href: "/contact" },
      { label: "Carreiras", href: "/careers" },
      { label: "Imprensa", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
    support: [
      { label: "Central de Ajuda", href: "/help" },
      { label: "Devoluções", href: "/returns" },
      { label: "Informações de Envio", href: "/shipping" },
      { label: "Rastrear Pedido", href: "/track-order" },
    ],
    legal: [
      { label: "Política de Privacidade", href: "/privacy-policy" },
      { label: "Termos de Uso", href: "/terms-of-use" },
      { label: "Política de Cookies", href: "/cookie-policy" },
    ],
    suppliers: [
      { label: "Portal do Fornecedor", href: "/supplier/login" },
      { label: "Cadastrar Empresa", href: "/supplier/register" },
      { label: "Área Administrativa", href: "/admin" },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">
          
          <div className="sm:col-span-2 lg:col-span-1">
            {/* MUDANÇA ESTRUTURAL: O logo e o nome agora estão em uma coluna vertical (flex-col) e alinhados à esquerda (items-start). */}
            <Link href="/" className="inline-flex flex-col items-start gap-2 mb-4">
              <Logo className="h-8 w-auto" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wide">
                CASA D'AMAZÔNIA
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Produtos sustentáveis e autênticos da biodiversidade amazônica. Qualidade garantida e respeito à natureza.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Links Rápidos</h4>
            <ul className="space-y-2 text-muted-foreground">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento ao Cliente */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Atendimento</h4>
            <ul className="space-y-2 text-muted-foreground">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fornecedores */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Fornecedores</h4>
            <ul className="space-y-2 text-muted-foreground">
              {footerLinks.suppliers.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold mb-4 text-white">Mantenha-se Atualizado</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Inscreva-se para receber ofertas especiais e atualizações.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background text-foreground rounded-md sm:rounded-r-none focus:ring-2 focus:ring-primary border-border"
                required
              />
              <Button type="submit" className="acai-button rounded-md sm:rounded-l-none">
                Inscrever
              </Button>
            </form>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © {new Date().getFullYear()} CASA D'AMAZÔNIA. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {footerLinks.legal.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}