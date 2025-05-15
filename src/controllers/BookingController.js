import BookingService from '../services/BookingService.js';
import VehicleController from './VehicleController.js';

class BookingController {
    // Create a booking
    // @param bookingData is an object containing the booking details
    static async createBooking(bookingData) {
        // Validate vehicle availability
        const vehicle = await VehicleController.getVehicleById(bookingData.vehicleId);
        if (!vehicle) {
            throw new Error('Vehicle not found');
        }
        if (!vehicle.is_available) {
            throw new Error('Vehicle is not available for booking');
        }
        // Create a booking and show details to user
        const result = await BookingService.createBooking(bookingData);
        console.log(`
            Booking created successfully!
            Booking ID: ${result.bookingId}
            Total Cost: €${result.totalCost.toFixed(2)}
            - Rental Cost: €${result.rentalCost.toFixed(2)}
            - Maintenance Cost: €${result.maintenanceCost.toFixed(2)}
        `);
        return result;
    }

    // View a booking
    // @param bookingId is the ID of the booking to view
    static async viewBooking(bookingId) {
        // Fetch the booking
        const booking = await BookingService.getBookingById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }
        // Show the booking details to the user
        console.table([booking]);
        return booking;
    }

    // View all active bookings
    static async viewActiveBookings() {
        // Fetch all active bookings
        const bookings = await BookingService.getActiveBookings();
        if (bookings.length === 0) {
            console.log('No active bookings found.');
            return [];
        }
        // Show the bookings to the user
        console.table(bookings);
        return bookings;
    }
}

export default BookingController; 