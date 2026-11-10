data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_ecr_repository" "svc" {
  for_each     = toset(var.services)
  name         = "${var.project}/${each.key}"
  force_delete = true
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_key_pair" "key" {
  key_name   = "${var.project}-key"
  public_key = var.public_key
}

resource "aws_security_group" "app" {
  name        = "${var.project}-sg"
  description = "SSH from my IP, HTTP public"
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "ec2" {
  name = "${var.project}-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project}-profile"
  role = aws_iam_role.ec2.name
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.key.key_name
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  root_block_device {
    volume_size = 20
  }
  user_data = <<-USERDATA
    #!/bin/bash
    apt-get update -y
    apt-get install -y ca-certificates curl unzip htop
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
    snap install aws-cli --classic
    mkdir -p /opt/app && chown ubuntu:ubuntu /opt/app
  USERDATA
  tags = {
    Name = "${var.project}-app"
  }
}