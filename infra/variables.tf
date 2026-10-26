variable "subscription_id" {
  description = "ID da assinatura Azure (Azure for Students). Pegue com: az account show --query id -o tsv"
  type        = string
}

variable "location" {
  description = "Região do Azure. A assinatura só permite estas (política 'Allowed resource deployment regions')."
  type        = string
  default     = "brazilsouth"

  validation {
    condition     = contains(["brazilsouth", "italynorth", "chilecentral", "belgiumcentral", "northcentralus"], var.location)
    error_message = "Esta assinatura só permite: brazilsouth, italynorth, chilecentral, belgiumcentral ou northcentralus (eastus NÃO é permitido)."
  }
}

variable "container_image" {
  description = "Imagem do app. O pipeline (issue #8) troca por `az containerapp update --image`; o Terraform ignora essa troca."
  type        = string
  default     = "ghcr.io/leoraye2004/goncadasvendas:latest"
}

variable "postgres_admin_user" {
  description = "Usuário administrador do Postgres (a senha é gerada pelo Terraform)."
  type        = string
  default     = "gv_admin"
}

variable "database_name" {
  description = "Nome do banco de dados da aplicação."
  type        = string
  default     = "goncadasvendas"
}
