import ReturnService from '../services/ReturnService.js';
import BookingService from '../services/BookingService.js';

class ReturnController {
    static async processReturn(answers) {
        try {
            // Validate booking exists and is active
            const booking = await BookingService.getBookingById(answers.bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }
            if (booking.status !== 'active') {
                throw new Error('Booking is not active');
            }

            await ReturnService.processReturn(answers);
        } catch (error) {
            console.error('Error processing return:', error.message);
            throw error;
        }
    }

    static async viewReturnHistory(bookingId) {
        try {
            const returns = await ReturnService.getReturnHistory(bookingId);
            if (returns.length === 0) {
                console.log('No return history found for this booking.');
                return [];
            }

            console.table(returns);
            return returns;
        } catch (error) {
            console.error('Error viewing return history:', error.message);
            throw error;
        }
    }
}

export default ReturnController; 