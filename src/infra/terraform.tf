terraform {
  backend "remote" {
    organization = "expense-mate"
    workspaces {
      name = "expense-mate"
    }
  }
  required_providers {
    random = {
      source = "hashicorp/random"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}