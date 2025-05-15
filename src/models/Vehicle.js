class Vehicle {
    constructor(data) {
        this.id = data.id;
        this.brand = data.brand;
        this.model = data.model;
        this.mileage = data.mileage;
        this.daily_rental_price = data.daily_rental_price;
        this.maintenance_cost_per_kilometer = data.maintenance_cost_per_kilometer;
        this.is_available = data.is_available;
    }

    static fromDB(data) {
        return new Vehicle({
            ...data,
            is_available: Boolean(data.is_available)
        });
    }
}

module.exports = Vehicle; 