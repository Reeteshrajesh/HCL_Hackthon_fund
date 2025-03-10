#Fastest and Cheapest Bank Route Finder

## Overview

This project implements a REST API to find the fastest and cheapest routes between banks, considering transaction times and charges. It uses Dijkstra's algorithm for pathfinding. The project reads bank data and inter-bank link data from CSV files, stores it in an in-memory SQLite database, and then loads it into in-memory data structures for efficient processing.

## Features

*   **Fastest Route**: Finds the route with the minimum transfer time between two banks.
*   **Cheapest Route**: Finds the route with the minimum cost (sum of bank charges) between two banks.
*   **In-Memory Database**: Uses SQLite in-memory database for fast data access.
*   **CSV Data Loading**: Reads bank and link data from CSV files.
*   **REST API**: Provides endpoints for route calculation.

## Technologies Used

*   Node.js
*   Express.js
*   csv-parser
*   heap
*   sqlite3

## Installation

1.  **Clone the repository:**

    ```
    git clone [repository-url]
    cd [project-directory]
    ```

2.  **Install dependencies:**

    ```
    npm install
    ```

## CSV Data Format

The project requires two CSV files: `banks.csv` and `links.csv`.

### banks.csv

| Header | Description                            | Data Type | Example    |
| :----- | :------------------------------------- | :-------- | :--------- |
| BIC    | Bank Identifier Code                   | TEXT      | AAAABBCCXXX |
| Charge | Transaction charge for the bank        | REAL      | 2.5        |

### links.csv

| Header            | Description                                   | Data Type | Example    |
| :---------------- | :-------------------------------------------- | :-------- | :--------- |
| FromBIC           | Bank Identifier Code of the sending bank      | TEXT      | AAAABBCCXXX |
| ToBIC             | Bank Identifier Code of the receiving bank     | TEXT      | BBBACCBBXXX |
| TimeTakenInMinutes | Time taken for the transaction in minutes     | INTEGER   | 30         |

## API Endpoints

### 1. Fastest Route

*   **Endpoint:** `/api/fastestroute`
*   **Method:** POST
*   **Request Body:**

    ```
    {
      "fromBank": "AAAABBCCXXX",
      "toBank": "CCCBBDDDEEE"
    }
    ```

*   **Response:**

    ```
    {
      "route": "AAAABBCCXXX -> BBBACCEEFFF -> CCCBBDDDEEE",
      "time": 75
    }
    ```

    *   `route`: The fastest path from `fromBank` to `toBank`.
    *   `time`: The total time in minutes.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid bank BIC
    *   `404 Not Found`: No path found

### 2. Cheapest Route

*   **Endpoint:** `/api/cheapestroute`
*   **Method:** POST
*   **Request Body:**

    ```
    {
      "fromBank": "AAAABBCCXXX",
      "toBank": "CCCBBDDDEEE"
    }
    ```

*   **Response:**

    ```
    {
      "route": "AAAABBCCXXX -> BBBACCEEFFF -> CCCBBDDDEEE",
      "cost": 6.5
    }
    ```

    *   `route`: The cheapest path from `fromBank` to `toBank`.
    *   `cost`: The total cost of the route.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid bank BIC
    *   `404 Not Found`: No path found

## How to Run the Project

1.  **Start the server:**

    ```
    node index.js
    ```

2.  **Access the API:**

    Use tools like `curl` or Postman to send POST requests to the API endpoints.

## Project Structure



├── banks.csv # CSV file containing bank data (BIC, Charge)
├── links.csv # CSV file containing link data (FromBIC, ToBIC, TimeTakenInMinutes)
├── index.js # Main application file
├── package.json # Node.js project configuration file
└── package-lock.json # Records the exact versions of dependencies


## Logic of `index.js`

1.  **Dependencies**: Load required modules (express, fs, csv-parser, heap, sqlite3).
2.  **Data Initialization**:
    *   Create an in-memory SQLite database.
    *   Load data from `banks.csv` and `links.csv` into the database.
    *   Load data from the database into in-memory data structures (`banks` object and `graph` adjacency list).
3.  **Pathfinding Algorithms**: Implement Dijkstra's algorithm for:
    *   `dijkstraFastest`: Find the fastest route.
    *   `dijkstraCheapest`: Find the cheapest route.
4.  **API Endpoints**:
    *   `/api/fastestroute`: Returns the fastest route between two banks.
    *   `/api/cheapestroute`: Returns the cheapest route between two banks.
5.  **Server Start**: Start the Express server on port 3000.

