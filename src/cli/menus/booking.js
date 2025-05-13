import inquirer from 'inquirer';
import VehicleController from '../../controllers/VehicleController.js';

// 2. Booking Functionality
// § Users can book a vehicle by providing:
// o Vehicle ID
// o Rental duration (days)
// o Estimated kilometers to be driven
// § Once booked:
// o Mark the vehicle as unavailable during the rental period.
// o Calculate the estimated cost based on the rental duration and
// kilometers.

class BookingMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Booking Management:',
                choices: [
                    'Book vehicle',
                    'Back to main menu'
                ]
            }
        ]);

        switch (answers.action) {
            case 'Book vehicle':
                await this.showBookVehicleMenu();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to booking menu
        await this.show();
    }

    static async showBookVehicleMenu() {
        // First, show available vehicles
        console.log('\nAvailable Vehicles:');
        await VehicleController.viewAllVehicles();
        console.log('\n');

        const answers = await inquirer.prompt([
            {
                type: 'text',
                name: 'customerName',
                message: 'Enter your name:',
                validate: input => input.trim().length > 0 || 'Customer name is required'
            },
            {
                type: 'input',
                name: 'vehicleId',
                message: 'Enter vehicle ID:',
                validate: async (input) => {
                    if (!input.trim()) return 'Vehicle ID is required';
                    if (isNaN(input)) return 'Vehicle ID must be a number';
                    
                    try {
                        const vehicle = await VehicleController.getVehicleById(input);
                        if (!vehicle) return 'Vehicle not found';
                        if (!vehicle.is_available) return 'Vehicle is not available';
                        return true;
                    } catch (error) {
                        return 'Error validating vehicle ID';
                    }
                }
            },
            {
                type: 'number',
                name: 'rentalDuration',
                message: 'Enter rental duration (days):',
                validate: input => {
                    if (!input) return 'Rental duration is required';
                    if (input <= 0) return 'Rental duration must be greater than 0';
                    if (input > 365) return 'Rental duration cannot exceed 365 days';
                    return true;
                }
            },
            {
                type: 'number',
                name: 'estimatedKilometers',
                message: 'Enter estimated kilometers to be driven:',
                validate: input => {
                    if (!input) return 'Estimated kilometers is required';
                    if (input <= 0) return 'Estimated kilometers must be greater than 0';
                    if (input > 10000) return 'Estimated kilometers cannot exceed 10,000 km';
                    return true;
                }
            }
        ]);

        try {
            await VehicleController.bookVehicle(answers);
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        } catch (error) {
            console.error('\nError booking vehicle:', error.message);
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        }
    }
}

export default BookingMenu; 