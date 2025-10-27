# Country Currency & Exchange Rate API

A RESTful API that fetches country, currency, and exchange rate data from external public APIs, stores them in a local database, and provides CRUD operations.

This project was built using Node.js/Express to demonstrate clean architecture, efficient API data handling, and deployment to Railway.

---

## Features

- Fetch and store all countries and their metadata from [RestCountries API](https://restcountries.com/v2/all)
- Automatically retrieve each country’s currency and exchange rate via [Open Exchange Rate API](https://open.er-api.com)
- Store country details and metadata in a relational database (PostgreSQL)
- Serve countries, currencies, and exchange data via RESTful endpoints
- CRUD operations on countries
- Refresh service to update exchange rates periodically
- Error handling, logging, and modular architecture for scalability

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js |
| **ORM** | Sequelize |
| **Database** | PostgreSQL |
| **External APIs** | RestCountries, Open Exchange Rate |
| **Deployment** | Railway |
| **Language** | JavaScript (ES6) |

---

## Installation & Setup

### Clone the Repository

    git clone https://github.com/adewaleolaore/country-exchange-api.git
    cd country-exchange-api

### Install Dependencies

    npm install

### Set Up Environment Variables

Create a .env file at the project root:

    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=yourpassword
    DB_NAME=country_db
    DB_PORT=5432
    NODE_ENV=development
    PORT=3000

(You can copy from .env.example and fill in your credentials.)

### Initialize Database

Make sure your PostgreSQL service is running, then sync your database tables automatically with:

    npm run dev

Or, if you’re using Sequelize CLI:

    npx sequelize-cli db:migrate

### Start the Server

    Start the Server

Your API should now be running on:

    http://localhost:3000


## API Endpoints

### Countries

| Method   | Endpoint               | Description                                |
| -------- | ---------------------- | ------------------------------------------ |
| `GET`    | `/api/countries`       | Get all countries                          |
| `GET`    | `/api/countries/:name` | Get one country by name (case-insensitive) |
| `POST`   | `/api/countries`       | Create a new country                       |
| `PUT`    | `/api/countries/:id`   | Update an existing country                 |
| `DELETE` | `/api/countries/:id`   | Delete a country                           |

### Refresh
| Method | Endpoint       | Description                                            |
| ------ | -------------- | ------------------------------------------------------ |
| `POST` | `/api/refresh` | Re-fetch all countries and update their exchange rates |


## Database Models

### Country

| Field         | Type           | Description                 |
| ------------- | -------------- | --------------------------- |
| id            | Integer (auto) | Primary key                 |
| name          | String         | Country name                |
| capital       | String         | Capital city                |
| region        | String         | Geographic region           |
| population    | Integer        | Population                  |
| flag          | String         | Image URL of the flag       |
| currency_code | String         | ISO currency code           |
| exchange_rate | Float          | Latest exchange rate to USD |

### Metadata

| Field      | Type           | Description    |
| ---------- | -------------- | -------------- |
| id         | Integer (auto) | Primary key    |
| key_name   | String         | Metadata key   |
| value_text | String         | Metadata value |


## Deployment on Railway

1. Push your code to GitHub:

    git add .
    git commit -m "Initial commit - Country Currency API"
    git push -u origin main


2. Go to https://railway.app

3. Create a new project and connect your GitHub repository.

4. Add environment variables under Settings → Variables:

    DB_HOST
    DB_USER
    DB_PASSWORD
    DB_NAME
    NODE_ENV=production
    PORT=8080

5. (Optional) Add Railway’s built-in PostgreSQL plugin, then connect its credentials.

6. Deploy. Railway will build and start your app automatically.

Your live API URL will look like:

    https://country-exchange-api-prod.up.railway.app
