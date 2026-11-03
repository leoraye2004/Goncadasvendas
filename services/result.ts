export type Failure = { ok: false; code: "UNAUTHENTICATED" | "INVALID" | "NOT_FOUND"; message: string };
export type Result<T> = { ok: true; data: T } | Failure;

export const falha = (code: Failure["code"], message: string): Failure => ({ ok: false, code, message });

// Respostas que se repetem nos services de quem precisa estar logado (RN01).
export const SEM_LOGIN = falha("UNAUTHENTICATED", "Faça login para continuar");
export const OK = { ok: true, data: undefined } as const;
