
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockWorkOrders = [
  { id: 'WO-001', product: 'Steel Brackets', progress: 85, status: 'in-progress', priority: 'high' },
  { id: 'WO-002', product: 'Aluminum Sheets', progress: 45, status: 'in-progress', priority: 'medium' },
  { id: 'WO-003', product: 'Copper Pipes', progress: 100, status: 'completed', priority: 'low' },
  { id: 'WO-004', product: 'Plastic Components', progress: 20, status: 'pending', priority: 'urgent' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-blue-100 text-blue-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const WorkOrderStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Work Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockWorkOrders.map((order) => (
          <div key={order.id} className="space-y-2 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="font-medium">{order.id}</div>
              <div className="flex gap-2">
                <Badge className={getPriorityColor(order.priority)}>
                  {order.priority}
                </Badge>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{order.product}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{order.progress}%</span>
              </div>
              <Progress value={order.progress} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
