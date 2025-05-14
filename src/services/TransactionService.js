import db from '../config/database.js';

class TransactionService {
    static async logBookingTransaction(bookingData) {
        const {
            bookingId,
            customerName,
            vehicleId,
            startDate,
            endDate,
            estCost
        } = bookingData;

        return new Promise((resolve, reject) => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            db.run(`
                INSERT INTO transactions (
                    transaction_type,
                    booking_id,
                    customer_name,
                    vehicle_id,
                    transaction_date,
                    rental_duration,
                    base_revenue,
                    total_amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'BOOKING',
                bookingId,
                customerName,
                vehicleId,
                startDate,
                duration,
                estCost,
                estCost
            ], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    }

    static async logReturnTransaction(returnData) {
        const {
            returnId,
            bookingId,
            customerName,
            vehicleId,
            returnDate,
            rentalDuration,
            baseRevenue,
            cleaningFee,
            maintenanceCost,
            lateFee,
            totalAmount
        } = returnData;

        return new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO transactions (
                    transaction_type,
                    booking_id,
                    return_id,
                    customer_name,
                    vehicle_id,
                    transaction_date,
                    rental_duration,
                    base_revenue,
                    cleaning_fee,
                    maintenance_cost,
                    late_fee,
                    total_amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'RETURN',
                bookingId,
                returnId,
                customerName,
                vehicleId,
                returnDate,
                rentalDuration,
                baseRevenue,
                cleaningFee,
                maintenanceCost,
                lateFee,
                totalAmount
            ], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    }

    static async getTransactionHistory(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT t.*, v.brand, v.model
                FROM transactions t
                JOIN vehicles v ON t.vehicle_id = v.id
            `;
            const params = [];

            if (startDate && endDate) {
                query += ' WHERE t.transaction_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            query += ' ORDER BY t.transaction_date DESC';

            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    static async getTransactionSummary(startDate = null, endDate = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(total_amount) as total_revenue,
                    SUM(cleaning_fee) as total_cleaning_fees,
                    SUM(maintenance_cost) as total_maintenance_costs,
                    SUM(late_fee) as total_late_fees
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
}

export default TransactionService; 