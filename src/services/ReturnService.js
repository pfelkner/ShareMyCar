const { db } = require('../config/database.js');
const MaintenanceService = require('./MaintenanceService.js');
const TransactionService = require('./TransactionService.js');
const VehicleController = require('../controllers/VehicleController.js');

class ReturnService {
    // Process vehicle return
    // @param answers is an object containing the booking ID and actual kilometers driven
    static processReturn(answers) {
        // Extract booking ID and actual kilometers driven by destructuring argument
        const { bookingId, actualKilometers } = answers;
        
        // Get booking details with vehicle maintenance cost
        const booking = db.prepare('SELECT b.*, v.maintenance_cost_per_kilometer FROM booking b JOIN vehicles v ON b.vehicle_id = v.id WHERE b.booking_id = ?').get(bookingId);

        if (!booking) {
            throw new Error(`Booking with ID ${bookingId} not found`);
        }

        // Calculate fees
        const returnDate = new Date();
        const dueDate = new Date(booking.due_date);
        const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
        const lateFee = daysLate * 10; // 10€ per day
        const cleaningFee = 20; // 20€ fixed
        
        // Calculate maintenance costs
        const estimatedMaintenanceCost = booking.est_km * booking.maintenance_cost_per_kilometer;
        const actualMaintenanceCost = actualKilometers * booking.maintenance_cost_per_kilometer;
        
        // Calculate total cost by removing estimated maintenance and adding actual maintenance
        const baseCost = booking.est_cost - estimatedMaintenanceCost;
        const additionalCost = lateFee + cleaningFee + actualMaintenanceCost;
        const totalCost = baseCost + additionalCost;

        // Format return date for SQLite
        const formattedReturnDate = returnDate.toISOString().split('T')[0];

        try {
            // Start a transaction
            db.prepare('BEGIN TRANSACTION').run();

            // Get current vehicle mileage
            const vehicle = db.prepare('SELECT mileage FROM vehicles WHERE id = ?').get(booking.vehicle_id);
            if (!vehicle) {
                throw new Error(`Vehicle with ID ${booking.vehicle_id} not found`);
            }

            // Calculate the new mileage
            const newMileage = vehicle.mileage + actualKilometers;

            // Check if maintenance is needed
            MaintenanceService.checkMaintenance(booking.vehicle_id, newMileage);

            // Update vehicle mileage
            db.prepare('UPDATE vehicles SET mileage = ? WHERE id = ?').run(newMileage, booking.vehicle_id);

            // Insert return record
            const result = db.prepare(`
                INSERT INTO returns (
                    booking_id, actual_km, return_date, days_late,
                    late_fee, cleaning_fee, maintenance_cost, total_cost
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                bookingId, actualKilometers, formattedReturnDate, daysLate,
                lateFee, cleaningFee, actualMaintenanceCost, totalCost
            );

            // Get the last inserted return ID
            const returnId = result.lastInsertRowid;

            // Log transaction
            TransactionService.logReturnTransaction({
                returnId,
                bookingId,
                customerName: booking.customer_name,
                vehicleId: booking.vehicle_id,
                returnDate: formattedReturnDate,
                rentalDuration: booking.est_days,
                baseRevenue: booking.est_cost,
                cleaningFee,
                maintenanceCost: actualMaintenanceCost,
                lateFee,
                totalAmount: totalCost
            });

            // Commit transaction
            db.prepare('COMMIT').run();

            // Feedback for users
            console.log(`
                Return processed successfully!
                Booking ID: ${bookingId}
                Actual kilometers: ${actualKilometers}
                New vehicle mileage: ${newMileage}
                Days late: ${daysLate}

                Original Booking Cost: €${booking.est_cost.toFixed(2)}
                Additional Costs:
                - Late fee: €${lateFee.toFixed(2)}
                - Cleaning fee: €${cleaningFee.toFixed(2)}
                - Maintenance cost: €${actualMaintenanceCost.toFixed(2)}
                Total additional costs: €${additionalCost.toFixed(2)}

                Final Total Cost: €${totalCost.toFixed(2)}
                `);
        } catch (err) {
            // Rollback on error
            db.prepare('ROLLBACK').run();
            throw err;
        }
    }

    // Get return history from db
    static getReturnHistory() {
        return db.prepare(`
            SELECT r.*, b.customer_name, v.brand, v.model
            FROM returns r
            JOIN booking b ON r.booking_id = b.booking_id
            JOIN vehicles v ON b.vehicle_id = v.id
            ORDER BY r.return_date DESC
        `).all();
    }
}

module.exports = ReturnService; 