output "app_url" {
  description = "Endereço público do app. Teste abrindo <app_url>/api/health"
  value       = "https://${azurerm_container_app.web.ingress[0].fqdn}"
}

output "postgres_server_name" {
  description = "Nome do servidor PostgreSQL."
  value       = azurerm_postgresql_flexible_server.main.name
}

output "postgres_fqdn" {
  description = "Endereço do servidor PostgreSQL."
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "storage_account_name" {
  description = "Storage Account das imagens dos produtos."
  value       = azurerm_storage_account.images.name
}

output "product_images_base_url" {
  description = "Endereço base público das imagens (container product-images)."
  value       = "${azurerm_storage_account.images.primary_blob_endpoint}${azurerm_storage_container.product_images.name}"
}

output "container_app_name" {
  description = "Nome do Container App (usado pelo pipeline em az containerapp update)."
  value       = azurerm_container_app.web.name
}

output "resource_group_name" {
  description = "Resource group onde está tudo."
  value       = azurerm_resource_group.main.name
}
