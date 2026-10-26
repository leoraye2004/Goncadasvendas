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

- `az login` e confira a assinatura: `az account show` (precisa ser *Azure for Students*).
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
- **Provedores:** esta assinatura vem com os provedores desligados; o Terraform registra os cinco necessários
  (`Microsoft.App`, `DBforPostgreSQL`, `Insights`, `OperationalInsights`, `Storage`). É de graça.
- Verificações sem tocar na Azure: `terraform fmt -check` e `terraform validate`.
