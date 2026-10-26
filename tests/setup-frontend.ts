import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sem "globals", o Testing Library não limpa a tela sozinho entre um teste e outro.
afterEach(() => cleanup());
