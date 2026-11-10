pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds(); timeout(time: 20, unit: 'MINUTES') }
  environment { SERVICES = 'user-service product-service order-service' }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script { env.TAG = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim() }
      }
    }
    stage('Validate config') {
      steps { sh 'docker compose -f docker-compose.yml config -q' }
    }
    stage('Build images') {
      steps { sh 'for s in $SERVICES; do docker build -t msdevops/$s:$TAG services/$s; done' }
    }
    stage('Test') {
      steps { sh 'for s in $SERVICES; do docker run --rm msdevops/$s:$TAG npm test || exit 1; done' }
    }
  }
  post {
    success { echo "Build ${env.TAG} passed" }
    failure { echo "Pipeline failed at ${env.STAGE_NAME}" }
  }
}
