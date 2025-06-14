
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { TrendingUp, Package, Clock, CheckCircle } from 'lucide-react';

export const ProductionMetrics = () => {
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0,
    pendingOrders: 0,
    averageProgress: 0,
    totalQuantity: 0
  });

  useEffect(() => {
    if (workOrders.length > 0) {
      const completed = workOrders.filter(order => order.status === 'completed').length;
      const inProgress = workOrders.filter(order => order.status === 'in-progress').length;
      const pending = workOrders.filter(order => order.status === 'pending').length;
      
      const totalProgress = workOrders.reduce((sum, order) => sum + (order.progress || 0), 0);
      const avgProgress = workOrders.length > 0 ? Math.round(totalProgress / workOrders.length) : 0;
      
      const totalQty = workOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);

      setMetrics({
        totalOrders: workOrders.length,
        completedOrders: completed,
        inProgressOrders: inProgress,
        pendingOrders: pending,
        averageProgress: avgProgress,
        totalQuantity: totalQty
      });
    }
  }, [workOrders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          <div className="text-xs text-muted-foreground">
            {metrics.totalQuantity} total units
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.completedOrders}</div>
          <div className="text-xs text-muted-foreground">
            {metrics.totalOrders > 0 ? Math.round((metrics.completedOrders / metrics.totalOrders) * 100) : 0}% completion rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.inProgressOrders}</div>
          <div className="text-xs text-muted-foreground">
            Active work orders
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{metrics.pendingOrders}</div>
          <div className="text-xs text-muted-foreground">
            Awaiting start
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Progress
            <Badge variant="outline">{metrics.averageProgress}% Average</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={metrics.averageProgress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
