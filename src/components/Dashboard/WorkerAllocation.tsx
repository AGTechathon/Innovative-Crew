
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'break': return 'bg-yellow-100 text-yellow-800';
    case 'offline': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const WorkerAllocation = () => {
  const { data: workers } = useFirestore(COLLECTIONS.WORKERS);
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);

  const getWorkerCurrentTask = (workerId: string) => {
    const assignedOrder = workOrders.find(wo => 
      wo.assignedWorkerId === workerId && 
      wo.status === 'in-progress'
    );
    return assignedOrder ? `Running Order #${assignedOrder.orderNumber}` : 'Available';
  };

  // Show only first 5 workers for dashboard view
  const displayWorkers = workers.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayWorkers.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No workers found. Add workers to see their allocation.
          </div>
        ) : (
          displayWorkers.map((worker) => (
            <div key={worker.id} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {worker.name?.split(' ').map(n => n[0]).join('') || 'W'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{worker.name}</div>
                  <div className="text-xs text-muted-foreground">{worker.department}</div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge className={getStatusColor(worker.status)}>
                  {worker.status}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {getWorkerCurrentTask(worker.id)}
                </div>
              </div>
            </div>
          ))
        )}
        {workers.length > 5 && (
          <div className="text-center text-sm text-gray-500">
            +{workers.length - 5} more workers
          </div>
        )}
      </CardContent>
    </Card>
  );
};
