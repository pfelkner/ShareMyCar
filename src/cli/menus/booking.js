import inquirer from 'inquirer';
import BookingController from '../../controllers/BookingController.js';
import VehicleController from '../../controllers/VehicleController.js';

// 2. Booking Functionality
// § Users can book a vehicle by providing:
// o Vehicle ID
// o Rental duration (days)
// o Estimated kilometers to be driven
// § Once booked:
// o Mark the vehicle as unavailable during the rental period.
// o Calculate the estimated cost based on the rental duration and
// kilometers.

class BookingMenu {
    static async show() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Booking Management:',
                choices: [
                    'Create new booking',
                    'View active bookings',
                    'View booking details',
                    'Cancel booking',
                    'Back to main menu'
                ]
            }
        ]);

        switch (answers.action) {
            case 'Create new booking':
                await this.showCreateBookingMenu();
                break;
            case 'View active bookings':
                await BookingController.viewActiveBookings();
                break;
            case 'View booking details':
                await this.showViewBookingMenu();
                break;
            case 'Cancel booking':
                await this.showCancelBookingMenu();
                break;
            case 'Back to main menu':
                return;
        }

        // Return to booking menu
        await this.show();
    }

    static async showCreateBookingMenu() {
        try {
            // First show available vehicles
            await VehicleController.viewAllVehicles();

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

            // Calculate dates
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + answers.rentalDuration);

            const bookingData = {
                customerName: answers.customerName,
                vehicleId: answers.vehicleId,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                estimatedKilometers: answers.estimatedKilometers
            };

            await BookingController.createBooking(bookingData);
        } catch (error) {
            console.error('Error creating booking:', error.message);
        }
    }

    static async showViewBookingMenu() {
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

    static async showCancelBookingMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'bookingId',
                message: 'Enter booking ID to cancel:',
                validate: input => input.trim().length > 0 || 'Booking ID is required'
            },
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to cancel this booking?',
                default: false
            }
        ]);

        if (answers.confirm) {
            try {
                await BookingController.cancelBooking(answers.bookingId);
            } catch (error) {
                console.error('Error cancelling booking:', error.message);
            }
        }
    }
}

export default BookingMenu; 