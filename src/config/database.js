const Database = require('better-sqlite3');
const { seedVehicles } = require('./seedVehicles.js');

const db = new Database('./vehicles.db');

async function initializeDatabase() {
    try {
        // Enable foreign key support
        db.pragma('foreign_keys = ON');

        // Create vehicles table if it doesn't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                model TEXT NOT NULL,
                mileage INTEGER NOT NULL,
                daily_rental_price INTEGER NOT NULL,
                maintenance_cost_per_kilometer REAL NOT NULL,
                is_available BOOLEAN NOT NULL
            )
        `);

        // Create Booking table if it doesn't exist
        db.exec(`
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
        `);

        // Create Returns table if it doesn't exist
        db.exec(`
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
        `);

        // Create Maintenance table if it doesn't exist
        db.exec(`
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
        `);

        // Create Transactions table if it doesn't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id INTEGER PRIMARY KEY,
                transaction_type TEXT NOT NULL,
                booking_id INTEGER,
                return_id INTEGER,
                customer_name TEXT NOT NULL,
                vehicle_id INTEGER NOT NULL,
                transaction_date DATE NOT NULL,
                rental_duration INTEGER,
                base_revenue REAL NOT NULL,
                cleaning_fee REAL,
                maintenance_cost REAL,
                late_fee REAL,
                total_amount REAL NOT NULL,
                FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE,
                FOREIGN KEY (return_id) REFERENCES returns(return_id)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            )
        `);

        // Check if we need to seed data
        const count = db.prepare("SELECT COUNT(*) as count FROM vehicles").get().count;
        
        if (count < 10) {
            console.log('Seeding database with sample vehicles...');
            
            // Prepare the insert statement
            const stmt = db.prepare(`
                INSERT INTO vehicles (
                    brand, model, mileage, daily_rental_price, 
                    maintenance_cost_per_kilometer, is_available
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);

            // Insert each vehicle
            for (const vehicle of seedVehicles) {
                stmt.run(
                    vehicle.brand,
                    vehicle.model,
                    vehicle.mileage,
                    vehicle.daily_rental_price,
                    vehicle.maintenance_cost_per_kilometer,
                    vehicle.is_available ? 1 : 0
                );
            }

            console.log('Vehicles seeded successfully!');
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
}

// Initialize the database
initializeDatabase().catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
});

function dropTable(tableName) {
    try {
        db.exec(`DROP TABLE IF EXISTS ${tableName};`);
        console.log(`Table ${tableName} dropped successfully!`);
    } catch (err) {
        console.error(`Error dropping table ${tableName}:`, err);
        throw err;
    }
}

function dropAllTables() {
    try {
        db.pragma('foreign_keys = ON');
        const tables = ['transactions', 'maintenance', 'returns', 'booking', 'vehicles'];
        for (const table of tables) {
            dropTable(table);
        }
    } catch (err) {
        console.error('Error dropping all tables:', err);
        throw err;
    }
}

module.exports = {
    db,
    dropTable,
    dropAllTables
}; 