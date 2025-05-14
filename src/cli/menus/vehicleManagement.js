import inquirer from 'inquirer';
import VehicleController from '../../controllers/VehicleController.js';

class VehicleManagementMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Vehicle Management:',
                choices: [
                    'View all vehicles',
                    'Add vehicle',
                    'Set vehicle availability',
                    'View maintenance history', // TODO check if this is needed
                    'Back to main menu'
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
            case 'View maintenance history':
                await VehicleController.viewMaintenanceHistory();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to vehicle management menu
        await this.show();
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
            console.error('Error adding vehicle:', error.message);
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

        try {
            await VehicleController.setAvailability(answers.vehicleId, answers.isAvailable);
        } catch (error) {
            console.error('Error setting vehicle availability:', error.message);
        }
    }
}

export default VehicleManagementMenu; 