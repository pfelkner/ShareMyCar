const { db } = require('../config/database.js');
const Vehicle = require('../models/Vehicle.js');
const { validateVehicle, ValidationError } = require('../utils/validators.js');
const ReturnService = require('../services/ReturnService.js');

class VehicleController {

    // Show all vehicles in a table
    static viewAllVehicles() {
        const rows = db.prepare('SELECT * FROM vehicles').all();
        const vehicles = rows.map(row => Vehicle.fromDB(row));
        console.table(vehicles);
    }

    // Add a vehicle to the database
    // @param vehicleData is an object containing the vehicle details,
    // object has been validated on input and are validated again here
    static addVehicle(vehicleData) {
        validateVehicle(vehicleData);
        db.prepare('INSERT INTO vehicles (brand, model, mileage, daily_rental_price, maintenance_cost_per_kilometer, is_available) VALUES (?, ?, ?, ?, ?, ?)')
            .run(
                vehicleData.brand,
                vehicleData.model,
                vehicleData.mileage,
                vehicleData.daily_rental_price,
                vehicleData.maintenance_cost_per_kilometer,
                vehicleData.is_available ? 1 : 0
            );
        console.log('Vehicle added successfully!');
    }

    // Set the availability of a vehicle
    // @param vehicleId is numeric and can safely assumed to be non-null & positive
    // @param isAvailable is a boolean and can safely assumed to be non-null & boolean,
    // isAvailable is converted to 1 or 0 for storage in db
    static setAvailability(vehicleId, isAvailable) {
        db.prepare('UPDATE vehicles SET is_available = ? WHERE id = ?')
            .run(isAvailable ? 1 : 0, vehicleId);
        console.log(`Vehicle ${vehicleId} availability updated successfully! ${isAvailable ? 'available' : 'unavailable'}`);
    }

    // Get a vehicle by ID; This is not used for user interaction but is required for internal operations
    // @param vehicleId is numeric and can safely assumed to be non-null & positive
    static getVehicleById(vehicleId) {
        const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
        return row ? Vehicle.fromDB(row) : null;
    }

    // View maintenance history
    // Displays all maintenance records as table, including vehicle brand and model
    static viewMaintenanceHistory() {
        const rows = db.prepare(`
            SELECT m.*, v.brand, v.model
            FROM maintenance m
            JOIN vehicles v ON m.vehicle_id = v.id
            ORDER BY m.maintenance_date DESC
        `).all();
        console.table(rows);
    }
}

module.exports = VehicleController; 