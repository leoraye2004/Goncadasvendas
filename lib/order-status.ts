export type OrderStatusName = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// Para onde um pedido pode ir a partir de cada status. Cancelar só até o envio; Entregue e Cancelado são finais.
// O service usa isto para recusar, e a tela, para mostrar só as opções válidas.
export const NEXT_STATUS: Record<OrderStatusName, OrderStatusName[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
