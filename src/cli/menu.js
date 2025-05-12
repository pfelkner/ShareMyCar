import inquirer from 'inquirer';
import VehicleController from '../controllers/VehicleController.js';

class Menu {
    static async showMainMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View all vehicles',
                    'Add vehicle',
                    'Set vehicle availability',
                    'Exit'
                ]
            }
        ]);

        switch (answers.action) {
            case 'View all vehicles':
                await VehicleController.viewAllVehicles();
                break;
                case 'Add vehicle':
                    await this.showAddVehicleMenu();
                    break;
            case 'Set vehicle availability':
                await this.showSetAvailabilityMenu();
                break;
            case 'Exit':
                console.log('Goodbye! 👋');
                process.exit(0);
        }

        // Return to main menu
        await this.showMainMenu();
    }

    static async showAddVehicleMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'brand',
                message: 'Enter vehicle brand:',
                validate: input => input.trim().length > 0 || 'Brand is required'
            },
            {
                type: 'input',
                name: 'model',
                message: 'Enter vehicle model:',
                validate: input => input.trim().length > 0 || 'Model is required'
            },
            {
                type: 'number',
                name: 'mileage',
                message: 'Enter current mileage:',
                validate: input => input >= 0 || 'Mileage must be a positive number'
            },
            {
                type: 'number',
                name: 'daily_rental_price',
                message: 'Enter daily rental price:',
                validate: input => input > 0 || 'Daily rental price must be greater than 0'
            },
            {
                type: 'number',
                name: 'maintenance_cost_per_kilometer',
                message: 'Enter maintenance cost per kilometer:',
                validate: input => input > 0 || 'Maintenance cost must be greater than 0'
            },
            {
                type: 'confirm',
                name: 'is_available',
                message: 'Is the vehicle available for rent?',
                default: true
            }
        ]);

        try {
            await VehicleController.addVehicle(answers);
        } catch (error) {
            // Error is already logged in the controller
            console.log('Please try again with valid data.');
        }
    }

    static async showSetAvailabilityMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'vehicleId',
                message: 'Enter vehicle ID:',
                validate: input => input.trim().length > 0 || 'Vehicle ID is required'
            },
            {
                type: 'confirm',
                name: 'isAvailable',
                message: 'Is the vehicle available for rent?',
                default: true
            }
        ]);

        await VehicleController.setAvailability(answers.vehicleId, answers.isAvailable);
    }

}

export default Menu; 