# Cria a Storage Account que guarda o state do Terraform. Roda UMA vez, antes do primeiro terraform init.
#
# ATENÇÃO: este script CRIA recursos no Azure (um resource group e uma Storage Account Standard LRS,
# que estão na lista de custo zero do CLAUDE.md). Só rode depois de conferir a assinatura abaixo.
#
#   az login
#   az account show        # confira se é "Azure for Students"
#   ./infra/bootstrap-state.ps1
param(
    [string]$Location = "brazilsouth"
)

$ErrorActionPreference = "Stop"

# Região permitida pela política da assinatura (eastus, por exemplo, NÃO é).
$permitidas = @("brazilsouth", "italynorth", "chilecentral", "belgiumcentral", "northcentralus")
if ($Location -notin $permitidas) { throw "Região '$Location' não é permitida. Use: $($permitidas -join ', ')" }

$assinatura = az account show --query "{nome:name, id:id}" -o json | ConvertFrom-Json
Write-Host "Assinatura: $($assinatura.nome) ($($assinatura.id))"
if ($assinatura.nome -ne "Azure for Students") { throw "A assinatura ativa não é 'Azure for Students'. Rode: az account set --subscription <id>" }

$rg = "rg-goncadasvendas-tfstate"
$sufixo = -join ((97..122) + (48..57) | Get-Random -Count 5 | ForEach-Object { [char]$_ })
$conta = "stgvtfstate$sufixo"

# O provedor de Storage vem desligado nesta assinatura; sem ele não dá para criar a conta.
az provider register -n Microsoft.Storage --wait | Out-Null

az group create -n $rg -l $Location --tags projeto=goncadasvendas gerido=bootstrap | Out-Null

az storage account create -n $conta -g $rg -l $Location `
    --sku Standard_LRS --kind StorageV2 --min-tls-version TLS1_2 `
    --allow-blob-public-access false --https-only true | Out-Null

# Usa a chave da conta (e não o login) porque quem é "Owner" não tem acesso aos dados do blob por padrão.
$chave = az storage account keys list -n $conta -g $rg --query "[0].value" -o tsv
az storage container create -n tfstate --account-name $conta --account-key $chave | Out-Null

$backend = @"
resource_group_name  = "$rg"
storage_account_name = "$conta"
container_name       = "tfstate"
key                  = "goncadasvendas.tfstate"
"@
Set-Content -Path (Join-Path $PSScriptRoot "backend.hcl") -Value $backend -Encoding utf8

Write-Host ""
Write-Host "Pronto. Criei infra/backend.hcl (ignorado pelo git) com:"
Write-Host $backend
Write-Host "Próximo passo: cd infra; terraform init -backend-config=backend.hcl"
