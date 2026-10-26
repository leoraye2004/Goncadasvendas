# Plano de entrega — GoncadasVendas até 30/11/2026

Instrução para o Claude Code: crie cada item abaixo como **issue no GitHub** (repositório
`leoraye2004/Goncadasvendas`), com o título, a descrição e os critérios de aceite. Crie um
**GitHub Project (Kanban)** "GoncadasVendas — Portfólio" com colunas Backlog / Em andamento /
Em revisão / Concluído e coloque todas as issues em Backlog, com o label da semana (`semana-1` … `semana-5`).
Depois execute **uma issue por vez**, na ordem, seguindo o CLAUDE.md.

---

## Semana 1 (27/10–02/11) — Fundação e deploy

### #1 chore: limpar repositório e enxugar schema para o escopo da RFC
- Mover `NP2_GoncadasVendas_Leonardo.docx` para `docs/`; remover `wadeclub.sql`.
- Reescrever `prisma/schema.prisma` só com: User (name, email único, cpf único, birthDate, passwordHash,
  role ADMIN|CUSTOMER, deletedAt), Product (name, category, brand, price Decimal, active),
  ProductImage (url, productId), CartItem (userId, productId, size, quantity — único por user+product+size),
  Favorite (userId, productId — único), Address (cep, street, number, district, city, state, userId),
  Order (userId, addressSnapshot JSON, total, status PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED, createdAt),
  OrderItem (orderId, productId, size, quantity, unitPrice).
- Apagar migrations antigas e gerar uma `init` nova. Atualizar `prisma/seed.ts` (1 admin, 1 cliente, 8 produtos).
- README próprio em português (o que é, stack, como rodar, link da Wiki e do deploy).
- **Aceite:** `npx prisma migrate dev` e `npm run seed` rodam num Postgres local via Docker
  (`docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16`).

### #2 chore: configurar testes (Vitest) com cobertura separada back/front
- Instalar vitest, @vitest/coverage-v8, vitest-mock-extended, @testing-library/react, jsdom.
- `vitest.backend.config.ts` (include `services/ repositories/ lib/`, threshold 75%, lcov em `coverage/backend`).
- `vitest.frontend.config.ts` (jsdom, include `components/`, threshold 25%, lcov em `coverage/frontend`).
- Scripts: `test:backend`, `test:frontend`, `test` (os dois).
- Criar `lib/validation/user.ts` (Zod) com um teste de exemplo para provar o setup.
- **Aceite:** `npm test` passa e gera os dois `lcov.info`.

### #3 feat: cadastro e autenticação (UC01, UC02, RN06) — TDD
- `repositories/user-repository.ts`, `services/auth-service.ts` (register: valida com Zod, e-mail e CPF únicos,
  hash bcrypt; login usado pelo NextAuth). Testes primeiro.
- Ajustar `lib/auth.ts` para usar o service e ignorar usuários com `deletedAt`.
- Páginas `/cadastro` e `/login` com feedback de erro e loading.
- **Aceite:** testes do service cobrindo sucesso, e-mail duplicado, CPF duplicado, CPF inválido, senha errada.

### #4 chore: Dockerfile e observabilidade
- `next.config.ts` com `output: "standalone"`. Dockerfile multi-stage (deps → build → runner node:20-alpine,
  usuário não-root, `prisma generate` no build, `prisma migrate deploy` no start).
- `instrumentation.ts` com `@azure/monitor-opentelemetry`, ativado só se `APPLICATIONINSIGHTS_CONNECTION_STRING` existir.
- Rota `GET /api/health` retornando status do app e do banco.
- **Aceite:** `docker build` e `docker run` locais funcionam e `/api/health` responde 200.

### #5 chore: infraestrutura Azure com Terraform
- `infra/` com provider azurerm, backend remoto em Storage Account (criar o storage do state via `az` e documentar).
- Recursos: resource group `rg-goncadasvendas`; Log Analytics + Application Insights;
  PostgreSQL Flexible Server **B_Standard_B1ms**, 32 GB, versão 16, firewall liberando serviços Azure;
  Storage Account + container `product-images` (leitura pública de blob);
  Container Apps Environment + Container App (0,5 vCPU / 1 GiB, min 0 / max 1 réplica, ingress externo 3000,
  imagem do GHCR, segredos: DATABASE_URL, NEXTAUTH_SECRET, connection strings).
- Outputs: URL do app, nome do servidor Postgres.
- **Aceite:** `terraform apply` sobe tudo; a URL pública abre `/api/health`.

### #6 chore: pipeline CI/CD no GitHub Actions + SonarCloud
- Importar o repositório no SonarCloud (org `leoraye2004`), criar `sonar-project.properties` apontando os dois lcov
  e excluindo `infra/`, `prisma/migrations/`, `**/*.config.*` da cobertura.
- Login no Azure via **OIDC** (app registration + federated credential para a branch `main`); guardar
  `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `SONAR_TOKEN` nos GitHub Secrets.
- `.github/workflows/ci-cd.yml`:
  - em PR e push: install → lint → `npm test` → SonarCloud scan → `docker build`;
  - só em push na `main`: push da imagem no GHCR (tag = SHA) → `az containerapp update --image` → smoke test em `/api/health`.
- Proteger a `main`: PR obrigatório, CI verde obrigatório.
- **Aceite:** um PR roda o CI completo; o merge na `main` faz o deploy sozinho.

### #7 docs: estrutura da Wiki
- Ativar a Wiki. Páginas: Home, Requisitos (RF/RNF/RN da RFC), User Stories (UC01–UC10 em formato
  "Como … quero … para …"), Arquitetura (C4 níveis 1–3 em Mermaid), Deploy (passo a passo do Terraform e do pipeline),
  Testes e Qualidade (como rodar, links do Sonar), Decisões (ADR-001 PHP→Next.js, ADR-002 Azure Container Apps,
  ADR-003 imagens no Blob).
- **Aceite:** todas as páginas existem, com o conteúdo mínimo preenchido.

---

## Semana 2 (03/11–09/11) — Produtos e catálogo

### #8 feat: CRUD de produtos no admin (UC03, RN03, RF11) — TDD
- `product-repository`, `product-service` (validação, preço > 0, desativar em vez de excluir se houver pedidos).
- Upload de várias imagens para o Blob (`lib/blob-storage.ts`, testado com mock).
- Telas `/admin/produtos` (lista), `/admin/produtos/novo` e `/admin/produtos/[id]`.

### #9 feat: catálogo com filtro por categoria (UC04)
- `/` lista produtos ativos com preço > 0; filtro por categoria via query string; `/produto/[id]` com galeria.
- Componentes `ProductCard`, `CategoryFilter` com testes (frontend).
- Layout responsivo (mobile primeiro — as personas usam celular).

---

## Semana 3 (10/11–16/11) — Fluxo de compra

### #10 feat: carrinho persistido (UC05, RN01, RN02) — TDD
- `cart-service`: adicionar (soma quantidade se já existir), alterar quantidade, remover, limpar, total.
- Tela `/carrinho`; contador no header.

### #11 feat: endereços de entrega (UC08) — TDD
- CRUD em `/minha-conta/enderecos`; busca de CEP opcional via ViaCEP com fallback manual.

### #12 feat: finalizar pedido (UC06) — TDD
- `order-service.checkout`: carrinho não vazio, endereço do usuário, transação Prisma criando Order + OrderItems
  com `unitPrice` congelado e `addressSnapshot`, depois limpa o carrinho.
- Telas `/checkout` e `/minha-conta/pedidos` com confirmação.

---

## Semana 4 (17/11–23/11) — Admin, favoritos e perfil

### #13 feat: favoritos (UC07) — TDD
### #14 feat: admin de usuários (UC09, RN04) — soft delete preservando pedidos — TDD
### #15 feat: admin de pedidos (UC10) — lista, detalhe e alteração de status — TDD
### #16 feat: perfil e troca de senha (RF10) — TDD
### #17 chore: alertas no Application Insights
- Alerta de disponibilidade (ping em `/api/health`) e alerta de erros 5xx; dashboard simples. Documentar na Wiki.

---

## Semana 5 (24/11–30/11) — Fechamento

### #18 test: fechar cobertura (≥75% backend, ≥25% frontend) e zerar bugs/vulnerabilidades do Sonar
### #19 feat: feedbacks de UX (loading, toasts de sucesso/erro, estados vazios, página 404)
### #20 docs: finalizar Wiki, atualizar C4 e Seção 5 da RFC, checklist de entrega
- Checklist: deploy no ar · 3 fluxos funcionando em produção · CI verde · Quality Gate aprovado ·
  cobertura batida · Wiki completa · README com links · sem segredos no repositório.
### #21 docs: registro da validação com o parceiro (demo, feedback, ajustes feitos)
