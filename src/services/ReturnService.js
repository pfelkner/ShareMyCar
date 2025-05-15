import db from '../config/database.js';
import MaintenanceService from './MaintenanceService.js';
import TransactionService from './TransactionService.js';
import VehicleController from '../controllers/VehicleController.js';

class ReturnService {
    // Process vehicle return
    // @param answers is an object containing the booking ID and actual kilometers driven
    static async processReturn(answers) {
        // Extract booking ID and actual kilometers driven by destructuring argument
        const { bookingId, actualKilometers } = answers;
        
        return new Promise((resolve, reject) => {
            // Get booking details with vehicle maintenance cost
            db.get('SELECT b.*, v.maintenance_cost_per_kilometer FROM booking b JOIN vehicles v ON b.vehicle_id = v.id WHERE b.booking_id = ?', [bookingId], async (err, booking) => {
                if (err) {
                    reject(new Error(`Database error while fetching booking: ${err.message}`));
                    return;
                }

                if (!booking) {
                    reject(new Error(`Booking with ID ${bookingId} not found`));
                    return;
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

                // Start a transaction
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');

                    // Get current vehicle mileage
                    db.get('SELECT mileage FROM vehicles WHERE id = ?', [booking.vehicle_id], (err, vehicle) => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(new Error(`Database error while fetching vehicle: ${err.message}`));
                            return;
                        }

                        // Calculate the new mileage
                        const newMileage = vehicle.mileage + actualKilometers;

                        // Check if maintenance is needed, handle maintenance in MaintenanceService, return (_) is be ignored
                        MaintenanceService.checkMaintenance(booking.vehicle_id, newMileage)
                            .then(_ => {
                                // Update vehicle mileage
                                db.run(
                                    'UPDATE vehicles SET mileage = ? WHERE id = ?',
                                    [newMileage, booking.vehicle_id],
                                    function(err) {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            reject(new Error(`Database error while updating vehicle mileage: ${err.message}`));
                                            return;
                                        }

                                        // Insert return record
                                        db.run(`
                                            INSERT INTO returns (
                                                booking_id, actual_km, return_date, days_late,
                                                late_fee, cleaning_fee, maintenance_cost, total_cost
                                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                        `, [
                                            bookingId, actualKilometers, formattedReturnDate, daysLate,
                                            lateFee, cleaningFee, actualMaintenanceCost, totalCost
                                        ], function(err) {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                reject(new Error(`Database error while creating return record: ${err.message}`));
                                                return;
                                            }

                                            // Get the last inserted return ID
                                            const returnId = this.lastID;

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
                                            }).then(() => {
                                                db.run('COMMIT');
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
                                                resolve();
                                            }).catch(err => {
                                                db.run('ROLLBACK');
                                                reject(new Error(`Error logging return transaction: ${err.message}`));
                                            });
                                        });
                                    }
                                );
                            })
                            .catch(err => {
                                db.run('ROLLBACK');
                                reject(new Error(`Error checking maintenance: ${err.message}`));
                            });
                    });
                });
            });
        });
    }

    // Get return history from db
    static async getReturnHistory() {
        return new Promise((resolve, reject) => {
            // Get required data by joining returns, booking and vehicles tables
            db.all(`
                SELECT r.*, b.customer_name, v.brand, v.model
                FROM returns r
                JOIN booking b ON r.booking_id = b.booking_id
                JOIN vehicles v ON b.vehicle_id = v.id
                ORDER BY r.return_date DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
}

export default ReturnService; 