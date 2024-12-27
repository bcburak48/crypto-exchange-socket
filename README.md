# Crypto Exchange Socket - TypeScript Project

This project implements a real-time crypto exchange system with order book and trade updates.

## Instructions for Setup and Usage

### Pre-requisites

#### Clone the Repository
```bash
git clone <REPO_URL>
cd crypto-exchange-socket
```

#### Install Dependencies
Ensure you have Node.js (v18 or later) and npm installed. Then, run:
```bash
npm install
```

#### Create `.env` File
Copy the `.env.example` file to create a new `.env` file:
```bash
cp .env.example .env
```
Update the `.env` file as needed (e.g., `JWT_SECRET`, `USE_REDIS`, etc.).

---

## Running the Application Locally

### Start Redis and RabbitMQ
If you have Docker installed, you can start Redis and RabbitMQ easily:
```bash
docker-compose up -d redis rabbitmq
```
This will start:
- Redis on port `6379`
- RabbitMQ on port `5672` and its management UI on port `15672`.

### Run the Application
Start the application locally:
```bash
npm run dev
```
The application will run on [http://localhost:3000](http://localhost:3000).

### Check Logs
Logs are output directly to the terminal.

---

## Running the Application with Docker

### Build the Docker Containers
```bash
docker-compose build
```

### Start All Services
```bash
docker-compose up -d
```
This will start Redis, RabbitMQ, and the application in Docker.

### Access the Application
- **Application**: [http://localhost:3000](http://localhost:3000)
- **RabbitMQ Management UI**: [http://localhost:15672](http://localhost:15672)  
  *(Default username: `guest`, password: `guest`)*

---

## Running Tests

### Locally
Ensure Redis and RabbitMQ are running. If using Docker, start them:
```bash
docker-compose up -d redis rabbitmq
```
Run the tests:
```bash
npm run test
```
This will execute all integration tests and display the results.

### In Docker
Build and start the services if they are not already running:
```bash
docker-compose up -d
```
Run the tests inside the app container:
```bash
docker-compose exec app npm run test
```

---

## Stopping the Services
To stop all services, run:
```bash
docker-compose down
```

---

## Notes
- Ensure you have Docker, Node.js, and npm installed on your machine.
- Use the `.env` file to configure the environment variables (e.g., Redis, RabbitMQ URLs, etc.).
- The tests use Jest, and the test results are displayed in the terminal, including coverage details.

---

Happy coding! 🚀

