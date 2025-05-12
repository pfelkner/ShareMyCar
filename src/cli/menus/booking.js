import inquirer from 'inquirer';
import VehicleController from '../../controllers/VehicleController.js';

class BookingMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Booking Management:',
                choices: [
                    'Book vehicle',
                    'View active bookings',
                    'Back to main menu'
                ]
            }
        ]);

        switch (answers.action) {
            case 'Book vehicle':
                await this.showBookVehicleMenu();
                break;
            case 'View active bookings':
                // TODO: Implement view active bookings
                console.log('View active bookings - Not implemented yet');
                break;
            case 'Back to main menu':
                return;
        }

        // Return to booking menu
        await this.show();
    }

    static async showBookVehicleMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'vehicleId',
                message: 'Enter vehicle ID:',
                validate: input => input.trim().length > 0 || 'Vehicle ID is required'
            },
            {
                type: 'number',
                name: 'rentalDuration',
                message: 'Enter rental duration (days):',
                validate: input => input > 0 || 'Rental duration must be greater than 0'
            },
            {
                type: 'number',
                name: 'estimatedKilometers',
                message: 'Enter estimated kilometers to be driven:',
                validate: input => input > 0 || 'Estimated kilometers must be greater than 0'
            }
        ]);

        await VehicleController.bookVehicle(answers);
    }
}

export default BookingMenu; 