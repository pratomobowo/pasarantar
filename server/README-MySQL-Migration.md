# MySQL Migration Instructions

This document provides instructions for migrating the PasarAntar application from SQLite to MySQL.

## Prerequisites

1. MySQL server installed and running
2. MySQL credentials provided in .env file

## Migration Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

This will install the required MySQL drivers:
- mysql2
- dotenv
- @types/mysql (in shared package)

### 2. Create the Database

Run the database creation script:

```bash
node create-mysql-database.js
```

This will create the `pasarantar` database if it doesn't already exist.

### 3. Test the Connection

Run the connection test script:

```bash
node test-mysql-connection.js
```

This will verify that the application can connect to the MySQL database.

### 4. Start the Server

```bash
npm run dev
```

The server will automatically:
- Connect to MySQL
- Create all necessary tables
- Seed the database with sample data

## Environment Variables

Make sure your .env file contains the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Sr1d3v1@#14
DB_NAME=pasarantar

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production
```

## Troubleshooting

### Connection Issues

1. Verify MySQL server is running
2. Check credentials in .env file
3. Ensure the database user has necessary permissions
4. Verify the database exists

### Table Creation Issues

1. Check if the database user has CREATE TABLE permissions
2. Verify the database exists
3. Check for any syntax errors in the table creation SQL

### Data Issues

1. If you need to migrate data from SQLite, you can export it and import it into MySQL
2. The application will seed with sample data if the tables are empty

## Notes

- The migration is designed to be backward compatible with the existing application
- All database queries have been updated to work with MySQL
- The simplified product forms will work with MySQL backend
- The database schema has been updated to use MySQL-compatible data types