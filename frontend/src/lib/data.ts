import type { ParkingRecord, LoyaltyAccount, Tariff, Branch } from './types';

export const activeTariff: Tariff = {
  id: 1,
  name: 'Standard Rate',
  pricePerHour: 2.5,
};

// Datos mock para desarrollo - serán reemplazados por llamadas a la API
export const initialParkingRecords: ParkingRecord[] = [];

export const completedParkingRecords: ParkingRecord[] = [
  { 
    id: '101', 
    plate: 'ABC-123', 
    entryTime: '2023-10-26T10:00:00Z', 
    exitTime: '2023-10-26T12:30:00Z', 
    status: 'completed', 
    totalCost: 6.25 
  },
  { 
    id: '102', 
    plate: 'XYZ-789', 
    entryTime: '2023-10-26T11:00:00Z', 
    exitTime: '2023-10-26T11:45:00Z', 
    status: 'completed', 
    totalCost: 1.88 
  },
];

export const loyaltyAccounts: LoyaltyAccount[] = [];

export const branches: Branch[] = [
  { 
    id: 'branch-1', 
    name: 'Downtown Central', 
    location: '123 Main St, Metropolis', 
    totalSpots: 250, 
    occupiedSpots: 180, 
    revenue: 1250.75,
    manager: 'John Doe',
    isActive: true
  },
  { 
    id: 'branch-2', 
    name: 'Airport Lot B', 
    location: '456 Airport Rd, Skyville', 
    totalSpots: 500, 
    occupiedSpots: 450, 
    revenue: 3800.50,
    manager: 'Jane Smith',
    isActive: true
  },
  { 
    id: 'branch-3', 
    name: 'Uptown Plaza', 
    location: '789 Oak Ave, Greenville', 
    totalSpots: 150, 
    occupiedSpots: 95, 
    revenue: 850.00,
    manager: 'Mike Johnson',
    isActive: false
  },
];

// Función para calcular puntos de lealtad (será reemplazada por el servicio)
export const getLoyaltyPoints = (plate: string): number => {
  return 0; // Será manejado por loyaltyService
};

// Función para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Función para calcular duración de estacionamiento
export const calculateParkingDuration = (entryTime: string, exitTime?: string): string => {
  const entry = new Date(entryTime);
  const exit = exitTime ? new Date(exitTime) : new Date();
  const durationMs = exit.getTime() - entry.getTime();
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// Función para calcular costo de estacionamiento
export const calculateParkingCost = (entryTime: string, exitTime?: string, hourlyRate: number = 2.5): number => {
  const entry = new Date(entryTime);
  const exit = exitTime ? new Date(exitTime) : new Date();
  const durationMs = exit.getTime() - entry.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  return Math.max(0, durationHours * hourlyRate);
};