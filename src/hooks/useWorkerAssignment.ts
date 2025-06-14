
import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useWorkerAssignment = () => {
  const { data: workOrders, updateDocument: updateWorkOrder } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const { data: workers } = useFirestore(COLLECTIONS.WORKERS);
  const { toast } = useToast();

  const assignWorkerToOrder = async (workOrderId: string, workerId: string) => {
    try {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) {
        throw new Error('Worker not found');
      }

      await updateWorkOrder(workOrderId, {
        assignedWorker: worker.name,
        assignedWorkerId: workerId,
        updatedAt: new Date()
      });

      toast({
        title: "Worker Assigned",
        description: `${worker.name} has been assigned to the work order.`,
      });
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign worker to work order.",
        variant: "destructive"
      });
    }
  };

  const unassignWorkerFromOrder = async (workOrderId: string) => {
    try {
      await updateWorkOrder(workOrderId, {
        assignedWorker: '',
        assignedWorkerId: '',
        updatedAt: new Date()
      });

      toast({
        title: "Worker Unassigned",
        description: "Worker has been removed from the work order.",
      });
    } catch (error) {
      console.error('Error unassigning worker:', error);
      toast({
        title: "Unassignment Failed",
        description: "Failed to remove worker from work order.",
        variant: "destructive"
      });
    }
  };

  const getWorkerWorkOrders = (workerId: string) => {
    return workOrders.filter(order => 
      order.assignedWorkerId === workerId && 
      order.status !== 'completed'
    );
  };

  const getAvailableWorkers = () => {
    return workers.filter(worker => worker.status === 'active');
  };

  return {
    assignWorkerToOrder,
    unassignWorkerFromOrder,
    getWorkerWorkOrders,
    getAvailableWorkers,
    workers,
    workOrders
  };
};
