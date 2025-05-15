import db from '../config/database.js';

class FinancialMetricsService {
    // Get the revenue metrics
    // @param startDate (optional) is the start date of the date range to get the metrics for
    // @param endDate (optional) is the end date of the date range to get the metrics for
    static async getRevenueMetrics(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            // Query to get the total revenue, total transactions, and average transaction value
            let query = `
                SELECT
                    SUM(total_amount) as total_revenue,
                    COUNT(*) as total_transactions,
                    AVG(total_amount) as average_transaction_value
                FROM transactions
            `;
            const params = [];

            // If a date range is provided, add it to the query
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

    // Get the operational costs
    // @param startDate (optional) is the start date of the date range to get the metrics for
    // @param endDate (optional) is the end date of the date range to get the metrics for
    static async getOperationalCosts(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            // Query to get the total cleaning costs, total maintenance costs, total late fees, and total operational costs
            let query = `
                SELECT
                    SUM(cleaning_fee) as total_cleaning_costs,
                    SUM(maintenance_cost) as total_maintenance_costs,
                    SUM(late_fee) as total_late_fees,
                    SUM(COALESCE(cleaning_fee, 0) + COALESCE(maintenance_cost, 0) + COALESCE(late_fee, 0)) as total_operational_costs
                FROM transactions
            `;
            const params = [];

            // If a date range is provided, add it to the query
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

    // Get the profit metrics
    // @param startDate (optional) is the start date of the date range to get the metrics for
    // @param endDate (optional) is the end date of the date range to get the metrics for
    static async getProfitMetrics(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            // Query to get the total revenue, total costs, and net profit
            let query = `
                SELECT 
                    SUM(total_amount) as total_revenue,
                    SUM(COALESCE(cleaning_fee, 0) + COALESCE(maintenance_cost, 0) + COALESCE(late_fee, 0)) as total_costs,
                    SUM(total_amount) - SUM(COALESCE(cleaning_fee, 0) + COALESCE(maintenance_cost, 0) + COALESCE(late_fee, 0)) as net_profit
                FROM transactions
            `;
            const params = [];

            // If a date range is provided, add it to the query
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

    // Get the vehicle mileage metrics
    // Here i am not quite sure what was meant by 'Average mileage per vehicle'
    // I have assumed that this is the average mileage of all vehicles as this is more fitting when displaying overall metrics;
    // alternatively if the average mileage per vehicle across all its rentals is what was meant, the query would have to be modified to:
    // join the vehicles table with the bookings and returns tables, grouping by vehicle, then calculate the average mileage per car (actual km / bookings)
    // SELECT
    //     v.id as vehicle_id,
    //     v.brand,
    //     v.model,
    //     COUNT(DISTINCT b.booking_id) as total_rentals,
    //     COALESCE(SUM(r.actual_km), 0) as total_kilometers,
    //     CASE
    //         WHEN COUNT(DISTINCT b.booking_id) > 0
    //         THEN ROUND(COALESCE(SUM(r.actual_km), 0) * 1.0 / COUNT(DISTINCT b.booking_id), 2)
    //         ELSE 0
    //     END as average_kilometers_per_rental
    // FROM vehicles v
    // LEFT JOIN booking b ON v.id = b.vehicle_id
    // LEFT JOIN returns r ON b.booking_id = r.booking_id
    // GROUP BY v.id, v.brand, v.model
    // ORDER BY average_kilometers_per_rental DESC
    static async getVehicleMileageMetrics() {
        return new Promise((resolve, reject) => {
            // Query to get the total vehicles, total mileage, average mileage, minimum mileage, and maximum mileage
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

    // Get the detailed financial report
    // @param startDate (optional) is the start date of the date range to get the report for
    // @param endDate (optional) is the end date of the date range to get the report for
    static async getDetailedFinancialReport(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            const report = {};
            // Get all the metrics for the report
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

    // Get the vehicle specific metrics
    // @param vehicleId is the ID of the vehicle to get the metrics for
    // @param startDate (optional) is the start date of the date range to get the metrics for
    // @param endDate (optional) is the end date of the date range to get the metrics for
    static async getVehicleSpecificMetrics(vehicleId, startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            // Query to get the brand, model, mileage, total transactions, total revenue, total costs, and net profit
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

            // If a date range is provided, add it to the query
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