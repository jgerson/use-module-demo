//--------------------------------------------------------------------
// Variables
variable "basewebsite_env" {}

//--------------------------------------------------------------------
// Modules
module "basewebsite" {
  source  = "app.terraform.io/jgersonorg1/basewebsite/azurerm"
  version = "1.0"

  azure_region = "eastus"
  env = "${var.basewebsite_env}"
  size = "medium"
}

output "ip_addresses" {
  value = "${module.basewebsite.address}"
}
