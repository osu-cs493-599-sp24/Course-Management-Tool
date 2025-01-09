# Tarpaulin API

Tarpaulin is a course management tool that involves developing a complete RESTful API for Tarpaulin, allowing users (instructors and students) to manage courses, assignments, and submissions.
## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## Project Overview

The Tarpaulin API supports various operations for managing courses, assignments, and submissions. The API is designed to be modular and scalable, using modern development practices such as containerization and cloud deployment.

## Features

- User authentication and authorization (Admin, Instructor, Student roles)
- CRUD operations for courses, assignments, and submissions
- File upload and download for assignment submissions
- Course roster download in CSV format
- Pagination for large datasets
- Rate limiting to prevent abuse
- Docker containerization for all services

## Technologies Used

- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MySQL**: Relational database management system
- **Redis**: In-memory data structure store for caching
- **RabbitMQ**: Message broker for asynchronous task handling
- **AWS S3**: Object storage service for file uploads
- **JWT**: JSON Web Tokens for authentication
- **Docker**: Containerization platform
- **Google Cloud Platform**: Cloud hosting and deployment

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- Docker
- Google Cloud account

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/osu-cs493-599-sp24/final-project-team-3.git
   cd Course-Management-Tool
   ```

2. Install dependencies:
   ```sh
   npm install
   ```



## Running the Application
```sh
./Run.sh
```

The API should now be running at `http://localhost:3000`.



## API Endpoints

The API endpoints are defined in the OpenAPI specification (openapi.yaml) and can be viewed in the Swagger editor (https://editor.swagger.io). Below are some key endpoints:

- **User Authentication**
  - `POST /users/initial`
  - `POST /users/login`
  - `GET /users/{id}`

- **Courses**
  - `GET /courses`
  - `GET /courses/{id}`
  - `POST /courses`
  - `PATCH /courses/{id}`
  - `DELETE /courses/{id}`
  - `GET /courses/{id}/roster`
  - `GET /courses/{id}/students`
  - `POST /courses/{id}/students`
  - `GET /courses/{id}/assignments`

- **Assignments**
  - `GET /assignments/{id}`
  - `POST /assignments`
  - `PATCH /assignments/{id}`
  - `DELETE /assignments/{id}`
  - `GET /assignments/{id}/submissions`
  - `POST /assignments/{id}/submissions`

- **Submissions**
  - `PATCH /submissions/{id}`
  - `GET /media/submissions/{filename}`

## Deployment

### Google Cloud Platform

 Deployment has been streamlined using the GCP codebuild pipeline. The pipeline will run on each new push

 On each successful push, the pipeline will build a new docker image and it will push the image to GCR. Later, the image will be deployed on Kubernetes cluster which is hosted on GKE. 

 

