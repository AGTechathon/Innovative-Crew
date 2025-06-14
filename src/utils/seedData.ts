
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { WorkOrder, InventoryItem, User } from '@/types';

export const seedFirebaseData = async () => {
  const batch = writeBatch(db);

  // Sample Work Orders
  const workOrders: Partial<WorkOrder>[] = [
    {
      orderNumber: 'ORD-2024-001',
      productName: 'Steel Pipes',
      quantity: 500,
      priority: 'high',
      status: 'in-progress',
      assignedWorkers: ['worker-1', 'worker-2'],
      supervisorId: 'supervisor-1',
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-01-25'),
      factoryId: 'factory-1'
    },
    {
      orderNumber: 'ORD-2024-002',
      productName: 'Metal Brackets',
      quantity: 200,
      priority: 'medium',
      status: 'pending',
      assignedWorkers: ['worker-3'],
      supervisorId: 'supervisor-1',
      startDate: new Date('2024-01-20'),
      dueDate: new Date('2024-01-30'),
      factoryId: 'factory-1'
    }
  ];

  // Sample Inventory Items
  const inventoryItems: Partial<InventoryItem>[] = [
    {
      name: 'Steel Rods',
      type: 'raw-material',
      quantity: 150,
      unit: 'kg',
      minThreshold: 50,
      location: 'Warehouse A',
      factoryId: 'factory-1'
    },
    {
      name: 'Finished Steel Pipes',
      type: 'finished-goods',
      quantity: 75,
      unit: 'pieces',
      minThreshold: 20,
      location: 'Storage B',
      factoryId: 'factory-1'
    }
  ];

  // Sample Workers
  const workers = [
    {
      id: 'worker-1',
      name: 'Raj Kumar',
      email: 'raj@factory.com',
      role: 'worker',
      factoryId: 'factory-1',
      department: 'Production',
      isActive: true,
      skills: ['Welding', 'Assembly'],
      shift: 'morning'
    },
    {
      id: 'worker-2',
      name: 'Priya Singh',
      email: 'priya@factory.com',
      role: 'worker',
      factoryId: 'factory-1',
      department: 'Production',
      isActive: true,
      skills: ['Cutting', 'Quality Check'],
      shift: 'evening'
    }
  ];

  try {
    // Add work orders
    for (const order of workOrders) {
      const docRef = doc(collection(db, COLLECTIONS.WORK_ORDERS));
      batch.set(docRef, {
        ...order,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add inventory items
    for (const item of inventoryItems) {
      const docRef = doc(collection(db, COLLECTIONS.INVENTORY));
      batch.set(docRef, {
        ...item,
        id: docRef.id,
        lastUpdated: new Date()
      });
    }

    // Add workers
    for (const worker of workers) {
      const docRef = doc(collection(db, COLLECTIONS.WORKERS));
      batch.set(docRef, {
        ...worker,
        createdAt: new Date()
      });
    }

    await batch.commit();
    console.log('Sample data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
};
