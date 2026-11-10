# Microservices CI/CD project

Three Node.js microservices (user, product, order) run behind an Nginx reverse proxy with Docker Compose, built and tested by Jenkins, and monitored with Prometheus and Grafana. The AWS parts (Terraform, ECR, EC2) are planned and described below.

## Architecture
GitHub -> Jenkins (build, test) -> Docker images -> Docker Compose (nginx + 3 services) -> Prometheus and Grafana.
Planned on AWS: Terraform creates EC2, ECR repositories, security group and IAM role; Jenkins pushes images to ECR and deploys to EC2.

## Repository structure
- services/ : user-service (3001), product-service (3002), order-service (3003), each with a Dockerfile and /health
- nginx/nginx.conf : routes /api/users, /api/products, /api/orders
- docker-compose.yml : services and Nginx with health checks
- docker-compose.monitoring.yml, monitoring/ : Prometheus, Node Exporter, cAdvisor, Blackbox, Grafana
- Jenkinsfile : Checkout, Validate config, Build images, Test
- docs/ : components, troubleshooting, screenshots
- terraform/ : infrastructure code (pending AWS access)

## Branch workflow
feature/* -> pull request -> develop -> pull request -> main. Jenkins builds every branch that has a Jenkinsfile.

## Image tagging
Images are tagged with the short Git commit SHA, for example msdevops/user-service:<sha>.

## Run locally
docker compose up -d --build
docker compose ps
curl http://localhost/api/users/health
curl http://localhost/api/products/health
curl http://localhost/api/orders/health
curl http://localhost/api/orders/orders/1

## CI/CD
Jenkins runs in Docker on a laptop. A multibranch pipeline polls GitHub every minute and runs: Checkout, Validate config, Build images, Test. ECR push and EC2 deploy stages are added once AWS access is available.

## Monitoring
docker compose -f docker-compose.monitoring.yml up -d
Prometheus http://localhost:9090, Grafana http://localhost:3000. Dashboards: Service availability (probe_success, probe_duration_seconds), Node Exporter Full, cAdvisor.

## Rollback
Redeploy a previous image tag, or git revert the bad commit and push so Jenkins rebuilds.

## Troubleshooting
See docs/troubleshooting.md.

## Security notes
No secrets are committed (.gitignore covers keys, tfstate, tfvars, .env). Monitoring ports are bound to 127.0.0.1.

## Status
Done: GitHub workflow, Docker, Compose, Nginx, Jenkins build and test, monitoring, failure drill.
Pending: Terraform apply, ECR push, EC2 deployment (AWS account reactivation).
