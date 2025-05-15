import inquirer from 'inquirer';
import VehicleController from '../../controllers/VehicleController.js';
import { ValidationError } from '../../utils/validators.js';

class VehicleManagementMenu {
    // Show the vehicle management menu
    static async show() {
        try {
            // Let user select how to interact with the vehicle management system
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Vehicle Management:',
                    choices: [
                        'View all vehicles',
                        'Add vehicle',
                        'Set vehicle availability',
                        'View maintenance history',
                        'Back to main menu'
                    ]
                }
            ]);

            // Determine which action the user wants to perform
            // @param answers.action is one of the choices above
            switch (answers.action) {
                case 'View all vehicles':
                    await VehicleController.viewAllVehicles(); // Part of Requirement 1
                    break;
                case 'Add vehicle':
                    await this.showAddVehicleMenu(); // Part of Requirement 1
                    break;
                case 'Set vehicle availability':
                    await this.showSetAvailabilityMenu(); // Part of Requirement 1
                    break;
                case 'View maintenance history':
                    await VehicleController.viewMaintenanceHistory(); // Not part of Requirements but nice to have
                    break;
                case 'Back to main menu':
                    return;
            }

            // Return to vehicle management menu
            await this.show();
        } catch (error) {
            console.error('Error in vehicle management:', error.message);
            await this.show();
        }
    }

    // Show the add vehicle menu
    static async showAddVehicleMenu() {
        try {
            // Prompt the user for the vehicle details
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

            // Add the vehicle to the database using a controller method. Log any errors.
            // @param answers is the vehicle details - all fields are required and can safely assumed to be valid
            await VehicleController.addVehicle(answers);
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('Validation error:', error.message);
            } else {
                console.error('Error adding vehicle:', error.message);
            }
        }
    }

    // Show the set availability menu
    static async showSetAvailabilityMenu() {
        try {
            // Prompt the user for the vehicle ID and availability status
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

            // Set the vehicle availability using a controller method. Log any errors.
            // @param vehicleId is numeric and can safely assumed to be non-null & positive
            // @param isAvailable is a boolean and can safely assumed to be non-null & boolean
            await VehicleController.setAvailability(answers.vehicleId, answers.isAvailable);
        } catch (error) {
            console.error('Error setting vehicle availability:', error.message);
        }
    }
}

export default VehicleManagementMenu;