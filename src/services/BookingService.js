import db from '../config/database.js';
import TransactionService from './TransactionService.js';
import VehicleController from '../controllers/VehicleController.js';
class BookingService {
    // Create a booking
    // @param bookingData is an object containing the booking details
    static async createBooking(bookingData) {
        // Extract the booking details from the bookingData object by destructuring
        const { customerName, vehicleId, startDate, endDate, estimatedKilometers } = bookingData;
        
        return new Promise((resolve, reject) => {
            // Query db for vehicle details
            db.get('SELECT daily_rental_price, maintenance_cost_per_kilometer FROM vehicles WHERE id = ?', [vehicleId], (err, vehicle) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Check if vehicle is found
                if (!vehicle) {
                    reject(new Error('Vehicle not found'));
                    return;
                }
                // Calculate the duration of the booking in days
                const start = new Date(startDate);
                const end = new Date(endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                // Calculate the rental cost
                const rentalCost = days * vehicle.daily_rental_price;
                // Calculate the maintenance cost
                const maintenanceCost = estimatedKilometers * vehicle.maintenance_cost_per_kilometer;
                // Calculate the total cost
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

                        // Get the last inserted booking ID (sqlite automatically returns the last inserted ID)
                        const bookingId = this.lastID;

                        // Log transaction
                        TransactionService.logBookingTransaction({
                            bookingId,
                            customerName,
                            vehicleId,
                            startDate,
                            endDate,
                            estCost: totalCost
                        }).then(async () => {
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

    // Get a specific booking by ID
    // @param bookingId is the ID of the booking to get
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

    // Get all active bookings
    static async getActiveBookings() {
        return new Promise((resolve, reject) => {
            // Query db for all active bookings
            db.all('SELECT * FROM booking WHERE NOT EXISTS (SELECT 1 FROM returns WHERE returns.booking_id = booking.booking_id)', (err, bookings) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(bookings);
            });
        });
    }
}

export default BookingService; 