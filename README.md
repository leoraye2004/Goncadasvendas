# GoncadasVendas

Plataforma web de gestão de vendas para pequenos comércios. Projeto de Portfólio do curso
(Católica SC), avaliado pelo [The Portfolio Playbook](https://github.com/CatolicaSC-Portfolio/The-Portfolio-Playbook).

## O que é

Loja online simples: o cliente se cadastra, navega pelo catálogo, monta o carrinho, cadastra
um endereço e finaliza o pedido. O admin cadastra produtos (com imagens) e acompanha os pedidos.
O escopo completo (casos de uso e regras de negócio) está descrito em `CLAUDE.md`.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript (strict) + Tailwind 4
- [NextAuth](https://next-auth.js.org) v4 (Credentials, JWT) + bcryptjs
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Zod](https://zod.dev) para validação de entrada
- Imagens em Azure Blob Storage
- Testes com [Vitest](https://vitest.dev) (backend) e Testing Library (frontend)
- Observabilidade com Application Insights (`@azure/monitor-opentelemetry`)
- Docker (imagem publicada no GHCR) · Terraform (`infra/`) · Azure Container Apps
- CI/CD no GitHub Actions · Qualidade de código no SonarCloud

## Como rodar localmente

Pré-requisitos: Node 20+, Docker.

1. Subir um Postgres local:
   ```bash
   docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16
   ```
2. Criar um `.env` na raiz com:
   ```bash
   DATABASE_URL="postgresql://postgres:dev@localhost:5432/postgres?schema=public"
   NEXTAUTH_SECRET="qualquer-string-aleatoria"
   NEXTAUTH_URL="http://localhost:3000"
   ```
3. Instalar dependências, migrar o banco e popular dados de exemplo:
   ```bash
   npm install
   npx prisma migrate dev
   npm run seed
   ```
4. Rodar o projeto:
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000).

## Testes

```bash
npm run test:backend   # services/, repositories/, lib/ — cobertura mínima 75%
npm run test:frontend  # components/ — cobertura mínima 25%
npm test               # os dois
```

## Links

- Wiki (requisitos, user stories, arquitetura, decisões): em construção — issue de documentação da Semana 1.
- Deploy em produção: em construção — issues de infraestrutura e CI/CD da Semana 1.
