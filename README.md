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

