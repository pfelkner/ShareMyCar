import inquirer from 'inquirer';

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
                // TODO: Implement process vehicle return
                console.log('Process vehicle return - Not implemented yet');
                break;
            case 'View return history':
                // TODO: Implement view return history
                console.log('View return history - Not implemented yet');
                break;
            case 'Back to main menu':
                return;
        }

        // Return to return processing menu
        await this.show();
    }
}

export default ReturnProcessingMenu; 