terraform {
  required_version = ">= 1.9"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # O state fica numa Storage Account fora do Terraform (criada por bootstrap-state.ps1).
  # Os dados dela entram no `terraform init -backend-config=backend.hcl` (ver infra/README.md).
  backend "azurerm" {}
}

provider "azurerm" {
  features {}

  subscription_id = var.subscription_id

  # Esta assinatura (Azure for Students) vem com os provedores desligados. O Terraform registra só
  # os que o projeto usa (é de graça e não cria nenhum recurso).
  resource_provider_registrations = "none"
  resource_providers_to_register = [
    "Microsoft.App",
    "Microsoft.DBforPostgreSQL",
    "Microsoft.Insights",
    "Microsoft.OperationalInsights",
    "Microsoft.Storage",
  ]
}
