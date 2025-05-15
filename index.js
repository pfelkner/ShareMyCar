const { db } = require('./src/config/database.js');
const Menu = require('./src/cli/menu.js');

// Handle cleanup on process termination
process.on('SIGINT', () => {
    console.log('\nGoodbye!');
    db.close();
    process.exit(0);
});

// Welcome message
console.log('Welcome to ShareMyCar CLI!');

// Start the application, in case of error, close the database connection and exit the application
Menu.showMainMenu().catch(error => {
    console.error('An error occurred:', error);
    db.close();
    process.exit(1);
});


