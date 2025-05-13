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

    // Get a booking by ID
    static async getBookingById(bookingId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM booking WHERE booking_id = ?', [bookingId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    // Check if a booking has been returned
    static async isBookingReturned(bookingId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM returns WHERE booking_id = ?', [bookingId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(!!row);
            });
        });
    }

    // View active bookings
    static async viewActiveBookings() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT b.*, v.brand, v.model 
                FROM booking b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE NOT EXISTS (
                    SELECT 1 FROM returns r WHERE r.booking_id = b.booking_id
                )
            `, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.table(rows);
                resolve();
            });
        });
    }

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

                        // Update vehicle availability
                        db.run('UPDATE vehicles SET is_available = 1 WHERE id = ?', [booking.vehicle_id], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            db.run('COMMIT');
                            console.log(`
Return processed successfully! 🎉
Booking ID: ${bookingId}
Actual kilometers: ${actualKilometers}
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
                        });
                    });
                });
            });
        });
    }

    // View return history
    static async viewReturnHistory() {
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
                console.table(rows);
                resolve();
            });
        });
    }
}

export default VehicleController; 