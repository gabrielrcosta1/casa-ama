import { Resend } from 'resend';
import { renderMjml } from './mjml';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Casa D\'Amazonia <noreply@casadamazonia.app.br>';

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY must be set');
}

const resend = new Resend(RESEND_API_KEY);

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (error) {
      console.error('Resend email error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Resend email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Bem-vindo(a) à Casa D\'Amazonia!',
    html: renderMjml('welcome', {
      firstName: firstName || 'cliente',
      baseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5000',
      logoUrl: getLogoUrl(),
      year: new Date().getFullYear(),
    }),
  });
}

export async function sendOrderCreatedEmail(args: {
  email: string;
  customerName?: string;
  orderId: number;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
}): Promise<boolean> {
  return sendEmail({
    to: args.email,
    subject: `Recebemos seu pedido #${args.orderId}`,
    html: renderMjml('order-created', {
      customerName: args.customerName || 'cliente',
      orderId: String(args.orderId),
      items_rows: args.items.map(i => `<tr><td align="left">${escapeHtml(i.name)} × ${i.quantity}</td><td align="right">R$ ${Number(i.price).toFixed(2)}</td></tr>`).join(''),
      total: args.total,
      logoUrl: getLogoUrl(),
      year: new Date().getFullYear(),
    }),
  });
}

export async function sendOrderPaidEmail(args: {
  email: string;
  customerName?: string;
  orderId: number;
}): Promise<boolean> {
  return sendEmail({
    to: args.email,
    subject: `Pagamento confirmado - Pedido #${args.orderId}`,
    html: renderMjml('order-paid', {
      customerName: args.customerName || 'cliente',
      orderId: String(args.orderId),
      baseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5000',
      logoUrl: getLogoUrl(),
      year: new Date().getFullYear(),
    }),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userType: string
): Promise<boolean> {
  const resetUrl = `${process.env.PUBLIC_BASE_URL || (process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000')}/redefinir-senha?token=${resetToken}`;
  const html = renderMjml('password-reset', { userType, resetUrl, logoUrl: getLogoUrl(), year: new Date().getFullYear() });
  return sendEmail({
    to: email,
    subject: 'Redefinição de Senha',
    html,
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLogoUrl(): string {
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:5000';
  // ajuste para sua rota estática de assets; serve como fallback
  return `${base}/assets/logocasaam.svg`;
}
