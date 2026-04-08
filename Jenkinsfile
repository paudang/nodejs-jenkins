pipeline {
    agent any

    environment {
        CI = 'true'
        DOCKER_BUILDKIT = '0'
        WAIT_ON_HOST = 'host.docker.internal'
    }

    tools {
        nodejs 'nodejs'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                // Use npm ci for clean install if package-lock.json exists, else npm install
                sh 'if [ -f package-lock.json ]; then npm ci; else npm install; fi'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Unit Test') {
            steps {
                sh 'npm run test:coverage -- --maxWorkers=2'
            }
        }

        stage('E2E Test') {
            steps {
                sh 'npm run test:e2e'
            }
        }


        // stage('Docker Build & Push') {
        //     steps {
        //         script {
        //             docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
        //                 def appImage = docker.build("my-image:${env.BUILD_ID}")
        //                 appImage.push()
        //                 appImage.push("latest")
        //             }
        //         }
        //     }
        // }

        // stage('Deploy to Staging') {
        //     steps {
        //         sh './scripts/deploy.sh staging'
        //     }
        // }
    }

    post {
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}
