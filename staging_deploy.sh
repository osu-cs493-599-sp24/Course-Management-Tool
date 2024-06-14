#!/bin/bash

# Variables
PROJECT_ID="cs599-final-426208"
CLUSTER_NAME="my-cluster"
CLUSTER_ZONE="us-central1-a"
IMAGE_NAME="final-project-team-eightteen-nodejs"
GCR_IMAGE="gcr.io/$PROJECT_ID/$IMAGE_NAME"

# # Ensure gcloud is authenticated
# gcloud auth login

# # Set the project
# gcloud config set project $PROJECT_ID

# # Configure Docker to use gcloud as a credential helper
# gcloud auth configure-docker

# Build the Docker image
docker compose build nodejs

# Tag and push the Docker image to Google Container Registry
docker tag nodejs-app $GCR_IMAGE
docker push $GCR_IMAGE

# Create GKE cluster if not already created (uncomment if needed)
# gcloud container clusters create $CLUSTER_NAME --num-nodes=1 --zone=$CLUSTER_ZONE

# Get cluster credentials
gcloud container clusters get-credentials $CLUSTER_NAME --zone $CLUSTER_ZONE

# Create Kubernetes deployment and service files
cat <<EOF > mysql-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  replicas: 1
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:5.7
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "yes"
        - name: MYSQL_DATABASE
          value: "finalproject"
        - name: MYSQL_USER
          value: "finalproject"
        - name: MYSQL_PASSWORD
          value: "hunter2"
        ports:
        - containerPort: 3306
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  type: ClusterIP
  ports:
  - port: 3306
    targetPort: 3306
  selector:
    app: mysql
EOF

cat <<EOF > nodejs-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs
spec:
  selector:
    matchLabels:
      app: nodejs
  replicas: 1
  template:
    metadata:
      labels:
        app: nodejs
    spec:
      containers:
      - name: nodejs
        image: $GCR_IMAGE
        env:
        - name: DB_HOST
          value: "mysql"
        - name: DB_PORT
          value: "3306"
        - name: DB_USER
          value: "finalproject"
        - name: DB_PASSWORD
          value: "hunter2"
        - name: DB_NAME
          value: "finalproject"
        ports:
        - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: nodejs
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: nodejs
EOF

# Apply the Kubernetes configurations
kubectl apply -f mysql-deployment.yml
kubectl apply -f nodejs-deployment.yml

# Wait for the Node.js service to get an external IP
echo "Waiting for the Node.js service to get an external IP..."
while : ; do
  NODEJS_IP=$(kubectl get svc nodejs -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  if [ "$NODEJS_IP" != "" ]; then
    break
  fi
  echo -n "."
  sleep 5
done

# Print the external IP
echo "Node.js service is running at http://$NODEJS_IP/"

# Clean up
rm mysql-deployment.yml nodejs-deployment.yml
