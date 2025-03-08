const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const Heap = require('heap');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'mydatabase',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
});

// In-memory data structures
let banks = {};
let graph = {};

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS banks (
                BIC TEXT PRIMARY KEY,
                Charge REAL
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS links (
                FromBIC TEXT,
                ToBIC TEXT,
                TimeTakenInMinutes INTEGER
            );
        `);
    } catch (error) {
        console.error("Database initialization error:", error);
    }
}

// Load data from CSV files into the database
async function loadDataToDatabase() {
    const banksData = [];
    const linksData = [];

    // Read banks CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream('banks.csv')
            .pipe(csv())
            .on('data', (row) => {
                banksData.push([row.BIC, parseFloat(row.Charge)]);
            })
            .on('end', resolve)
            .on('error', reject);
    });

    // Read links CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream('links.csv')
            .pipe(csv())
            .on('data', (row) => {
                linksData.push([row.FromBIC, row.ToBIC, parseInt(row.TimeTakenInMinutes)]);
            })
            .on('end', resolve)
            .on('error', reject);
    });

    // Insert data into PostgreSQL
    try {
        await pool.query('DELETE FROM banks');
        await pool.query('DELETE FROM links');

        const bankQuery = `INSERT INTO banks (BIC, Charge) VALUES ($1, $2)`;
        for (let bank of banksData) {
            await pool.query(bankQuery, bank);
        }

        const linkQuery = `INSERT INTO links (FromBIC, ToBIC, TimeTakenInMinutes) VALUES ($1, $2, $3)`;
        for (let link of linksData) {
            await pool.query(linkQuery, link);
        }

        console.log("Data successfully loaded into PostgreSQL");
    } catch (error) {
        console.error("Error inserting data:", error);
    }
}

// Load data from database into memory
async function loadDataToMemory() {
    try {
        const banksRes = await pool.query('SELECT * FROM banks');
        banksRes.rows.forEach(row => {
            banks[row.bic] = row.charge;
        });

        const linksRes = await pool.query('SELECT * FROM links');
        linksRes.rows.forEach(row => {
            if (!graph[row.frombic]) graph[row.frombic] = [];
            graph[row.frombic].push({ to: row.tobic, time: row.timetakeninminutes });
        });

        console.log("Data successfully loaded into memory");
    } catch (error) {
        console.error("Error loading data into memory:", error);
    }
}

// Dijkstra's algorithm for fastest path (minimizing time)
function dijkstraFastest(start, end) {
    let distances = {};
    let predecessors = {};
    let pq = new Heap((a, b) => a.distance - b.distance);
    distances[start] = 0;
    pq.push({ node: start, distance: 0 });

    while (!pq.empty()) {
        let current = pq.pop();
        if (current.node === end) break;
        if (current.distance > distances[current.node]) continue;

        for (let neighbor of graph[current.node] || []) {
            let newDist = current.distance + neighbor.time;
            if (newDist < (distances[neighbor.to] || Infinity)) {
                distances[neighbor.to] = newDist;
                predecessors[neighbor.to] = current.node;
                pq.push({ node: neighbor.to, distance: newDist });
            }
        }
    }

    if (!(end in distances)) return null;

    let path = [];
    let current = end;
    while (current !== start) {
        path.push(current);
        current = predecessors[current];
    }
    path.push(start);
    path.reverse();
    return { path, time: distances[end] };
}

// Dijkstra's algorithm for cheapest path (minimizing cost)
function dijkstraCheapest(start, end) {
    let distances = {};
    let predecessors = {};
    let pq = new Heap((a, b) => a.distance - b.distance);
    distances[start] = banks[start];
    pq.push({ node: start, distance: banks[start] });

    while (!pq.empty()) {
        let current = pq.pop();
        if (current.node === end) break;
        if (current.distance > distances[current.node]) continue;

        for (let neighbor of graph[current.node] || []) {
            let newDist = current.distance + banks[neighbor.to];
            if (newDist < (distances[neighbor.to] || Infinity)) {
                distances[neighbor.to] = newDist;
                predecessors[neighbor.to] = current.node;
                pq.push({ node: neighbor.to, distance: newDist });
            }
        }
    }

    if (!(end in distances)) return null;

    let path = [];
    let current = end;
    while (current !== start) {
        path.push(current);
        current = predecessors[current];
    }
    path.push(start);
    path.reverse();
    return { path, cost: distances[end] };
}

// API endpoint for fastest route
app.post('/api/fastestroute', async (req, res) => {
    const { fromBank, toBank } = req.body;
    if (!banks[fromBank] || !banks[toBank]) {
        return res.status(400).json({ error: 'Invalid bank BIC' });
    }
    const result = dijkstraFastest(fromBank, toBank);
    if (!result) {
        return res.status(404).json({ error: 'No path found' });
    }
    res.json({ route: result.path.join(' -> '), time: result.time });
});

// API endpoint for cheapest route
app.post('/api/cheapestroute', async (req, res) => {
    const { fromBank, toBank } = req.body;
    if (!banks[fromBank] || !banks[toBank]) {
        return res.status(400).json({ error: 'Invalid bank BIC' });
    }
    const result = dijkstraCheapest(fromBank, toBank);
    if (!result) {
        return res.status(404).json({ error: 'No path found' });
    }
    res.json({ route: result.path.join(' -> '), cost: result.cost });
});

// Start the server
async function startServer() {
    try {
        await initializeDatabase();
        await loadDataToDatabase();
        await loadDataToMemory();
        app.listen(8000, () => {
            console.log('Server started on port 8000');
        });
    } catch (err) {
        console.error('Error starting server:', err);
    }
}

startServer();
