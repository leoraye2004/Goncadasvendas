# Exatamente 1 servidor PostgreSQL, no SKU gratuito (750 h/mês por 12 meses). Sem alta disponibilidade.

# Sem caracteres especiais: a senha entra direto na DATABASE_URL e não precisa ser "escapada".
resource "random_password" "postgres" {
  length  = 32
  special = false
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-${local.projeto}-${random_string.sufixo.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  version                = "16"
  sku_name               = "B_Standard_B1ms"
  storage_mb             = 32768
  backup_retention_days  = 7
  administrator_login    = var.postgres_admin_user
  administrator_password = random_password.postgres.result

  geo_redundant_backup_enabled  = false
  public_network_access_enabled = true

  tags = local.tags

  lifecycle {
    # O Azure escolhe a zona de disponibilidade sozinho; sem isto o Terraform tentaria "corrigir".
    ignore_changes = [zone]
  }
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# 0.0.0.0 é o jeito do Azure de dizer "libere os serviços do Azure" (o Container App entra por aqui).
# Atenção: isso vale para QUALQUER serviço do Azure, não só o nosso. A proteção é a senha longa e o SSL.
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
