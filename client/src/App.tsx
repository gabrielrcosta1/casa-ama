import { useEffect, useRef, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { CustomerAuthProvider } from "@/hooks/use-customer-auth";
import { Header } from "@/components/header";
import { ShoppingCart } from "@/components/shopping-cart";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/admin";
import SupplierRegister from "@/pages/supplier-register";
import SupplierLogin from "@/pages/supplier-login";
import SupplierDashboard from "@/pages/supplier-dashboard";
import EsqueciSenha from "@/pages/esqueci-senha";
import RedefinirSenha from "@/pages/redefinir-senha";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Careers from "@/pages/careers";
import Press from "@/pages/press";
import Blog from "@/pages/blog";
import Help from "@/pages/help";
import Returns from "@/pages/returns";
import Shipping from "@/pages/shipping";
import TrackOrder from "@/pages/track-order";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import CookiePolicy from "@/pages/cookie-policy";

function Router() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const prevPathRef = useRef<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Scroll para o topo ao mudar de página (pathname), sem afetar mudanças só de query string
  useEffect(() => {
    const currentPath = location.split("?")[0].split("#")[0];
    if (prevPathRef.current && prevPathRef.current !== currentPath) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    prevPathRef.current = currentPath;
  }, [location]);

  return (
    <>
      <Header onSearch={handleSearch} />
      <Switch>
        <Route path="/" component={() => <Home searchQuery={searchQuery} />} />
        <Route path="/products" component={() => <Home searchQuery={searchQuery} />} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/checkout" component={Checkout} />
        {/* AJUSTE: Rota padronizada para corresponder ao link do botão */}
        <Route path="/checkout-success" component={CheckoutSuccess} />
        <Route path="/admin" component={Admin} />
        <Route path="/supplier/register" component={SupplierRegister} />
        <Route path="/supplier/login" component={SupplierLogin} />
        <Route path="/supplier/dashboard" component={SupplierDashboard} />
        <Route path="/esqueci-senha" component={EsqueciSenha} />
        <Route path="/redefinir-senha" component={RedefinirSenha} />
        <Route path="/profile" component={Profile} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/careers" component={Careers} />
        <Route path="/press" component={Press} />
        <Route path="/blog" component={Blog} />
        <Route path="/help" component={Help} />
        <Route path="/returns" component={Returns} />
        <Route path="/shipping" component={Shipping} />
        <Route path="/track-order" component={TrackOrder} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-use" component={TermsOfUse} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
      <ShoppingCart />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-slate-50">
              <Toaster />
              <Router />
            </div>
          </CartProvider>
        </CustomerAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
