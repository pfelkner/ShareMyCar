const inquirer = require('inquirer');
const ReturnController = require('../../controllers/ReturnController.js');
const BookingController = require('../../controllers/BookingController.js');

class ReturnProcessingMenu {
    // Show the return processing menu
    // Not specifically part of requirements but without menu no way to process returns
    static async show() {
        // Let the user select how to interact with the return processing system
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

        // Determine which action the user wants to perform
        // @param answers.action is one of the choices above
        switch (answers.action) {
            case 'Process vehicle return':
                await this.showProcessReturnMenu(); // Part of Requirement 3
                break;
            case 'View return history':
                await ReturnController.viewReturnHistory(); // Not part of Requirements: Lets user see all return history, nice to have feature
                break;
            case 'Back to main menu':
                return;
        }

        // Return to return processing menu
        await this.show();
    }

    // Show the process return menu
    static async showProcessReturnMenu() {
        try {
            // First show active bookings to make sure user knows what they can return
            const bookings = await BookingController.viewActiveBookings();
            // Get the booking IDs of the active bookings
            const eligibleForReturn = bookings.map(booking => booking.booking_id);
            
            // Prompt the user for the booking ID and actual kilometers driven
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'bookingId',
                    message: 'Enter booking ID:',
                    validate: input => {
                        const bookingId = Number(input);
                        if (isNaN(bookingId)) {
                            return 'Booking ID must be a number';
                        }
                        // Check if the booking ID is in the list of eligible bookings
                        if (!eligibleForReturn.includes(bookingId)) {
                            return 'Invalid booking ID. Please select from the active bookings shown above.';
                        }
                        return true;
                    }
                },
                {
                    type: 'number',
                    name: 'actualKilometers',
                    message: 'Enter actual kilometers driven:',
                    validate: input => input > 0 || 'Kilometers must be greater than 0'
                }
            ]);

            // Process the return
            await ReturnController.processReturn(answers);
        } catch (error) {
            console.error('Error processing return:', error.message);
        }
    }
}

module.exports = ReturnProcessingMenu; 