export interface Trip {
  id: string;
  total_miles: number;
  current_address: string;
  pickup_address: string;
  dropoff_address: string;
  cycle_hours: number;
  available_routes?: Route[];
  trip: {
    id: string;
    total_miles: number;
    current_address: string;
    pickup_address: string;
    dropoff_address: string;
    cycle_hours: number;
    available_routes?: Route[];
  };
  fuel_stops?: FuelStop[];
  water_alerts?: WaterAlert[];
}

export interface Route {
  duration: number;
  distance: number;
}

export interface FuelStop {
  location: string;
  distance_from_start: number;
}

export interface WaterAlert {
  alert_level: string;
  location: string;
}