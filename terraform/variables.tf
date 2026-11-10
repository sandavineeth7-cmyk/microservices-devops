variable "region" {
  default = "ap-south-1"
}

variable "project" {
  default = "msdevops"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "my_ip_cidr" {
  description = "Your public IP, e.g. 1.2.3.4/32"
}

variable "public_key" {
  description = "Contents of your .pub file"
}

variable "services" {
  default = ["user-service", "product-service", "order-service"]
}