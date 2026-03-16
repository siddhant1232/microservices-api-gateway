# Microservices Platform

A fully containerized microservices architecture built with Node.js, Express, Redis, PostgreSQL, and MongoDB.

## System Architecture

The platform consists of an API Gateway and three distinct backend microservices, supported by three different types of databases:

1. **API Gateway (Port 3000)**: 
   The entry point for all client requests. It handles JWT authentication validation, Redis-backed rate limiting, and request proxying to the underlying microservices.
   
2. **Auth Service (Port 4001)**: 
   Manages user registration and login. Issues JWT tokens. Connects to the PostgreSQL database for user storage. 
   
3. **User Service (Port 4002)**: 
   Manages user profile data (bio, location). Connects to the PostgreSQL database.
   
4. **Notification Service (Port 4003)**:
   A background worker service that listens to a BullMQ Redis queue for notification jobs (e.g., sending welcome emails) and processes them. Connects to MongoDB to store logs of processed notifications.

### Databases
* **Redis (Port 6379)**: Used by the Gateway for Rate Limiting, and by Auth/Notification services for the BullMQ message queue.
* **PostgreSQL (Port 5432)**: Used by Auth and User services for relational data.
* **MongoDB (Port 27017)**: Used by the Notification service for document-based log storage.

## How Services Communicate

The services in this platform employ two different communication patterns depending on the use case:

1. **Synchronous HTTP Communication (via Gateway)**:
   When a user makes a request, they hit the `api-gateway`. The gateway proxies the HTTP request to the internal Docker network hostnames (e.g., `api-gateway → auth-service:4001`). The underlying services do not expose their ports to the public internet.

2. **Asynchronous Message Queue Communication (Auth → Notification)**:
   To ensure the services remain decoupled and highly available, they do not call each other directly via HTTP. When a user registers in the `auth-service`, it pushes a job to a **BullMQ** queue stored in **Redis**. The `notification-service` runs a worker that independently picks up jobs from this Redis queue and processes them asynchronously.

## How to Run (Docker Compose Instructions)

The entire platform, including all Node.js services and databases, is fully containerized and linked via a custom Docker network.

### Prerequisites
* Docker
* Docker Compose

### Starting the Platform
To build and start the entire architecture, simply run:

```bash
docker-compose up --build -d
```

Docker will sequentially boot the databases, wait for them to pass their health checks, and then boot the microservices.

### Viewing Logs
To see the logs for the entire platform:
```bash
docker-compose logs -f
```

To see logs for a specific service (like verifying the notification queue worker is processing jobs):
```bash
docker-compose logs -f notification-service
```

### Stopping the Platform
To stop the containers:
```bash
docker-compose down
```
