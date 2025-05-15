import db from '../config/database.js';

class MaintenanceService {
    // Check if vehicle needs maintenance
    // @param vehicleId is the ID of the vehicle to check
    // @param newMileage is the updated mileage of the vehicle
    static async checkMaintenance(vehicleId, newMileage) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, vehicle) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!vehicle) {
                    reject(new Error('Vehicle not found'));
                    return;
                }

                // Check if mileage exceeds threshold (10,000 km)
                const maintenanceThreshold = 10000;
                const lastMaintenanceMileage = vehicle.mileage - (vehicle.mileage % maintenanceThreshold);
                const needsMaintenance = newMileage >= lastMaintenanceMileage + maintenanceThreshold;

                if (needsMaintenance) {
                    // Calculate maintenance cost
                    const kilometersSinceLastMaintenance = newMileage - lastMaintenanceMileage;
                    const maintenanceCost = kilometersSinceLastMaintenance * vehicle.maintenance_cost_per_kilometer;

                    // Create maintenance record
                    const maintenanceDate = new Date();
                    const formattedDate = maintenanceDate.toISOString().split('T')[0];

                    // Start a transaction
                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');

                        // Insert maintenance record
                        db.run(`
                            INSERT INTO maintenance (
                                vehicle_id, maintenance_date, mileage, cost, description, is_completed
                            ) VALUES (?, ?, ?, ?, ?, ?)
                        `, [
                            vehicleId,
                            formattedDate,
                            newMileage,
                            maintenanceCost,
                            `Automatic maintenance at ${newMileage} km`,
                            1 // Automatically mark as completed
                        ], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            // Update vehicle availability
                            db.run('UPDATE vehicles SET is_available = 1 WHERE id = ?', [vehicleId], function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }

                                db.run('COMMIT');
                                // Overview for users
                                console.log(`
                                    Automatic maintenance completed!
                                    Vehicle ID: ${vehicleId}
                                    Mileage: ${newMileage}
                                    Maintenance cost: €${maintenanceCost.toFixed(2)}
                                    `);
                                resolve(true);
                            });
                        });
                    });
                } else {
                    resolve(false);
                }
            });
        });
    }
}

export default MaintenanceService; 