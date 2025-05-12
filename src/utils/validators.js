export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Validate the vehicle data
export function validateVehicle(vehicleData) {
    const requiredFields = [
        'brand',
        'model',
        'mileage',
        'daily_rental_price',
        'maintenance_cost_per_kilometer',
        'is_available'
    ];

    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => !(field in vehicleData));
    if (missingFields.length > 0) {
        throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate field type
    if (typeof vehicleData.brand !== 'string' || vehicleData.brand.trim() === '') {
        throw new ValidationError('Brand must be a non-empty string');
    }
    // Validate field type
    if (typeof vehicleData.model !== 'string' || vehicleData.model.trim() === '') {
        throw new ValidationError('Model must be a non-empty string');
    }
    // Validate field type
    if (!Number.isInteger(vehicleData.mileage) || vehicleData.mileage < 0) {
        throw new ValidationError('Mileage must be a positive integer');
    }
    // Validate field type
    if (!Number.isInteger(vehicleData.daily_rental_price) || vehicleData.daily_rental_price <= 0) {
        throw new ValidationError('Daily rental price must be a positive integer');
    }

    // Validate field type
    if (typeof vehicleData.maintenance_cost_per_kilometer !== 'number' || 
        vehicleData.maintenance_cost_per_kilometer <= 0) {
        throw new ValidationError('Maintenance cost must be a positive number');
    }

    // Validate field type
    if (typeof vehicleData.is_available !== 'boolean') {
        throw new ValidationError('Availability must be a boolean');
    }
} 