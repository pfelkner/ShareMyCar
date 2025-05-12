import inquirer from 'inquirer';

class FinancialMetricsMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Financial Metrics:',
                choices: [
                    'View revenue reports',
                    'View maintenance costs',
                    'View profit analysis',
                    'Back to main menu'
                ]
            }
        ]);

        switch (answers.action) {
            case 'View revenue reports':
                // TODO: Implement view revenue reports
                console.log('View revenue reports - Not implemented yet');
                break;
            case 'View maintenance costs':
                // TODO: Implement view maintenance costs
                console.log('View maintenance costs - Not implemented yet');
                break;
            case 'View profit analysis':
                // TODO: Implement view profit analysis
                console.log('View profit analysis - Not implemented yet');
                break;
            case 'Back to main menu':
                return;
        }

        // Return to financial metrics menu
        await this.show();
    }
}

export default FinancialMetricsMenu; 