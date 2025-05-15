const { db } = require('../config/database.js');

class MaintenanceService {
    // Check if vehicle needs maintenance
    // @param vehicleId is the ID of the vehicle to check
    // @param newMileage is the updated mileage of the vehicle
    static checkMaintenance(vehicleId, newMileage) {
        const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);

        if (!vehicle) {
            throw new Error('Vehicle not found');
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

            try {
                // Start a transaction
                db.prepare('BEGIN TRANSACTION').run();

                // Insert maintenance record
                db.prepare(`
                    INSERT INTO maintenance (
                        vehicle_id, maintenance_date, mileage, cost, description, is_completed
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    vehicleId,
                    formattedDate,
                    newMileage,
                    maintenanceCost,
                    `Automatic maintenance at ${newMileage} km`,
                    1 // Automatically mark as completed
                );

                // Update vehicle availability
                db.prepare('UPDATE vehicles SET is_available = 1 WHERE id = ?').run(vehicleId);

                // Commit transaction
                db.prepare('COMMIT').run();

                // Overview for users
                console.log(`
                    Automatic maintenance completed!
                    Vehicle ID: ${vehicleId}
                    Mileage: ${newMileage}
                    Maintenance cost: €${maintenanceCost.toFixed(2)}
                    `);
                return true;
            } catch (err) {
                // Rollback on error
                db.prepare('ROLLBACK').run();
                throw err;
            }
        }
        return false;
    }
}

module.exports = MaintenanceService; 