import inquirer from 'inquirer';
import FinancialMetricsService from '../../services/FinancialMetricsService.js';

class FinancialMetricsMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Financial Metrics:',
                choices: [
                    'View revenue metrics',
                    'View operational costs',
                    'View profit analysis',
                    'View vehicle mileage metrics',
                    'Generate detailed financial report',
                    'View vehicle-specific metrics',
                    'Back to main menu'
                ]
            }
        ]);

        switch (answers.action) {
            case 'View revenue metrics':
                await this.showRevenueMetrics();
                break;
            case 'View operational costs':
                await this.showOperationalCosts();
                break;
            case 'View profit analysis':
                await this.showProfitAnalysis();
                break;
            case 'View vehicle mileage metrics':
                await this.showVehicleMileageMetrics();
                break;
            case 'Generate detailed financial report':
                await this.showDetailedFinancialReport();
                break;
            case 'View vehicle-specific metrics':
                await this.showVehicleSpecificMetrics();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to financial metrics menu
        await this.show();
    }

    static async getDateRange() {
        return await inquirer.prompt([
            {
                type: 'input',
                name: 'startDate',
                message: 'Enter start date (YYYY-MM-DD) or press Enter for all time:',
                validate: input => !input || /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Please enter a valid date in YYYY-MM-DD format'
            },
            {
                type: 'input',
                name: 'endDate',
                message: 'Enter end date (YYYY-MM-DD) or press Enter for all time:',
                validate: input => !input || /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Please enter a valid date in YYYY-MM-DD format'
            }
        ]);
    }

    static async showRevenueMetrics() {
        try {
            const { startDate, endDate } = await this.getDateRange();
            const metrics = await FinancialMetricsService.getRevenueMetrics(
                startDate || null,
                endDate || null
            );

            console.log('\nRevenue Metrics');
            console.log('----------------');
            console.log(`Total Revenue: €${metrics.total_revenue?.toFixed(2) || '0.00'}`);
            console.log(`Total Transactions: ${metrics.total_transactions || 0}`);
            console.log(`Average Transaction Value: €${metrics.average_transaction_value?.toFixed(2) || '0.00'}`);
        } catch (error) {
            console.error('Error viewing revenue metrics:', error.message);
        }
    }

    static async showOperationalCosts() {
        try {
            const { startDate, endDate } = await this.getDateRange();
            const costs = await FinancialMetricsService.getOperationalCosts(
                startDate || null,
                endDate || null
            );

            console.log('\nOperational Costs');
            console.log('----------------');
            console.log(`Total Cleaning Costs: €${costs.total_cleaning_costs?.toFixed(2) || '0.00'}`);
            console.log(`Total Maintenance Costs: €${costs.total_maintenance_costs?.toFixed(2) || '0.00'}`);
            console.log(`Total Late Fees: €${costs.total_late_fees?.toFixed(2) || '0.00'}`);
            console.log(`Total Operational Costs: €${costs.total_operational_costs?.toFixed(2) || '0.00'}`);
        } catch (error) {
            console.error('Error viewing operational costs:', error.message);
        }
    }

    static async showProfitAnalysis() {
        try {
            const { startDate, endDate } = await this.getDateRange();
            const profit = await FinancialMetricsService.getProfitMetrics(
                startDate || null,
                endDate || null
            );

            console.log('\nProfit Analysis');
            console.log('----------------');
            console.log(`Total Revenue: €${profit.total_revenue?.toFixed(2) || '0.00'}`);
            console.log(`Total Costs: €${profit.total_costs?.toFixed(2) || '0.00'}`);
            console.log(`Net Profit: €${profit.net_profit?.toFixed(2) || '0.00'}`);
        } catch (error) {
            console.error('Error viewing profit analysis:', error.message);
        }
    }

    static async showVehicleMileageMetrics() {
        try {
            const metrics = await FinancialMetricsService.getVehicleMileageMetrics();

            console.log('\nVehicle Mileage Metrics');
            console.log('----------------');
            console.log(`Total Vehicles: ${metrics.total_vehicles}`);
            console.log(`Total Mileage: ${metrics.total_mileage} km`);
            console.log(`Average Mileage: ${metrics.average_mileage?.toFixed(2) || '0.00'} km`);
            console.log(`Minimum Mileage: ${metrics.min_mileage} km`);
            console.log(`Maximum Mileage: ${metrics.max_mileage} km`);
        } catch (error) {
            console.error('Error viewing vehicle mileage metrics:', error.message);
        }
    }

    static async showDetailedFinancialReport() {
        try {
            const { startDate, endDate } = await this.getDateRange();
            const report = await FinancialMetricsService.getDetailedFinancialReport(
                startDate || null,
                endDate || null
            );

            console.log('\nDetailed Financial Report');
            console.log('=======================');
            
            console.log('\nRevenue Metrics');
            console.log('----------------');
            console.log(`Total Revenue: €${report.revenue.total_revenue?.toFixed(2) || '0.00'}`);
            console.log(`Total Transactions: ${report.revenue.total_transactions || 0}`);
            console.log(`Average Transaction Value: €${report.revenue.average_transaction_value?.toFixed(2) || '0.00'}`);

            console.log('\nOperational Costs');
            console.log('----------------');
            console.log(`Total Cleaning Costs: €${report.operationalCosts.total_cleaning_costs?.toFixed(2) || '0.00'}`);
            console.log(`Total Maintenance Costs: €${report.operationalCosts.total_maintenance_costs?.toFixed(2) || '0.00'}`);
            console.log(`Total Late Fees: €${report.operationalCosts.total_late_fees?.toFixed(2) || '0.00'}`);
            console.log(`Total Operational Costs: €${report.operationalCosts.total_operational_costs?.toFixed(2) || '0.00'}`);

            console.log('\nProfit Analysis');
            console.log('----------------');
            console.log(`Total Revenue: €${report.profit.total_revenue?.toFixed(2) || '0.00'}`);
            console.log(`Total Costs: €${report.profit.total_costs?.toFixed(2) || '0.00'}`);
            console.log(`Net Profit: €${report.profit.net_profit?.toFixed(2) || '0.00'}`);

            console.log('\nVehicle Mileage Metrics');
            console.log('----------------');
            console.log(`Total Vehicles: ${report.mileage.total_vehicles}`);
            console.log(`Total Mileage: ${report.mileage.total_mileage} km`);
            console.log(`Average Mileage: ${report.mileage.average_mileage?.toFixed(2) || '0.00'} km`);
            console.log(`Minimum Mileage: ${report.mileage.min_mileage} km`);
            console.log(`Maximum Mileage: ${report.mileage.max_mileage} km`);
        } catch (error) {
            console.error('Error generating detailed financial report:', error.message);
        }
    }

    static async showVehicleSpecificMetrics() {
        try {
            const { vehicleId } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'vehicleId',
                    message: 'Enter vehicle ID:',
                    validate: input => input.trim().length > 0 || 'Vehicle ID is required'
                }
            ]);

            const { startDate, endDate } = await this.getDateRange();
            const metrics = await FinancialMetricsService.getVehicleSpecificMetrics(
                vehicleId,
                startDate || null,
                endDate || null
            );

            console.log('\nVehicle-Specific Metrics');
            console.log('----------------');
            console.log(`Vehicle: ${metrics.brand} ${metrics.model}`);
            console.log(`Current Mileage: ${metrics.mileage} km`);
            console.log(`Total Transactions: ${metrics.total_transactions || 0}`);
            console.log(`Total Revenue: €${metrics.total_revenue?.toFixed(2) || '0.00'}`);
            console.log(`Total Costs: €${metrics.total_costs?.toFixed(2) || '0.00'}`);
            console.log(`Net Profit: €${metrics.net_profit?.toFixed(2) || '0.00'}`);
        } catch (error) {
            console.error('Error viewing vehicle-specific metrics:', error.message);
        }
    }
}

export default FinancialMetricsMenu; 