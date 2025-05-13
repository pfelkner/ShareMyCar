import inquirer from 'inquirer';
import VehicleManagementMenu from './menus/vehicleManagement.js';
import BookingMenu from './menus/booking.js';
import ReturnProcessingMenu from './menus/returnProcessing.js';
import FinancialMetricsMenu from './menus/financialMetrics.js';

class Menu {
    static async showMainMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'section',
                message: 'Select a section:',
                choices: [
                    'Vehicle Inventory Management',
                    'Booking Functionality',
                    'Return Processing',
                    'Financial Metrics',
                    'Exit'
                ]
            }
        ]);

        switch (answers.section) {
            case 'Vehicle Inventory Management':
                await VehicleManagementMenu.show();
                break;
            case 'Booking Functionality':
                await BookingMenu.show();
                break;
            case 'Return Processing':
                await ReturnProcessingMenu.show();
                break;
            case 'Financial Metrics':
                await FinancialMetricsMenu.show();
                break;
            case 'Exit':
                console.log('Goodbye! 👋');
                process.exit(0);
        }

        // Return to main menu
        await this.showMainMenu();
    }
}

export default Menu; 