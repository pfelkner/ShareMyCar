import BookingService from '../services/BookingService.js';
import VehicleController from './VehicleController.js';

class BookingController {
    static async createBooking(bookingData) {
        try {
            // Validate vehicle availability
            const vehicle = await VehicleController.getVehicleById(bookingData.vehicleId);
            if (!vehicle) {
                throw new Error('Vehicle not found');
            }
            if (!vehicle.is_available) {
                throw new Error('Vehicle is not available for booking');
            }

            const result = await BookingService.createBooking(bookingData);
            console.log(`
                Booking created successfully! 🎉
                Booking ID: ${result.bookingId}
                Total Cost: €${result.totalCost.toFixed(2)}
                - Rental Cost: €${result.rentalCost.toFixed(2)}
                - Maintenance Cost: €${result.maintenanceCost.toFixed(2)}
            `);
            return result;
        } catch (error) {
            console.error('Error creating booking:', error.message);
            throw error;
        }
    }

    static async viewBooking(bookingId) {
        try {
            const booking = await BookingService.getBookingById(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }

            console.table([booking]);
            return booking;
        } catch (error) {
            console.error('Error viewing booking:', error.message);
            throw error;
        }
    }

    static async viewActiveBookings() {
        try {
            const bookings = await BookingService.getActiveBookings();
            if (bookings.length === 0) {
                console.log('No active bookings found.');
                return [];
            }

            console.table(bookings);
            return bookings;
        } catch (error) {
            console.error('Error viewing active bookings:', error.message);
            throw error;
        }
    }

    // TODO: check if this is needed
    static async cancelBooking(bookingId) {
        try {
            await BookingService.cancelBooking(bookingId);
            console.log(`Booking ${bookingId} cancelled successfully! ✅`);
        } catch (error) {
            console.error('Error cancelling booking:', error.message);
            throw error;
        }
    }
}

export default BookingController; 