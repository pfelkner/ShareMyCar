import inquirer from 'inquirer';
import ReturnController from '../../controllers/ReturnController.js';
import BookingController from '../../controllers/BookingController.js';

class ReturnProcessingMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Return Processing:',
                choices: [
                    'Process vehicle return',
                    'View return history',
                    'Back to main menu'
                ]
            }
        ]);

        switch (answers.action) {
            case 'Process vehicle return':
                await this.showProcessReturnMenu();
                break;
            case 'View return history':
                await this.showReturnHistoryMenu();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to return processing menu
        await this.show();
    }

    static async showProcessReturnMenu() {
        try {
            // First show active bookings
            await BookingController.viewActiveBookings();

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'bookingId',
                    message: 'Enter booking ID:',
                    validate: input => input.trim().length > 0 || 'Booking ID is required'
                },
                {
                    type: 'number',
                    name: 'actualKilometers',
                    message: 'Enter actual kilometers driven:',
                    validate: input => input > 0 || 'Kilometers must be greater than 0'
                }
            ]);

            await ReturnController.processReturn(answers);
        } catch (error) {
            console.error('Error processing return:', error.message);
        }
    }

    static async showReturnHistoryMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'bookingId',
                message: 'Enter booking ID to view return history (or leave empty for all returns):',
                validate: input => input.trim().length === 0 || !isNaN(input) || 'Booking ID must be a number'
            }
        ]);

        try {
            if (answers.bookingId) {
                await ReturnController.viewReturnHistory(answers.bookingId);
            } else {
                await ReturnController.viewReturnHistory();
            }
        } catch (error) {
            console.error('Error viewing return history:', error.message);
        }
    }
}

export default ReturnProcessingMenu; 