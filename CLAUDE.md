# CLAUDE.md — GoncadasVendas (Portfólio Católica SC, linha Web Apps)

Plataforma web de gestão de vendas para pequenos comércios. Projeto de Portfólio avaliado pelo
**The Portfolio Playbook** (github.com/CatolicaSC-Portfolio/The-Portfolio-Playbook).
**Entrega final: 30/11/2026.** Objetivo: atender 100% dos itens obrigatórios com o menor escopo possível.

## Escopo (fonte: RFC — não inventar funcionalidades além disso)
Casos de uso: UC01 cadastrar usuário · UC02 autenticar · UC03 gerenciar produtos (admin) ·
UC04 navegar catálogo com filtro por categoria · UC05 carrinho · UC06 finalizar pedido ·
UC07 favoritos · UC08 endereços · UC09 administrar usuários · UC10 visualizar pedidos (admin).

Regras de negócio:
- RN01 Carrinho, favoritos e pedido só para usuário autenticado.
- RN02 Carrinho persistido no banco, ligado ao usuário, mantido entre sessões.
- RN03 Produto só aparece no catálogo com preço > 0.
- RN04 Excluir usuário NÃO apaga pedidos (soft delete do usuário).
- RN05 Só role ADMIN acessa /admin.
- RN06 CPF e e-mail únicos.
- Preço do item é congelado no momento do pedido (OrderItem.unitPrice).

FORA DO ESCOPO (não implementar): pagamento, IA, reviews, cupons, notificações, multi-vendedor, API pública.

## 3 fluxos de negócio obrigatórios (testar ponta a ponta)
1. Cadastro → login → perfil.
2. Catálogo → carrinho → endereço → pedido confirmado.
3. Admin: cadastrar produto com imagem → ver pedidos → gerenciar usuários.

## Stack (decidida — não trocar)
- Next.js 16 (App Router) + TypeScript strict + Tailwind 4
- NextAuth v4 (Credentials, JWT) + bcryptjs
- Prisma + PostgreSQL (Azure Database for PostgreSQL Flexible Server)
- Zod para validação de entrada
- Imagens: Azure Blob Storage (nunca base64 no banco)
- Testes: Vitest + @vitest/coverage-v8; Testing Library + jsdom no frontend
- Observabilidade: Application Insights via @azure/monitor-opentelemetry (instrumentation.ts)
- Container: Docker (Next `output: "standalone"`), imagem publicada no GHCR
- Infra: Terraform (azurerm) em `infra/` → Azure Container Apps
- CI/CD: GitHub Actions · Qualidade: SonarCloud (org `leoraye2004`)

## Arquitetura em camadas (obrigatório respeitar)
```
app/            → páginas e route handlers: FINOS, só recebem input, chamam service, devolvem resposta
components/     → UI reutilizável (frontend)
services/       → regras de negócio (RN01–RN06). Toda lógica fica aqui. Recebe repositories por injeção.
repositories/   → único lugar que usa Prisma
lib/            → prisma client, auth, blob storage, validação (schemas Zod)
tests/          → espelha services/ e components/
infra/          → Terraform
docs/           → RFC e material de apoio
```
Regra: `app/` nunca importa `prisma` direto. `services/` nunca importa `prisma` direto (usa repository).

## Testes e cobertura (reprova se não bater)
- **TDD**: escrever o teste do service ANTES da implementação. Commit do teste pode vir junto.
- Backend (`services/`, `repositories/`, `lib/`): **mínimo 75%** linhas. Frontend (`components/`): **mínimo 25%**.
- Repositories testados com mock do Prisma (vitest-mock-extended); services com repositories mockados.
- `npm run test:backend` e `npm run test:frontend` geram `coverage/*/lcov.info` para o Sonar.
- Nunca baixar thresholds para passar o CI.

## Proibido (reprovação direta)
Vercel, Netlify, Render, Firebase, Supabase, Railway, qualquer BaaS · SQLite/H2 · deploy manual
SSH/FTP · segredos commitados (usar GitHub Secrets / variáveis de ambiente) · Notion/Obsidian para docs.

## Fluxo de trabalho
- Uma issue por vez. Branch `feat/<nº>-<slug>` ou `chore/<nº>-<slug>`. PR com "Closes #<nº>".
- Conventional Commits, commits pequenos (um passo de TDD = um commit é ótimo).
- PR só é mergeado com CI verde e Quality Gate do Sonar aprovado.
- Ao terminar uma issue: atualizar a página correspondente da Wiki do GitHub.
- Não adicionar Co-Authored-By nem "Generated with Claude Code" em commits e PRs.

## Autoria (o Leo vai defender cada linha na prova de autoria)
- Explique em português, no PR e no chat, o que fez e por quê, em linguagem simples.
- Prefira a solução mais simples que funciona. Sem abstrações "para o futuro".
- Não gere arquivos gigantes; máximo ~200 linhas por arquivo.

## Ambiente
- Azure: assinatura "Azure for Students", tenant Católica SC, região `brazilsouth` (fallback `eastus`).
- **CUSTO ZERO (regra dura):** tudo precisa caber nas cotas gratuitas. Antes de criar qualquer recurso, confirme que está na lista abaixo; se não estiver, PARE e pergunte.
  - PostgreSQL Flexible Server: exatamente 1 servidor, SKU `B_Standard_B1ms`, 32 GB de storage, backup 7 dias, sem HA (gratuito 750 h/mês por 12 meses).
  - Container Apps: plano Consumption, min 0 réplicas, max 1, 0,5 vCPU / 1 GiB (dentro da cota mensal gratuita).
  - Storage Account: Standard LRS, só para imagens e state do Terraform (até 5 GB).
  - Application Insights + Log Analytics: retenção 30 dias, cap diário de 0,1 GB.
  - Imagens Docker no GHCR (grátis para repo público). NÃO usar Azure Container Registry.
  - NÃO criar: VMs, App Service pago, Front Door, NAT, IP público dedicado, Key Vault premium, Redis, domínio pago.
- Depois de cada `terraform apply`, rodar `az consumption usage list` ou checar o Cost Management e reportar o custo.
- Windows/PowerShell: em `claude mcp add`, usar `'--'` entre aspas.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
