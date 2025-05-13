import inquirer from 'inquirer';
import VehicleController from '../../controllers/VehicleController.js';

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
                await this.processVehicleReturn();
                break;
            case 'View return history':
                await this.viewReturnHistory();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to return processing menu
        await this.show();
    }

    static async processVehicleReturn() {
        // First, show active bookings
        console.log('\nActive Bookings:');
        await VehicleController.viewActiveBookings();
        console.log('\n');

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'bookingId',
                message: 'Enter booking ID:',
                validate: async (input) => {
                    if (!input.trim()) return 'Booking ID is required';
                    if (isNaN(input)) return 'Booking ID must be a number';
                    
                    try {
                        const booking = await VehicleController.getBookingById(input);
                        if (!booking) return 'Booking not found';
                        if (await VehicleController.isBookingReturned(input)) return 'This booking has already been returned';
                        return true;
                    } catch (error) {
                        return 'Error validating booking ID';
                    }
                }
            },
            {
                type: 'number',
                name: 'actualKilometers',
                message: 'Enter actual kilometers driven:',
                validate: input => {
                    if (!input) return 'Actual kilometers is required';
                    if (input < 0) return 'Actual kilometers cannot be negative';
                    return true;
                }
            }
        ]);

        try {
            await VehicleController.processReturn(answers);
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        } catch (error) {
            console.error('\nError processing return:', error.message);
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        }
    }

    static async viewReturnHistory() {
        try {
            await VehicleController.viewReturnHistory();
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        } catch (error) {
            console.error('\nError viewing return history:', error.message);
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        }
    }
}

export default ReturnProcessingMenu; 