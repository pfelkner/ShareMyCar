const seedVehicles = [
    // BMW vehicles
    {
        brand: 'BMW',
        model: '320i',
        mileage: 45000,
        daily_rental_price: 120,
        maintenance_cost_per_kilometer: 0.35,
        is_available: true
    },
    {
        brand: 'BMW',
        model: 'X5 xDrive40i',
        mileage: 35000,
        daily_rental_price: 250,
        maintenance_cost_per_kilometer: 0.45,
        is_available: true
    },
    {
        brand: 'BMW',
        model: '530e',
        mileage: 28000,
        daily_rental_price: 180,
        maintenance_cost_per_kilometer: 0.40,
        is_available: true
    },

    // Audi vehicles
    {
        brand: 'Audi',
        model: 'A4 2.0 TFSI',
        mileage: 55000,
        daily_rental_price: 110,
        maintenance_cost_per_kilometer: 0.30,
        is_available: true
    },
    {
        brand: 'Audi',
        model: 'Q5 45 TFSI',
        mileage: 42000,
        daily_rental_price: 200,
        maintenance_cost_per_kilometer: 0.35,
        is_available: true
    },
    {
        brand: 'Audi',
        model: 'A6 3.0 TDI',
        mileage: 38000,
        daily_rental_price: 170,
        maintenance_cost_per_kilometer: 0.38,
        is_available: true
    },

    // Mercedes vehicles
    {
        brand: 'Mercedes',
        model: 'C300',
        mileage: 48000,
        daily_rental_price: 130,
        maintenance_cost_per_kilometer: 0.42,
        is_available: true
    },
    {
        brand: 'Mercedes',
        model: 'E350',
        mileage: 32000,
        daily_rental_price: 220,
        maintenance_cost_per_kilometer: 0.48,
        is_available: true
    },

    // Toyota vehicles
    {
        brand: 'Toyota',
        model: 'Camry Hybrid',
        mileage: 65000,
        daily_rental_price: 80,
        maintenance_cost_per_kilometer: 0.15,
        is_available: true
    },
    {
        brand: 'Toyota',
        model: 'RAV4',
        mileage: 52000,
        daily_rental_price: 90,
        maintenance_cost_per_kilometer: 0.18,
        is_available: true
    },
    {
        brand: 'Toyota',
        model: 'Corolla',
        mileage: 50000,
        daily_rental_price: 50,
        maintenance_cost_per_kilometer: 0.1,
        is_available: true
    },
    {
        brand: 'Honda',
        model: 'Civic',
        mileage: 30000,
        daily_rental_price: 45,
        maintenance_cost_per_kilometer: 0.08,
        is_available: true
    }
];

module.exports = { seedVehicles }; 