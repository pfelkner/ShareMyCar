import sqlite3 from 'sqlite3';
import { seedVehicles } from './seedVehicles.js';

const db = new sqlite3.Database('./vehicles.db');

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
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
}

// Initialize the database
initializeDatabase().catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
});

export default db; 