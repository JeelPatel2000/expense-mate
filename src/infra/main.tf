provider "aws" {
  region = "ap-southeast-2"
}

provider "random" {}

resource "random_pet" "name" {}

resource "aws_instance" "app_server" {
  ami           = "ami-0ed828ae690ef8b35"
  instance_type = "t2.micro"
	user_data = file("./init-script.sh")

  tags = {
    Name = random_pet.name.id
  }
}
