import db from '../config/database.js';

class FinancialMetricsService {
    static async getRevenueMetrics(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    SUM(total_amount) as total_revenue,
                    COUNT(*) as total_transactions,
                    AVG(total_amount) as average_transaction_value
                FROM transactions
            `;
            const params = [];

            if (startDate && endDate) {
                query += ' WHERE transaction_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    static async getOperationalCosts(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    SUM(cleaning_fee) as total_cleaning_costs,
                    SUM(maintenance_cost) as total_maintenance_costs,
                    SUM(late_fee) as total_late_fees,
                    SUM(COALESCE(cleaning_fee, 0) + COALESCE(maintenance_cost, 0) + COALESCE(late_fee, 0)) as total_operational_costs
                FROM transactions
            `;
            const params = [];

            if (startDate && endDate) {
                query += ' WHERE transaction_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    static async getProfitMetrics(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    SUM(total_amount) as total_revenue,
                    SUM(COALESCE(cleaning_fee, 0) + COALESCE(maintenance_cost, 0) + COALESCE(late_fee, 0)) as total_costs,
                    SUM(total_amount) - SUM(COALESCE(cleaning_fee, 0) + COALESCE(maintenance_cost, 0) + COALESCE(late_fee, 0)) as net_profit
                FROM transactions
            `;
            const params = [];

            if (startDate && endDate) {
                query += ' WHERE transaction_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    static async getVehicleMileageMetrics() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COUNT(*) as total_vehicles,
                    SUM(mileage) as total_mileage,
                    AVG(mileage) as average_mileage,
                    MIN(mileage) as min_mileage,
                    MAX(mileage) as max_mileage
                FROM vehicles
            `;

            db.get(query, [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    static async getDetailedFinancialReport(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            const report = {};

            Promise.all([
                this.getRevenueMetrics(startDate, endDate),
                this.getOperationalCosts(startDate, endDate),
                this.getProfitMetrics(startDate, endDate),
                this.getVehicleMileageMetrics()
            ]).then(([revenue, costs, profit, mileage]) => {
                report.revenue = revenue;
                report.operationalCosts = costs;
                report.profit = profit;
                report.mileage = mileage;
                resolve(report);
            }).catch(err => {
                reject(err);
            });
        });
    }

    static async getVehicleSpecificMetrics(vehicleId, startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    v.brand,
                    v.model,
                    v.mileage,
                    COUNT(t.transaction_id) as total_transactions,
                    SUM(t.total_amount) as total_revenue,
                    SUM(COALESCE(t.cleaning_fee, 0) + COALESCE(t.maintenance_cost, 0) + COALESCE(t.late_fee, 0)) as total_costs,
                    SUM(t.total_amount) - SUM(COALESCE(t.cleaning_fee, 0) + COALESCE(t.maintenance_cost, 0) + COALESCE(t.late_fee, 0)) as net_profit
                FROM vehicles v
                LEFT JOIN transactions t ON v.id = t.vehicle_id
            `;
            const params = [vehicleId];

            if (startDate && endDate) {
                query += ' WHERE v.id = ? AND t.transaction_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            } else {
                query += ' WHERE v.id = ?';
            }

            query += ' GROUP BY v.id';

            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }
}

export default FinancialMetricsService; 