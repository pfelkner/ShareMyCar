const inquirer = require('inquirer');
const VehicleManagementMenu = require('./menus/vehicleManagement.js');
const BookingMenu = require('./menus/booking.js');
const ReturnProcessingMenu = require('./menus/returnProcessing.js');
const FinancialMetricsMenu = require('./menus/financialMetrics.js');

class Menu {
    // This is the entrypoint for the Application
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

        // Determine which section the user wants to access
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
                console.log('Goodbye!');
                process.exit(0);
        }

        // Return to main menu
        await this.showMainMenu();
    }
}

module.exports = Menu; 