// "R$ 49,90". Aceita número ou o Decimal do Prisma (que vira número pelo Number).
export function formatBRL(valor: number | { toString(): string }): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor));
}
