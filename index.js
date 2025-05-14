import db from './src/config/database.js';
import Menu from './src/cli/menu.js';

// Handle cleanup on process termination
process.on('SIGINT', () => {
    console.log('\nGoodbye!');
    db.close();
    process.exit(0);
});

// Start the application
console.log('Welcome to ShareMyCar CLI!');

Menu.showMainMenu().catch(error => {
    console.error('An error occurred:', error);
    db.close();
    process.exit(1);
});


