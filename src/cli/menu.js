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
                    'Search vehicles',
                    'Exit'
                ]
            }
        ]);

        switch (answers.action) {
            case 'View all vehicles':
                await VehicleController.viewAllVehicles();
                break;
            case 'Search vehicles':
                await this.showSearchMenu();
                break;
            case 'Exit':
                console.log('Goodbye! 👋');
                process.exit(0);
        }

        // Return to main menu
        await this.showMainMenu();
    }

    static async showSearchMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'searchTerm',
                message: 'Enter brand or model to search:',
                validate: input => input.length > 0 || 'Please enter a search term'
            }
        ]);

        await VehicleController.searchVehicles(answers.searchTerm);
    }
}

export default Menu; 