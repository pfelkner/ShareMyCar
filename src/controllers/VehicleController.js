import db from '../config/database.js';
import Vehicle from '../models/Vehicle.js';
import { validateVehicle, ValidationError } from '../utils/validators.js';

class VehicleController {

    // Show all vehicles in a table
    static async viewAllVehicles() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM vehicles', (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const vehicles = rows.map(row => Vehicle.fromDB(row));
                console.table(vehicles);
                resolve();
            });
        });
    }

    // Add a vehicle to the database
    static async addVehicle(vehicleData) {
        try {
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
                        console.log('Vehicle added successfully! 🚗');
                        resolve();
                    }
                );
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('Validation error:', error.message);
            } else {
                console.error('Error adding vehicle:', error);
            }
            throw error;
        }
    }

    // Set the availability of a vehicle
    static async setAvailability(vehicleId, isAvailable) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE vehicles SET is_available = ? WHERE id = ?', [isAvailable ? 1 : 0, vehicleId], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`Vehicle ${vehicleId} availability updated successfully! 🚗 ${isAvailable ? 'available ✅' : 'unavailable ❌'}`);
                resolve();
            });
        });
    }

    // Get a vehicle by ID
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

    // Book a vehicle
    static async bookVehicle(answers) {
        const { customerName, vehicleId, rentalDuration, estimatedKilometers } = answers;
        
        return new Promise((resolve, reject) => {
            // First, get the vehicle information
            db.get('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, vehicle) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (!vehicle) {
                    reject(new Error('Vehicle not found'));
                    return;
                }

                if (!vehicle.is_available) {
                    reject(new Error('Vehicle is not available'));
                    return;
                }

                // Calculate dates
                const startDate = new Date();
                const dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + rentalDuration);

                // Calculate estimated cost
                const rentalCost = vehicle.daily_rental_price * rentalDuration;
                const maintenanceCost = vehicle.maintenance_cost_per_kilometer * estimatedKilometers;
                const estimatedCost = rentalCost + maintenanceCost;

                // Format dates for SQLite
                const formattedStartDate = startDate.toISOString().split('T')[0];
                const formattedDueDate = dueDate.toISOString().split('T')[0];

                // Start a transaction
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');

                    // Insert booking record
                    db.run(
                        'INSERT INTO booking (customer_name, vehicle_id, start_date, due_date, est_days, est_km, est_cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [customerName, vehicleId, formattedStartDate, formattedDueDate, rentalDuration, estimatedKilometers, estimatedCost],
                        function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            // Update vehicle availability
                            db.run('UPDATE vehicles SET is_available = 0 WHERE id = ?', [vehicleId], function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }

                                db.run('COMMIT');
                                console.log(`
                                    Booking confirmed! 🎉
                                    Vehicle: ${vehicle.brand} ${vehicle.model}
                                    Customer: ${customerName}
                                    Duration: ${rentalDuration} days
                                    Estimated kilometers: ${estimatedKilometers}
                                    Start date: ${formattedStartDate}
                                    Due date: ${formattedDueDate}
                                    Estimated cost: $${estimatedCost.toFixed(2)}
                                    `);
                                resolve();
                            });
                        }
                    );
                });
            });
        });
    }
}

export default VehicleController; 