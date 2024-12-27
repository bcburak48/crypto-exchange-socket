# Crypto Exchange Socket - TypeScript Project

This project implements a real-time crypto exchange system with order book and trade updates. Below are the instructions for setting up the application and running tests locally or in Docker.

Pre-requisites
Clone the Repository

git clone <REPO_URL>
cd crypto-exchange-socket
Install Dependencies
Make sure you have Node.js (v18 or later) and npm installed. Then run:

npm install
Create .env File
Copy the .env.example file to create a new .env file:

cp .env.example .env
Update the .env file as needed (e.g., JWT_SECRET, USE_REDIS, etc.).

Running the Application Locally
Start Redis and RabbitMQ
If you have Docker installed, you can start Redis and RabbitMQ easily:

docker-compose up -d redis rabbitmq
This will start:

Redis on port 6379
RabbitMQ on port 5672 and its management UI on port 15672.
Run the Application
Start the application locally:

npm run dev
The application will run on http://localhost:3000.

Check Logs
Logs are output directly to the terminal.

Running the Application with Docker
Build the Docker Containers

docker-compose build
Start All Services

docker-compose up -d
This will start Redis, RabbitMQ, and the application in Docker.

Access the Application

Application: http://localhost:3000
RabbitMQ Management UI: http://localhost:15672
(Default username: guest, password: guest)
Running Tests
Locally
Ensure Redis and RabbitMQ are running. If using Docker, start them:

docker-compose up -d redis rabbitmq
Run the tests:

npm run test
This will execute all integration tests and display the results.

In Docker
Build and start the services if they are not already running:

docker-compose up -d
Run the tests inside the app container:

docker-compose exec app npm run test
Stopping the Services
To stop all services, run:
docker-compose down

Notes
Ensure you have Docker, Node.js, and npm installed on your machine.
Use .env to configure the environment variables (e.g., Redis, RabbitMQ URLs, etc.).
The tests use Jest, and the test results are displayed in the terminal, including coverage details.
Happy coding! 🚀
