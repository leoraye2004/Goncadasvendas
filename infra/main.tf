locals {
  projeto = "goncadasvendas"

  tags = {
    projeto = local.projeto
    gerido  = "terraform"
  }
}

# Sufixo aleatório só para os nomes que precisam ser únicos no mundo todo (Postgres e Storage).
resource "random_string" "sufixo" {
  length  = 5
  upper   = false
  special = false
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.projeto}"
  location = var.location
  tags     = local.tags
}
