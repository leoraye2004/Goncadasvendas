# Infraestrutura (Terraform → Azure)

Cria na Azure tudo o que o app precisa, **dentro das cotas gratuitas** (regra de custo zero do `CLAUDE.md`).
Assinatura: *Azure for Students* · Região: `brazilsouth`.

> A política da assinatura só permite as regiões `brazilsouth`, `italynorth`, `chilecentral`,
> `belgiumcentral` e `northcentralus`. O `eastus` **não** é permitido (o código recusa).

## O que é criado (13 itens)

| O quê | Detalhe | Arquivo |
| --- | --- | --- |
| Resource group | `rg-goncadasvendas` | `main.tf` |
| Log Analytics + Application Insights | retenção 30 dias, teto de 0,1 GB/dia | `monitoring.tf` |
| PostgreSQL Flexible Server | `B_Standard_B1ms`, 32 GB, versão 16, backup 7 dias, sem HA, banco `goncadasvendas`, firewall liberando serviços do Azure | `database.tf` |
| Storage Account + container `product-images` | Standard LRS, leitura pública só do blob | `storage.tf` |
| Container Apps Environment + Container App | 0,5 vCPU / 1 GiB, de 0 a 1 réplica, porta 3000 pública, segredos no Container App | `app.tf` |
| Senhas e sufixo aleatórios | senha do Postgres, `NEXTAUTH_SECRET`, sufixo dos nomes únicos | `main.tf`, `database.tf`, `app.tf` |

Saídas (`terraform output`): URL do app, nome do servidor Postgres, Storage Account, URL base das imagens.

## Antes de começar

- Entre no Azure **com MFA** (a Católica SC exige para criar recursos) e confira a assinatura:
  ```bash
  az login --tenant "1b8aed44-a7d0-409c-9796-b264594986a0" --scope "https://management.core.windows.net//.default"
  az account show
  ```
  Precisa ser *Azure for Students*. Se aparecer o erro `AADSTS50076`, o `az` mostra um `az login ... --claims-challenge ...`; rode esse comando.
- Registre os provedores (grátis; o Terraform **não** registra sozinho com `resource_provider_registrations = "none"`):
  ```bash
  az provider register --wait -n Microsoft.Insights
  az provider register --wait -n Microsoft.OperationalInsights
  az provider register --wait -n Microsoft.App
  az provider register --wait -n Microsoft.DBforPostgreSQL
  az provider register --wait -n Microsoft.Storage
  ```
- Terraform 1.9 ou superior (`terraform version`).
- **A imagem do app precisa existir no GHCR e estar pública**, senão o Container App não consegue subir:
  ```bash
  docker build -t goncadasvendas:local .
  docker tag goncadasvendas:local ghcr.io/leoraye2004/goncadasvendas:latest
  docker push ghcr.io/leoraye2004/goncadasvendas:latest
  ```
  (precisa de `docker login ghcr.io` com um token com permissão `write:packages`). Depois, em
  GitHub → *Packages* → `goncadasvendas` → *Package settings*, deixe a visibilidade **Public**.
  Quando o pipeline (issue #8) estiver completo, ele faz isso sozinho a cada merge.

## Passo a passo

1. **Criar onde o state fica** (uma vez só; cria um resource group e uma Storage Account Standard LRS):
   ```powershell
   ./infra/bootstrap-state.ps1
   ```
   Ele cria o arquivo `infra/backend.hcl` (ignorado pelo git). O modelo está em `backend.hcl.example`.

2. **Iniciar o Terraform:**
   ```bash
   cd infra
   terraform init -backend-config=backend.hcl
   ```

3. **Ver o que será criado (não cria nada):**
   ```bash
   terraform plan -var "subscription_id=$(az account show --query id -o tsv)"
   ```
   Confira: `Plan: 13 to add, 0 to change, 0 to destroy`.

4. **Criar de verdade:**
   ```bash
   terraform apply -var "subscription_id=$(az account show --query id -o tsv)"
   ```

5. **Conferir:** `curl "$(terraform output -raw app_url)/api/health"` deve responder **200**.
   A primeira visita depois de um tempo parado demora alguns segundos (o app "dorme" com 0 réplicas).

6. **Conferir o custo** depois de cada `apply` (CLAUDE.md): no portal, *Cost Management + Billing*, ou
   `az consumption usage list --top 20`. Deve ficar zerado.

## Como ficou (aplicado em 26/10/2026)

`/api/health` na URL pública respondeu 200 com app e banco no ar. O `apply` rodou em duas etapas por causa do
provedor `Microsoft.Insights` (hoje documentado acima). Os planos salvos (`tfplan`) contêm segredos: apague depois do uso.

## Para apagar tudo

```bash
terraform destroy -var "subscription_id=$(az account show --query id -o tsv)"
```
(O state em `rg-goncadasvendas-tfstate` é separado e continua; apague o resource group dele à mão se quiser.)

## Para saber

- **Segredos:** o state do Terraform guarda a senha do Postgres e o `NEXTAUTH_SECRET`. Por isso ele fica numa
  Storage Account **privada** e nunca no git. Nada de senha vai no código.
- **Firewall do Postgres:** a regra `0.0.0.0` libera *qualquer* serviço do Azure (não só o nosso). A proteção é a
  senha longa e o SSL obrigatório (`sslmode=require`).
- **Plano gratuito do Postgres:** vale por 12 meses. Depois disso o servidor passa a ser cobrado.
- **Imagem do app:** o Terraform ignora trocas na imagem (`ignore_changes`), porque o pipeline publica uma nova a
  cada merge com `az containerapp update --image`.
- **Provedores:** esta assinatura vem com os provedores desligados. Registre os cinco (comandos acima) antes do `apply`;
  sem `Microsoft.Insights` o `apply` para no Application Insights. É de graça.
- Verificações sem tocar na Azure: `terraform fmt -check` e `terraform validate`.
