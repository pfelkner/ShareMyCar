import inquirer from 'inquirer';
import BookingController from '../../controllers/BookingController.js';
import VehicleController from '../../controllers/VehicleController.js';

class BookingMenu {
    // Show the booking menu
    static async show() {
        // Let user select how to interact with the booking system
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Booking Management:',
                choices: [
                    'Create new booking',
                    'View active bookings',
                    'View booking details',
                    'Back to main menu'
                ]
            }
        ]);

        // Determine which action the user wants to perform
        // @param answers.action is one of the choices above
        switch (answers.action) {
            case 'Create new booking':
                await this.showCreateBookingMenu(); // Part of Requirement 2
                break;
            case 'View active bookings':
                await BookingController.viewActiveBookings(); // Not part of Requirements: Lets user see all active bookings
                break;
            case 'View booking details':
                await this.showViewBookingMenu(); // Not part of Requirements: Lets user see details of specific booking
                break;
            case 'Back to main menu':
                return;
        }

        // Return to booking menu
        await this.show();
    }

    // Show the create booking (sub)menu
    static async showCreateBookingMenu() {
        try {
            // Show vehicles to user
            await VehicleController.viewAllVehicles();

            // Prompt the user for the customer name, vehicle ID, rental duration, and estimated kilometers (as per requirements)
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'customerName',
                    message: 'Enter customer name:',
                    validate: input => input.trim().length > 0 || 'Customer name is required'
                },
                {
                    type: 'input',
                    name: 'vehicleId',
                    message: 'Enter vehicle ID:',
                    validate: input => input.trim().length > 0 || 'Vehicle ID is required'
                },
                {
                    type: 'number',
                    name: 'rentalDuration',
                    message: 'Enter rental duration (days):',
                    validate: input => input > 0 || 'Duration must be greater than 0'
                },
                {
                    type: 'number',
                    name: 'estimatedKilometers',
                    message: 'Enter estimated kilometers:',
                    validate: input => input > 0 || 'Kilometers must be greater than 0'
                }
            ]);

            // Calculate rental dates
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + answers.rentalDuration);

            // Create a booking object with the user's input
            const bookingData = {
                customerName: answers.customerName,
                vehicleId: answers.vehicleId,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                estimatedKilometers: answers.estimatedKilometers
            };

            // Create a booking in the database
            await BookingController.createBooking(bookingData);
        } catch (error) {
            console.error('Error creating booking:', error.message);
        }
    }

    // Show the view booking (sub)menu
    static async showViewBookingMenu() {
        // Prompt the user for the booking ID
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'bookingId',
                message: 'Enter booking ID:',
                validate: input => input.trim().length > 0 || 'Booking ID is required'
            }
        ]);

        try {
            await BookingController.viewBooking(answers.bookingId);
        } catch (error) {
            console.error('Error viewing booking:', error.message);
        }
    }
}

export default BookingMenu; 