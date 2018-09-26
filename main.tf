//----------------------------------------------------------------
// Variable
variable "basewebsite_env" {}
variable "basewebsite_size" {}

//----------------------------------------------------------------
// Modules
module "basewebsite" {
  source  = "app.terraform.io/jgersonorg1/basewebsite/azurerm"
  version = "1.0"

  azure_region = "centralus"
  env = "${var.basewebsite_env}"
  size = "${var.basewebsite_size}"
}

output "ip_addresses" {
  value = "${module.basewebsite.address}"
}
