import ReturnService from '../services/ReturnService.js';
import BookingService from '../services/BookingService.js';

class ReturnController {
    // Process a return
    // @param answers is an object containing the booking ID and actual kilometers driven
    static async processReturn(answers) {
        // Validate booking exists and is viable for return
        const booking = await BookingService.getBookingById(answers.bookingId);
        if (!booking) {
            throw new Error(`Booking with ID ${answers.bookingId} not found`);
        }
        await ReturnService.processReturn(answers);
    }

    // View return history
    static async viewReturnHistory() {
        try {
            // Get all returns from db
            const returns = await ReturnService.getReturnHistory();
            // Display returns in a table
            console.table(returns);
        } catch (error) {
            console.error('Error viewing return history:', error.message);
            throw error;
        }
    }
}

export default ReturnController; 