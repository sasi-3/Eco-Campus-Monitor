export type SensorExpiry = "EXPIRED" | "EXPIRING_SOON" | "VALID";

export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Sensor {
  id: string;
  location: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'AIR_QUALITY' | 'NOISE';
  status: 'HIGH' | 'LOW' | 'MEDIUM';
  lastReading: number;
  unit: string;
  installDate: string;
  expiryDate?: string;
  utilizationRate: number;
  isActive: boolean;
}

export interface Reading {
  timestamp: string;
  temperature: number;
  humidity: number;
  aqi: number;
  noise: number;
  location: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  location: string;
  sensorType: string;
}

export const getSensorExpiry = (expiryDate?: string): "EXPIRED" | "EXPIRING_SOON" | "VALID" => {
  if (!expiryDate) return "VALID";
  const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return "EXPIRED";
  if (daysLeft <= 30) return "EXPIRING_SOON";
  return "VALID";
};
