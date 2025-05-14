import db from '../config/database.js';
import TransactionService from './TransactionService.js';

class BookingService {
    static async createBooking(bookingData) {
        const { customerName, vehicleId, startDate, endDate, estimatedKilometers } = bookingData;
        
        return new Promise((resolve, reject) => {
            // Calculate estimated cost
            db.get('SELECT daily_rental_price, maintenance_cost_per_kilometer FROM vehicles WHERE id = ?', [vehicleId], (err, vehicle) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!vehicle) {
                    reject(new Error('Vehicle not found'));
                    return;
                }

                const start = new Date(startDate);
                const end = new Date(endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                const rentalCost = days * vehicle.daily_rental_price;
                const maintenanceCost = estimatedKilometers * vehicle.maintenance_cost_per_kilometer;
                const totalCost = rentalCost + maintenanceCost;

                // Start transaction
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');

                    // Insert booking
                    db.run(`
                        INSERT INTO booking (
                            customer_name, vehicle_id, start_date, due_date,
                            est_days, est_km, est_cost
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        customerName, vehicleId, startDate, endDate,
                        days, estimatedKilometers, totalCost
                    ], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const bookingId = this.lastID;

                        // Log transaction
                        TransactionService.logBookingTransaction({
                            bookingId,
                            customerName,
                            vehicleId,
                            startDate,
                            endDate,
                            estCost: totalCost
                        }).then(() => {
                            // Update vehicle availability
                            db.run('UPDATE vehicles SET is_available = 0 WHERE id = ?', [vehicleId], function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }

                                db.run('COMMIT');
                                resolve({
                                    bookingId,
                                    totalCost,
                                    rentalCost,
                                    maintenanceCost
                                });
                            });
                        }).catch(err => {
                            db.run('ROLLBACK');
                            reject(err);
                        });
                    });
                });
            });
        });
    }

    static async getBookingById(bookingId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM booking WHERE booking_id = ?', [bookingId], (err, booking) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(booking);
            });
        });
    }

    static async getActiveBookings() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM booking WHERE NOT EXISTS (SELECT 1 FROM returns WHERE returns.booking_id = booking.booking_id)', (err, bookings) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(bookings);
            });
        });
    }

    static async cancelBooking(bookingId) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Get booking details
                db.get('SELECT vehicle_id FROM booking WHERE booking_id = ?', [bookingId], (err, booking) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    if (!booking) {
                        db.run('ROLLBACK');
                        reject(new Error('Booking not found'));
                        return;
                    }

                    // Update vehicle availability
                    db.run('UPDATE vehicles SET is_available = 1 WHERE id = ?', [booking.vehicle_id], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        // Delete the booking
                        db.run('DELETE FROM booking WHERE booking_id = ?', [bookingId], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            db.run('COMMIT');
                            resolve();
                        });
                    });
                });
            });
        });
    }
}

export default BookingService; 