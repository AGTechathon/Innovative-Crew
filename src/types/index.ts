
export type UserRole = 'admin' | 'supervisor' | 'worker' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  factoryId: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  assignedWorkers: string[];
  supervisorId: string;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  notes?: string;
  factoryId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'raw-material' | 'finished-goods' | 'scrap' | 'tools';
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  lastUpdated: Date;
  factoryId: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'breakdown';
  utilizationHours: number;
  totalHours: number;
  operatorId?: string;
  factoryId: string;
}

export interface ProductionMetrics {
  id: string;
  date: Date;
  ordersCompleted: number;
  totalProduction: number;
  efficiency: number;
  defectRate: number;
  factoryId: string;
}
