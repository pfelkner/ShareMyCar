import sqlite3 from 'sqlite3';
import { seedVehicles } from './seedVehicles.js';

const db = new sqlite3.Database('./vehicles.db');

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Enable foreign key support
            db.run('PRAGMA foreign_keys = ON;', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
            });

            // Create vehicles table if it doesn't exist
            db.run(`
                CREATE TABLE IF NOT EXISTS vehicles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    brand TEXT NOT NULL,
                    model TEXT NOT NULL,
                    mileage INTEGER NOT NULL,
                    daily_rental_price INTEGER NOT NULL,
                    maintenance_cost_per_kilometer REAL NOT NULL,
                    is_available BOOLEAN NOT NULL
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Create Booking table if it doesn't exist
                db.run(`
                    CREATE TABLE IF NOT EXISTS booking (
                        booking_id      INTEGER PRIMARY KEY,
                        customer_name   TEXT       NOT NULL,
                        vehicle_id      INTEGER    NOT NULL,
                        start_date      DATE       NOT NULL,
                        due_date        DATE       NOT NULL,
                        est_days        INTEGER    NOT NULL,
                        est_km          INTEGER    NOT NULL,
                        est_cost        REAL NOT NULL,
                        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
                            ON DELETE RESTRICT
                            ON UPDATE CASCADE
                    )
                `, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Create Returns table if it doesn't exist
                    db.run(`
                        CREATE TABLE IF NOT EXISTS returns (
                            return_id         INTEGER PRIMARY KEY,
                            booking_id        INTEGER NOT NULL,
                            actual_km         INTEGER NOT NULL,
                            return_date       DATE NOT NULL,
                            days_late         INTEGER NOT NULL,
                            late_fee          REAL NOT NULL,
                            cleaning_fee      REAL NOT NULL,
                            maintenance_cost  REAL NOT NULL,
                            total_cost        REAL NOT NULL,
                            FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
                                ON DELETE RESTRICT
                                ON UPDATE CASCADE
                        )
                    `, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        // Create Maintenance table if it doesn't exist
                        db.run(`
                            CREATE TABLE IF NOT EXISTS maintenance (
                                maintenance_id  INTEGER PRIMARY KEY,
                                vehicle_id      INTEGER NOT NULL,
                                maintenance_date DATE NOT NULL,
                                mileage         INTEGER NOT NULL,
                                cost            REAL NOT NULL,
                                description     TEXT NOT NULL,
                                is_completed    BOOLEAN NOT NULL DEFAULT 0,
                                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
                                    ON DELETE RESTRICT
                                    ON UPDATE CASCADE
                            )
                        `, (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            // Check if we need to seed data
                            db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                if (row.count < 10) {
                                    console.log('Seeding database with sample vehicles...');
                                    
                                    // Prepare the insert statement
                                    const stmt = db.prepare(`
                                        INSERT INTO vehicles (
                                            brand, model, mileage, daily_rental_price, 
                                            maintenance_cost_per_kilometer, is_available
                                        ) VALUES (?, ?, ?, ?, ?, ?)
                                    `);

                                    // Insert each vehicle
                                    seedVehicles.forEach(vehicle => {
                                        stmt.run(
                                            vehicle.brand,
                                            vehicle.model,
                                            vehicle.mileage,
                                            vehicle.daily_rental_price,
                                            vehicle.maintenance_cost_per_kilometer,
                                            vehicle.is_available ? 1 : 0
                                        );
                                    });

                                    stmt.finalize();
                                    console.log('Database seeded successfully! 🚗');
                                }

                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });
}

// Initialize the database
initializeDatabase().catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
});

export default db;

// Function to drop a table safely
export function dropTable(tableName) {
    return new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${tableName};`, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Table ${tableName} dropped successfully! 🗑️`);
            resolve();
        });
    });
}

// TODO remove drop methods when done as they are only needed for dev purposes
// Function to drop all tables in the correct order
export function dropAllTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Enable foreign key support
            db.run('PRAGMA foreign_keys = ON;', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
            });

            // Drop tables in the correct order (child tables first)
            db.run('DROP TABLE IF EXISTS booking;', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Table booking dropped successfully! 🗑️');

                db.run('DROP TABLE IF EXISTS vehicles;', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log('Table vehicles dropped successfully! 🗑️');
                    resolve();
                });
            });
        });
    });
} 