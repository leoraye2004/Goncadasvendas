// "R$ 49,90". Aceita número ou o Decimal do Prisma (que vira número pelo Number).
export function formatBRL(valor: number | { toString(): string }): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor));
}

// Código curto do pedido para mostrar na tela: "#VOX4CT".
export const orderCode = (id: string) => `#${id.slice(-6).toUpperCase()}`;

// "03/11/2026 12:30", sempre no horário de Brasília.
export function formatDateTime(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })
    .format(data)
    .replace(",", "");
}

export const STATUS_LABEL = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
} as const;
