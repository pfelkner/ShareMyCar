import db from '../config/database.js';
import Vehicle from '../models/Vehicle.js';

class VehicleController {
    // o View the complete inventory with all details.
    // o Add new vehicles to the fleet.
    // o Update availability when a vehicle is booked or returned.

    static async viewAllVehicles() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM vehicles', (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const vehicles = rows.map(row => Vehicle.fromDB(row));
                console.table(vehicles);
                resolve();
            });
        });
    }

    // static async searchVehicles(searchTerm) {
    //     return new Promise((resolve, reject) => {
    //         const query = 'SELECT * FROM vehicles WHERE brand LIKE ? OR model LIKE ?';
    //         const searchPattern = `%${searchTerm}%`;
            
    //         db.all(query, [searchPattern, searchPattern], (err, rows) => {
    //             if (err) {
    //                 reject(err);
    //                 return;
    //             }
    //             const vehicles = rows.map(row => Vehicle.fromDB(row));
    //             if (vehicles.length === 0) {
    //                 console.log('No vehicles found matching your search criteria.');
    //             } else {
    //                 console.table(vehicles);
    //             }
    //             resolve();
    //         });
    //     });
    // }
}

export default VehicleController; 