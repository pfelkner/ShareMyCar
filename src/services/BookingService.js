const { db } = require('../config/database.js');
const TransactionService = require('./TransactionService.js');
const VehicleController = require('../controllers/VehicleController.js');

class BookingService {
    // Create a booking
    // @param bookingData is an object containing the booking details
    static createBooking(bookingData) {
        // Extract the booking details from the bookingData object by destructuring
        const { customerName, vehicleId, startDate, endDate, estimatedKilometers } = bookingData;
        
        // Query db for vehicle details
        const vehicle = db.prepare('SELECT daily_rental_price, maintenance_cost_per_kilometer FROM vehicles WHERE id = ?').get(vehicleId);
        
        // Check if vehicle is found
        if (!vehicle) {
            throw new Error('Vehicle not found');
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

        try {
            // Start transaction
            db.prepare('BEGIN TRANSACTION').run();

            // Insert booking
            const result = db.prepare(`
                INSERT INTO booking (
                    customer_name, vehicle_id, start_date, due_date,
                    est_days, est_km, est_cost
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                customerName, vehicleId, startDate, endDate,
                days, estimatedKilometers, totalCost
            );

            // Get the last inserted booking ID
            const bookingId = result.lastInsertRowid;

            // Log transaction
            TransactionService.logBookingTransaction({
                bookingId,
                customerName,
                vehicleId,
                startDate,
                endDate,
                estCost: totalCost
            });

            // Update vehicle availability
            db.prepare('UPDATE vehicles SET is_available = 0 WHERE id = ?').run(vehicleId);

            // Commit transaction
            db.prepare('COMMIT').run();

            return {
                bookingId,
                totalCost,
                rentalCost,
                maintenanceCost
            };
        } catch (err) {
            // Rollback on error
            db.prepare('ROLLBACK').run();
            throw err;
        }
    }

    // Get a specific booking by ID
    // @param bookingId is the ID of the booking to get
    static getBookingById(bookingId) {
        return db.prepare('SELECT * FROM booking WHERE booking_id = ?').get(bookingId);
    }

    // Get all active bookings
    static getActiveBookings() {
        return db.prepare('SELECT * FROM booking WHERE NOT EXISTS (SELECT 1 FROM returns WHERE returns.booking_id = booking.booking_id)').all();
    }
}

module.exports = BookingService; 