
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface WorkOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: any;
  mode?: 'create' | 'edit' | 'view';
}

export const WorkOrderForm = ({ open, onOpenChange, workOrder, mode = 'create' }: WorkOrderFormProps) => {
  const { user } = useAuth();
  const { addDocument, updateDocument } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const [formData, setFormData] = useState({
    orderNumber: '',
    productName: '',
    quantity: '',
    priority: '',
    status: 'pending',
    dueDate: '',
    assignedWorker: '',
    progress: 0
  });

  useEffect(() => {
    if (workOrder && mode !== 'create') {
      setFormData({
        orderNumber: workOrder.orderNumber || '',
        productName: workOrder.productName || '',
        quantity: workOrder.quantity?.toString() || '',
        priority: workOrder.priority || '',
        status: workOrder.status || 'pending',
        dueDate: workOrder.dueDate?.toDate?.()?.toISOString().split('T')[0] || workOrder.dueDate || '',
        assignedWorker: workOrder.assignedWorker || '',
        progress: workOrder.progress || 0
      });
    } else {
      setFormData({
        orderNumber: `WO-${Date.now().toString().slice(-6)}`,
        productName: '',
        quantity: '',
        priority: '',
        status: 'pending',
        dueDate: '',
        assignedWorker: '',
        progress: 0
      });
    }
  }, [workOrder, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        dueDate: new Date(formData.dueDate),
        factoryId: user?.factoryId,
        progress: formData.progress
      };

      if (mode === 'edit' && workOrder?.id) {
        await updateDocument(workOrder.id, submitData);
      } else {
        await addDocument(submitData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving work order:', error);
    }
  };

  const handleComplete = async () => {
    if (workOrder?.id) {
      try {
        await updateDocument(workOrder.id, {
          status: 'completed',
          progress: 100,
          completedDate: new Date()
        });
        onOpenChange(false);
      } catch (error) {
        console.error('Error completing work order:', error);
      }
    }
  };

  const isCompleted = workOrder?.status === 'completed';
  const isViewMode = mode === 'view';
  const isEditDisabled = isCompleted || isViewMode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {mode === 'create' ? 'Create New Work Order' : 
               mode === 'edit' ? 'Edit Work Order' : 'View Work Order'}
            </span>
            {isCompleted && <Badge className="bg-green-500 text-white">Completed</Badge>}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              value={formData.orderNumber}
              onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              placeholder="WO-001"
              required
              disabled={mode !== 'create'}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
              placeholder="Steel Pipes"
              required
              disabled={isEditDisabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="100"
              required
              disabled={isEditDisabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData({...formData, priority: value})}
              disabled={isEditDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode !== 'create' && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
                disabled={isCompleted}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode !== 'create' && !isCompleted && (
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                disabled={isCompleted}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
              disabled={isEditDisabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedWorker">Assigned Worker</Label>
            <Input
              id="assignedWorker"
              value={formData.assignedWorker}
              onChange={(e) => setFormData({...formData, assignedWorker: e.target.value})}
              placeholder="John Doe"
              required
              disabled={isEditDisabled}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && !isCompleted && (
              <Button type="submit">
                {mode === 'edit' ? 'Update Work Order' : 'Create Work Order'}
              </Button>
            )}
            {mode !== 'create' && !isCompleted && (
              <Button type="button" onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Mark Complete
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
