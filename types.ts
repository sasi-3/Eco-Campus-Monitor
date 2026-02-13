
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
  status: 'ACTIVE' | 'INACTIVE' | 'WARNING';
  lastReading: number;
  unit: string;
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
