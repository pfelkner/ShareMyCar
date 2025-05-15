import db from '../config/database.js';
import Vehicle from '../models/Vehicle.js';
import { validateVehicle, ValidationError } from '../utils/validators.js';
import ReturnService from '../services/ReturnService.js';

class VehicleController {

    // Show all vehicles in a table
    static async viewAllVehicles() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM vehicles', (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Apply conversion from db vehicle instant to Vehicle obj to all rows from the database
                const vehicles = rows.map(row => Vehicle.fromDB(row));
                console.table(vehicles);
                resolve();
            });
        });
    }

    // Add a vehicle to the database
    // @param vehicleData is an object containing the vehicle details,
    // object has been validated on input and are validated again here
    static async addVehicle(vehicleData) {
        // Validate the vehicle data
        validateVehicle(vehicleData);

        return new Promise((resolve, reject) => {
            db.run('INSERT INTO vehicles (brand, model, mileage, daily_rental_price, maintenance_cost_per_kilometer, is_available) VALUES (?, ?, ?, ?, ?, ?)',
                [vehicleData.brand, vehicleData.model, vehicleData.mileage, vehicleData.daily_rental_price, vehicleData.maintenance_cost_per_kilometer, vehicleData.is_available ? 1 : 0],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log('Vehicle added successfully!');
                    resolve();
                }
            );
        });
    }

    // Set the availability of a vehicle
    // @param vehicleId is numeric and can safely assumed to be non-null & positive
    // @param isAvailable is a boolean and can safely assumed to be non-null & boolean,
    // isAvailable is converted to 1 or 0 for storage in db
    static async setAvailability(vehicleId, isAvailable) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE vehicles SET is_available = ? WHERE id = ?', [isAvailable ? 1 : 0, vehicleId], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`Vehicle ${vehicleId} availability updated successfully! ${isAvailable ? 'available' : 'unavailable'}`);
                resolve();
            });
        });
    }

    // Get a vehicle by ID; This is not used for user interaction but is required for internal operations
    // @param vehicleId is numeric and can safely assumed to be non-null & positive
    static async getVehicleById(vehicleId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? Vehicle.fromDB(row) : null);
            });
        });
    }

    // View maintenance history
    // Displays all maintenance records as table, including vehicle brand and model
    static async viewMaintenanceHistory() {
        return new Promise((resolve, reject) => {
            // Query to get the maintenance history by joining the maintenance and vehicles tables
            db.all(`
                SELECT m.*, v.brand, v.model
                FROM maintenance m
                JOIN vehicles v ON m.vehicle_id = v.id
                ORDER BY m.maintenance_date DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Display the maintenance history as a table
                console.table(rows);
                resolve();
            });
        });
    }
}

export default VehicleController; 