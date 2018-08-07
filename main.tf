module "website" {
  source       = "app.terraform.io/jgersonorg1/basewebsite/azurerm"
  azure_region = "eastus"
  env          = "jeremy"
  size         = "medium"
}

output "ip_addresses" {
  value = "${module.website.address}"
}
