# Imagens dos produtos (nunca em base64 no banco). Standard LRS, dentro da cota gratuita de 5 GB.

resource "azurerm_storage_account" "images" {
  name                     = "st${local.projeto}${random_string.sufixo.result}"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = true

  tags = local.tags
}

# "blob" = qualquer pessoa lê a imagem se souber a URL, mas não consegue listar o conteúdo do container.
resource "azurerm_storage_container" "product_images" {
  name                  = "product-images"
  storage_account_id    = azurerm_storage_account.images.id
  container_access_type = "blob"
}
