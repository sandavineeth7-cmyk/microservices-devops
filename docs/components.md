# Deployment components

| Component | Details |
| --- | --- |
| user-service | Node.js, port 3001, GET /health, services/user-service/Dockerfile |
| product-service | Node.js, port 3002, GET /health, services/product-service/Dockerfile |
| order-service | Node.js, port 3003, GET /health, calls user and product services via USER_SERVICE_URL and PRODUCT_SERVICE_URL |
| Nginx | Reverse proxy on port 80, routes /api/users, /api/products, /api/orders |
| Docker Compose | Runs the 3 services and Nginx on one network |
| Jenkins | CI/CD pipeline, builds, pushes to ECR and deploys to EC2 |
| Terraform | Creates 1 EC2, 3 ECR repositories, security group, IAM role |
| Amazon ECR | Stores versioned images |
| Prometheus and Grafana | Monitoring and dashboards |
