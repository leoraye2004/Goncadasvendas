# GoncadasVendas

Plataforma web de gestão de vendas para pequenos comércios. Projeto de Portfólio do curso
(Católica SC), avaliado pelo [The Portfolio Playbook](https://github.com/CatolicaSC-Portfolio/The-Portfolio-Playbook).

## O que é

Loja online simples: o cliente se cadastra, navega pelo catálogo, monta o carrinho, cadastra
um endereço e finaliza o pedido. O admin cadastra produtos (com imagens) e acompanha os pedidos.
O escopo completo (casos de uso, requisitos e regras de negócio) está na [Wiki](https://github.com/leoraye2004/Goncadasvendas/wiki)
e na RFC em `docs/`.

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

Pré-requisitos: Node 22 (o mesmo do CI) e Docker.

1. Subir um Postgres local:
   ```bash
   docker run -d --name gv-postgres -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16
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
   As senhas do admin e do cliente de exemplo vêm de `SEED_ADMIN_PASSWORD` e `SEED_CUSTOMER_PASSWORD`;
   se não definir, o seed gera senhas aleatórias e mostra no terminal.
4. (Opcional) Para enviar imagens de produtos localmente, suba o emulador do Azure Blob:
   ```bash
   docker run -d --name gv-azurite -p 10000:10000 mcr.microsoft.com/azure-storage/azurite azurite-blob --blobHost 0.0.0.0 --skipApiVersionCheck
   ```
   No `.env`: `AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"`. O container `product-images` precisa existir
   (em produção ele vem do Terraform). Sem essa variável o app roda normalmente; só o envio de imagem avisa que não está configurado.
5. Rodar o projeto:
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

## Rodando com Docker

Gera a mesma imagem que vai para produção (Next.js em modo `standalone`, usuário não-root).
Ao subir, o container aplica as migrations pendentes e só então inicia o servidor.

```bash
docker build -t goncadasvendas:local .
```

```bash
docker run -p 3000:3000 --add-host=host.docker.internal:host-gateway \
  -e DATABASE_URL="postgresql://postgres:dev@host.docker.internal:5432/postgres?schema=public" \
  -e NEXTAUTH_SECRET="qualquer-string-aleatoria" -e NEXTAUTH_URL="http://localhost:3000" \
  goncadasvendas:local
```

- `GET /api/health` mostra o estado do app e do banco: **200** quando está tudo de pé, **503** quando o banco não responde.
- `APPLICATIONINSIGHTS_CONNECTION_STRING` (opcional) liga o monitoramento no Application Insights. Sem ela, o app roda normalmente.

## CI/CD e deploy

Todo PR roda lint, testes, SonarCloud e o build da imagem Docker. A `main` é protegida: só recebe merge com PR e CI verde.
A cada merge na `main`, o GitHub Actions publica a imagem no GHCR e faz o deploy no Azure Container Apps
(login por OIDC, sem senha guardada), conferindo `/api/health` no fim. A infraestrutura está em `infra/` (Terraform);
o passo a passo está em [`infra/README.md`](infra/README.md).

## Links

- [Wiki](https://github.com/leoraye2004/Goncadasvendas/wiki): requisitos, user stories, arquitetura, deploy, testes e decisões.
- [Aplicação em produção](https://ca-goncadasvendas.wittybeach-f7ea4300.brazilsouth.azurecontainerapps.io) (a primeira visita pode demorar alguns segundos: o app dorme sem tráfego).
- [Qualidade no SonarCloud](https://sonarcloud.io/project/overview?id=leoraye2004_Goncadasvendas).
