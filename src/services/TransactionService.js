const { db } = require('../config/database.js');

class TransactionService {
    // Log a booking transaction
    // @param bookingData is an object containing the booking data
    static logBookingTransaction(bookingData) {
        // Extract the booking data from the bookingData object using destructuring
        const {
            bookingId,
            customerName,
            vehicleId,
            startDate,
            endDate,
            estCost
        } = bookingData;

        // Calculate the duration of the booking in days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // Insert the transaction into the transactions table
        const result = db.prepare(`
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
        `).run(
            'BOOKING',
            bookingId,
            customerName,
            vehicleId,
            startDate,
            duration,
            estCost,
            estCost
        );

        return result.lastInsertRowid;
    }

    // Log a return transaction
    // @param returnData is an object containing the return data
    static logReturnTransaction(returnData) {
        // Extract the return data from the returnData object using destructuring
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

        // Insert the transaction into the transactions table
        const result = db.prepare(`
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
        `).run(
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
        );

        return result.lastInsertRowid;
    }

    // Get the transaction history
    // @param startDate (optional) is the start date of the date range to get the history for
    // @param endDate (optional) is the end date of the date range to get the history for
    static getTransactionHistory(startDate = null, endDate = null) {
        // Query to get the transaction history by joining the transactions and vehicles tables
        let query = `
            SELECT t.*, v.brand, v.model
            FROM transactions t
            JOIN vehicles v ON t.vehicle_id = v.id
        `;
        const params = [];

        // If a date range is provided, add it to the query
        if (startDate && endDate) {
            query += ' WHERE t.transaction_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        // Order the transactions by date in descending order
        query += ' ORDER BY t.transaction_date DESC';

        return db.prepare(query).all(params);
    }

    // Get the transaction summary
    // @param startDate (optional) is the start date of the date range to get the summary for
    // @param endDate (optional) is the end date of the date range to get the summary for
    static getTransactionSummary(startDate = null, endDate = null) {
        // Query to get the total transactions, total revenue, total cleaning fees, total maintenance costs, and total late fees
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

        // If a date range is provided, add it to the query
        if (startDate && endDate) {
            query += ' WHERE transaction_date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        return db.prepare(query).get(params);
    }
}

module.exports = TransactionService; 