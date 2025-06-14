
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { COLLECTIONS } from '../lib/firebase';

export const DataSeeder = () => {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const workOrdersHook = useFirestore(COLLECTIONS.WORK_ORDERS);
  const inventoryHook = useFirestore(COLLECTIONS.INVENTORY);
  const workersHook = useFirestore(COLLECTIONS.WORKERS);
  const machinesHook = useFirestore(COLLECTIONS.MACHINES);
  const metricsHook = useFirestore(COLLECTIONS.PRODUCTION_METRICS);

  useEffect(() => {
    const seedInitialData = async () => {
      if (!user || isSeeding || workOrdersHook.data.length > 0) return;
      
      setIsSeeding(true);
      console.log('Seeding initial data for new user...');

      try {
        // Seed Work Orders
        const workOrders = [
          {
            orderNumber: 'WO-001',
            productName: 'Steel Frame A',
            quantity: 100,
            status: 'in-progress',
            priority: 'high',
            dueDate: new Date('2024-12-20'),
            assignedWorker: 'John Doe',
            factoryId: user.factoryId
          },
          {
            orderNumber: 'WO-002',
            productName: 'Engine Block B',
            quantity: 50,
            status: 'pending',
            priority: 'medium',
            dueDate: new Date('2024-12-25'),
            assignedWorker: 'Jane Smith',
            factoryId: user.factoryId
          }
        ];

        for (const order of workOrders) {
          await workOrdersHook.addDocument(order);
        }

        // Seed Inventory
        const inventoryItems = [
          {
            itemName: 'Steel Bars',
            category: 'Raw Materials',
            quantity: 500,
            unit: 'pieces',
            minStock: 100,
            maxStock: 1000,
            supplier: 'MetalCorp Inc',
            factoryId: user.factoryId
          },
          {
            itemName: 'Aluminum Sheets',
            category: 'Raw Materials',
            quantity: 250,
            unit: 'sheets',
            minStock: 50,
            maxStock: 500,
            supplier: 'AlumTech Ltd',
            factoryId: user.factoryId
          }
        ];

        for (const item of inventoryItems) {
          await inventoryHook.addDocument(item);
        }

        // Seed Workers
        const workers = [
          {
            name: 'John Doe',
            employeeId: 'EMP-001',
            department: 'Production',
            shift: 'Morning',
            skills: ['Welding', 'Assembly'],
            status: 'active',
            factoryId: user.factoryId
          },
          {
            name: 'Jane Smith',
            employeeId: 'EMP-002',
            department: 'Quality Control',
            shift: 'Evening',
            skills: ['Inspection', 'Testing'],
            status: 'active',
            factoryId: user.factoryId
          }
        ];

        for (const worker of workers) {
          await workersHook.addDocument(worker);
        }

        // Seed Machines
        const machines = [
          {
            name: 'CNC Machine 1',
            type: 'CNC',
            status: 'operational',
            lastMaintenance: new Date('2024-11-01'),
            nextMaintenance: new Date('2024-12-15'),
            factoryId: user.factoryId
          },
          {
            name: 'Welding Station A',
            type: 'Welding',
            status: 'operational',
            lastMaintenance: new Date('2024-10-15'),
            nextMaintenance: new Date('2024-12-20'),
            factoryId: user.factoryId
          }
        ];

        for (const machine of machines) {
          await machinesHook.addDocument(machine);
        }

        // Seed Production Metrics
        const metrics = [
          {
            date: new Date(),
            unitsProduced: 342,
            targetUnits: 400,
            efficiency: 85.5,
            downtime: 2.5,
            factoryId: user.factoryId
          }
        ];

        for (const metric of metrics) {
          await metricsHook.addDocument(metric);
        }

        console.log('Initial data seeding completed!');
      } catch (error) {
        console.error('Error seeding data:', error);
      } finally {
        setIsSeeding(false);
      }
    };

    seedInitialData();
  }, [user, workOrdersHook.data.length]);

  return null; // This component doesn't render anything
};
