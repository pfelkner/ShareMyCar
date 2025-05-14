import inquirer from 'inquirer';
import VehicleController from '../../controllers/VehicleController.js';
import BookingController from '../../controllers/BookingController.js';
import ReturnController from '../../controllers/ReturnController.js';

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
                await this.showRevenueReport();
                break;
            case 'View maintenance costs':
                await this.showMaintenanceCosts();
                break;
            case 'View profit analysis':
                await this.showProfitAnalysis();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to financial metrics menu
        await this.show();
    }

    static async showRevenueReport() {
        try {
            // Get all active bookings
            const activeBookings = await BookingController.viewActiveBookings();
            
            // Calculate total revenue from active bookings
            const activeRevenue = activeBookings.reduce((total, booking) => total + booking.est_cost, 0);
            
            console.log('\nRevenue Report 📊');
            console.log('----------------');
            console.log(`Active Bookings Revenue: €${activeRevenue.toFixed(2)}`);
            
            // Get return history for completed bookings
            const returns = await ReturnController.viewReturnHistory();
            const completedRevenue = returns.reduce((total, ret) => total + ret.total_cost, 0);
            
            console.log(`Completed Bookings Revenue: €${completedRevenue.toFixed(2)}`);
            console.log(`Total Revenue: €${(activeRevenue + completedRevenue).toFixed(2)}`);
        } catch (error) {
            console.error('Error generating revenue report:', error.message);
        }
    }

    static async showMaintenanceCosts() {
        try {
            await VehicleController.viewMaintenanceHistory();
        } catch (error) {
            console.error('Error viewing maintenance costs:', error.message);
        }
    }

    static async showProfitAnalysis() {
        try {
            // Get all returns to calculate total revenue
            const returns = await ReturnController.viewReturnHistory();
            const totalRevenue = returns.reduce((total, ret) => total + ret.total_cost, 0);
            
            // Get maintenance history to calculate total costs
            const maintenanceHistory = await VehicleController.viewMaintenanceHistory();
            const totalMaintenanceCost = maintenanceHistory.reduce((total, maint) => total + maint.cost, 0);
            
            console.log('\nProfit Analysis 📈');
            console.log('----------------');
            console.log(`Total Revenue: €${totalRevenue.toFixed(2)}`);
            console.log(`Total Maintenance Costs: €${totalMaintenanceCost.toFixed(2)}`);
            console.log(`Net Profit: €${(totalRevenue - totalMaintenanceCost).toFixed(2)}`);
        } catch (error) {
            console.error('Error generating profit analysis:', error.message);
        }
    }
}

export default FinancialMetricsMenu; 