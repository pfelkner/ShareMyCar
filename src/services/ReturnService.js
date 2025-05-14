import db from '../config/database.js';
import MaintenanceService from './MaintenanceService.js';
import TransactionService from './TransactionService.js';

class ReturnService {
    // Process vehicle return
    static async processReturn(answers) {
        const { bookingId, actualKilometers } = answers;
        
        return new Promise((resolve, reject) => {
            // Get booking details
            db.get('SELECT * FROM booking WHERE booking_id = ?', [bookingId], (err, booking) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!booking) {
                    reject(new Error('Booking not found'));
                    return;
                }

                // Calculate fees
                const returnDate = new Date();
                const dueDate = new Date(booking.due_date);
                const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
                const lateFee = daysLate * 10; // 10€ per day
                const cleaningFee = 20; // 20€ fixed
                const maintenanceCost = actualKilometers; // 1€ per kilometer
                const additionalCost = lateFee + cleaningFee + maintenanceCost;
                const totalCost = booking.est_cost + additionalCost;

                // Format return date for SQLite
                const formattedReturnDate = returnDate.toISOString().split('T')[0];

                // Start a transaction
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');

                    // Get current vehicle mileage
                    db.get('SELECT mileage FROM vehicles WHERE id = ?', [booking.vehicle_id], (err, vehicle) => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const newMileage = vehicle.mileage + actualKilometers;

                        // Check if maintenance is needed
                        MaintenanceService.checkMaintenance(booking.vehicle_id, newMileage)
                            .then(needsMaintenance => {
                                // Update vehicle mileage
                                db.run(
                                    'UPDATE vehicles SET mileage = ? WHERE id = ?',
                                    [newMileage, booking.vehicle_id],
                                    function(err) {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            reject(err);
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
                                            lateFee, cleaningFee, maintenanceCost, totalCost
                                        ], function(err) {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                reject(err);
                                                return;
                                            }

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
                                                maintenanceCost,
                                                lateFee,
                                                totalAmount: totalCost
                                            }).then(() => {
                                                db.run('COMMIT');
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
                                                    - Maintenance cost: €${maintenanceCost.toFixed(2)}
                                                    Total additional costs: €${additionalCost.toFixed(2)}

                                                    Final Total Cost: €${totalCost.toFixed(2)}
                                                    `);
                                                resolve();
                                            }).catch(err => {
                                                db.run('ROLLBACK');
                                                reject(err);
                                            });
                                        });
                                    }
                                );
                            })
                            .catch(err => {
                                db.run('ROLLBACK');
                                reject(err);
                            });
                    });
                });
            });
        });
    }

    static async getReturnsByVehicleId(vehicleId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT r.*, b.customer_name, v.brand, v.model
                FROM returns r
                JOIN booking b ON r.booking_id = b.booking_id
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE b.vehicle_id = ?
                ORDER BY r.return_date DESC
            `, [vehicleId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    static async getReturnHistory() {
        return new Promise((resolve, reject) => {
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