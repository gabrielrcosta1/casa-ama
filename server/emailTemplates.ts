export function layout(content: string, title = "Casa D'Amazonia"): string {
  return `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; background:#f6f7fb; color:#222; margin:0; padding:0; }
      .container { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
      .card { background:#fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(153,0,149,.08); overflow:hidden; }
      .header { background: linear-gradient(135deg, #990095 0%, #9b86d1 100%); color: #fff; padding: 24px; }
      .content { padding: 24px; }
      .cta { display:inline-block; background:#990095; color:#fff; text-decoration:none; padding:12px 20px; border-radius:8px; }
      .muted { color:#6b7280; font-size: 13px; }
      .hr { height: 1px; background: #eee; margin: 24px 0; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align:left; padding: 8px 0; }
      .price { text-align:right; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1 style="margin:0; font-size:22px;">Casa D'Amazonia</h1>
          <p style="margin:8px 0 0 0; opacity:.95">${title}</p>
        </div>
        <div class="content">
          ${content}
          <div class="hr"></div>
          <p class="muted">Este é um email automático. Em caso de dúvidas, responda este email ou acesse a Central de Ajuda.</p>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

export function welcomeTemplate(firstName: string) {
  const content = `
    <p>Olá, <strong>${firstName || "cliente"}</strong> 👋</p>
    <p>Bem-vindo(a) à Casa D'Amazonia! Sua conta foi criada com sucesso.</p>
    <p>Agora você pode explorar nossos produtos, montar seu carrinho e acompanhar seus pedidos.</p>
    <p><a class="cta" href="${getBaseUrl()}/">Explorar produtos</a></p>
  `;
  return layout(content, "Bem-vindo(a)!");
}

export function orderCreatedTemplate(params: {
  customerName?: string;
  orderId: number;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
}) {
  const rows = params.items
    .map(
      (i) =>
        `<tr><td>${i.name} × ${i.quantity}</td><td class="price">R$ ${Number(i.price).toFixed(2)}</td></tr>`
    )
    .join("");
  const content = `
    <p>Olá, <strong>${params.customerName || "cliente"}</strong>!</p>
    <p>Recebemos seu pedido <strong>#${params.orderId}</strong> e ele está <strong>pendente de pagamento</strong>.</p>
    <table>${rows}</table>
    <div class="hr"></div>
    <p style="text-align:right; font-weight:600;">Total: R$ ${params.total}</p>
    <p class="muted">Assim que o pagamento for confirmado, você receberá um novo email de confirmação.</p>
  `;
  return layout(content, "Pedido criado");
}

export function orderPaidTemplate(params: {
  customerName?: string;
  orderId: number;
}) {
  const content = `
    <p>Olá, <strong>${params.customerName || "cliente"}</strong>!</p>
    <p>Pagamento do seu pedido <strong>#${params.orderId}</strong> confirmado. Em breve você receberá atualizações de envio.</p>
    <p><a class="cta" href="${getBaseUrl()}/track-order?orderId=${params.orderId}">Acompanhar pedido</a></p>
  `;
  return layout(content, "Pagamento confirmado");
}

export function resetPasswordTemplate(params: { userType: string; resetUrl: string }) {
  const content = `
    <p>Você solicitou a redefinição de senha para sua conta (<strong>${params.userType}</strong>).</p>
    <p>Para criar uma nova senha, clique no botão abaixo:</p>
    <p><a class="cta" href="${params.resetUrl}">Redefinir senha</a></p>
    <p class="muted">Se você não solicitou, ignore esta mensagem.</p>
  `;
  return layout(content, "Redefinição de senha");
}

function getBaseUrl(): string {
  return process.env.PUBLIC_BASE_URL
    || (process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000');
}


