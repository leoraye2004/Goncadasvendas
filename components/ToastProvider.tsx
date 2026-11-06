"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Tipo = "success" | "error";
type Aviso = { id: number; tipo: Tipo; mensagem: string };
type Avisos = { success: (mensagem: string) => void; error: (mensagem: string) => void };

// Sem o provider (testes, páginas isoladas) os avisos simplesmente não aparecem: nada quebra.
const ToastContext = createContext<Avisos>({ success: () => {}, error: () => {} });

export const useToast = () => useContext(ToastContext);

// Erro fica mais tempo na tela que sucesso, para dar tempo de ler.
const DURACAO = { success: 4000, error: 6000 } as const;
let proximoId = 0;

// Avisos rápidos (toasts) no canto da tela. Fica no layout raiz, então o aviso continua visível mesmo quando
// a ação troca de página (ex.: confirmar pedido).
export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const fechar = useCallback((id: number) => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), []);

  const mostrar = useCallback(
    (tipo: Tipo, mensagem: string) => {
      const id = ++proximoId;
      setAvisos((atuais) => [...atuais, { id, tipo, mensagem }]);
      setTimeout(() => fechar(id), DURACAO[tipo]);
    },
    [fechar],
  );

  const api = useMemo<Avisos>(
    () => ({ success: (m) => mostrar("success", m), error: (m) => mostrar("error", m) }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role={aviso.tipo === "error" ? "alert" : "status"}
            className={`${aviso.tipo === "error" ? "form-error" : "form-success"} pointer-events-auto flex w-full max-w-sm items-start gap-3 shadow-lg`}
          >
            <span className="flex-1">{aviso.mensagem}</span>
            <button type="button" onClick={() => fechar(aviso.id)} aria-label="Fechar aviso" className="font-bold leading-none">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
