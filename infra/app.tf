# O app: Container Apps no plano Consumption (0,5 vCPU / 1 GiB, de 0 a 1 réplica).
# Com mínimo 0 o app "dorme" sem tráfego e gasta zero; a primeira visita depois disso demora alguns segundos.

locals {
  app_name = "ca-${local.projeto}"

  # sslmode=require: o Postgres do Azure só aceita conexão com SSL.
  database_url = "postgresql://${var.postgres_admin_user}:${random_password.postgres.result}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.database_name}?schema=public&sslmode=require"
}

resource "random_password" "nextauth_secret" {
  length  = 48
  special = false
}

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${local.projeto}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

resource "azurerm_container_app" "web" {
  name                         = local.app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  # Segredos ficam guardados no Container App e entram no container como variáveis (nunca no código).
  secret {
    name  = "database-url"
    value = local.database_url
  }
  secret {
    name  = "nextauth-secret"
    value = random_password.nextauth_secret.result
  }
  secret {
    name  = "appinsights-connection-string"
    value = azurerm_application_insights.main.connection_string
  }
  secret {
    name  = "storage-connection-string"
    value = azurerm_storage_account.images.primary_connection_string
  }

  ingress {
    external_enabled = true
    target_port      = 3000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 0
    max_replicas = 1

    container {
      name   = "web"
      image  = var.container_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "NEXTAUTH_SECRET"
        secret_name = "nextauth-secret"
      }
      env {
        name  = "NEXTAUTH_URL"
        value = "https://${local.app_name}.${azurerm_container_app_environment.main.default_domain}"
      }
      env {
        name        = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        secret_name = "appinsights-connection-string"
      }
      env {
        name        = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "storage-connection-string"
      }
    }
  }

  lifecycle {
    # O pipeline publica uma imagem nova a cada merge (az containerapp update --image).
    # Sem isto, todo `terraform apply` voltaria o app para a imagem antiga.
    ignore_changes = [template[0].container[0].image]
  }
}
