pipeline {
    agent any
    stages {
        stage('Pull latest') {
            steps {
                echo 'Pull latest'
            }
        }
        stage('Build and deploy Docker container') {
            steps {
                echo 'Building docker'
            }
        }
        stage('Cleanup') {
            steps {
                echo 'Last Stage complete'
            }
        }
        stage('Test app') {
            steps {
                echo 'App tested'
            }
        }
    }
}
