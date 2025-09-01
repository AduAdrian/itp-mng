// Mock database for browser environment
// In a real application, this would be replaced with API calls to a backend server

// Vehicle interface
export interface Vehicle {
  id?: number;
  nr_inmatriculare: string;
  valabilitate: string;
  perioada_valabilitate: '6_luni' | '1_an' | '2_ani';
  nr_telefon: string;
}

// Simulate database storage using localStorage
const STORAGE_KEY = 'vehicle_registry';

// Function to get vehicles from localStorage
function getStoredVehicles(): Vehicle[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// Function to save vehicles to localStorage
function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Function to initialize database and tables (mock)
export async function initializeDatabase(): Promise<void> {
  try {
    // Simulate database initialization
    console.log('Initializing vehicle registry database...');
    
    // Initialize localStorage if needed
    if (!localStorage.getItem(STORAGE_KEY)) {
      saveVehicles([]);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Function to test database connection (mock)
export async function testConnection(): Promise<boolean> {
  try {
    // Simulate connection test
    console.log('Testing database connection...');
    
    // Check if localStorage is available
    const testKey = 'test_connection';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// CRUD operations
export async function addVehicle(vehicle: Vehicle): Promise<number | null> {
  try {
    const vehicles = getStoredVehicles();
    const newId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id || 0)) + 1 : 1;
    
    const newVehicle: Vehicle = {
      ...vehicle,
      id: newId
    };
    
    vehicles.push(newVehicle);
    saveVehicles(vehicles);
    
    console.log('Vehicle added successfully:', newVehicle);
    return newId;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return null;
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const vehicles = getStoredVehicles();
    console.log('Retrieved vehicles:', vehicles);
    return vehicles; // Show oldest first (ID 1 will be first)
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return [];
  }
}

export async function getVehicleByRegistration(nr_inmatriculare: string): Promise<Vehicle | null> {
  try {
    const vehicles = getStoredVehicles();
    const vehicle = vehicles.find(v => v.nr_inmatriculare === nr_inmatriculare);
    return vehicle || null;
  } catch (error) {
    console.error('Error getting vehicle:', error);
    return null;
  }
}

export async function updateVehicle(id: number, updates: Partial<Vehicle>): Promise<boolean> {
  try {
    const vehicles = getStoredVehicles();
    const index = vehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      console.error('Vehicle not found with id:', id);
      return false;
    }
    
    vehicles[index] = { ...vehicles[index], ...updates };
    saveVehicles(vehicles);
    
    console.log('Vehicle updated successfully:', vehicles[index]);
    return true;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return false;
  }
}

export async function deleteVehicle(id: number): Promise<boolean> {
  try {
    const vehicles = getStoredVehicles();
    const filteredVehicles = vehicles.filter(v => v.id !== id);
    
    if (filteredVehicles.length === vehicles.length) {
      console.error('Vehicle not found with id:', id);
      return false;
    }
    
    saveVehicles(filteredVehicles);
    console.log('Vehicle deleted successfully with id:', id);
    return true;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return false;
  }
}

// Function to clear all data (for testing)
export async function clearAllVehicles(): Promise<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('All vehicles cleared');
    return true;
  } catch (error) {
    console.error('Error clearing vehicles:', error);
    return false;
  }
}
