import db from '../config/database.js';
import Vehicle from '../models/Vehicle.js';
import { validateVehicle, ValidationError } from '../utils/validators.js';

class VehicleController {

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
}

export default VehicleController; 