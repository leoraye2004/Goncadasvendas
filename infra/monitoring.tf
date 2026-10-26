# Logs e monitoramento. Dentro da cota gratuita: retenção de 30 dias e teto de 0,1 GB por dia.

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${local.projeto}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  daily_quota_gb      = 0.1
  tags                = local.tags
}

resource "azurerm_application_insights" "main" {
  name                 = "appi-${local.projeto}"
  location             = azurerm_resource_group.main.location
  resource_group_name  = azurerm_resource_group.main.name
  workspace_id         = azurerm_log_analytics_workspace.main.id
  application_type     = "web"
  retention_in_days    = 30
  daily_data_cap_in_gb = 0.1
  tags                 = local.tags
}
