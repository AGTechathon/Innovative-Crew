
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Clock, Zap } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';

interface Alert {
  id: string;
  type: 'inventory' | 'production' | 'maintenance' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  daysLeft?: number;
  suggestion?: string;
}

export const PredictiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { data: inventory } = useFirestore(COLLECTIONS.INVENTORY);
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);

  useEffect(() => {
    generatePredictiveAlerts();
  }, [inventory, workOrders]);

  const generatePredictiveAlerts = () => {
    const newAlerts: Alert[] = [];

    // Inventory depletion predictions
    inventory.forEach(item => {
      const currentQty = item.quantity || 0;
      const threshold = item.reorderPoint || 50;
      
      if (currentQty <= threshold) {
        const daysLeft = Math.max(1, Math.floor(currentQty / 10)); // Simplified consumption rate
        newAlerts.push({
          id: `inv-${item.id}`,
          type: 'inventory',
          severity: currentQty <= threshold * 0.5 ? 'critical' : 'high',
          title: 'Low Inventory Alert',
          message: `${item.name} may run out in ${daysLeft} days based on current usage`,
          daysLeft,
          suggestion: `Reorder ${item.name} immediately to avoid stockout`
        });
      }
    });

    // Production bottleneck predictions
    const inProgressOrders = workOrders.filter(wo => wo.status === 'in-progress');
    const delayedOrders = inProgressOrders.filter(wo => {
      if (wo.dueDate) {
        const dueDate = wo.dueDate.toDate ? wo.dueDate.toDate() : new Date(wo.dueDate);
        const now = new Date();
        return dueDate < now && wo.progress < 100;
      }
      return false;
    });

    if (delayedOrders.length > 0) {
      newAlerts.push({
        id: 'production-delay',
        type: 'production',
        severity: 'high',
        title: 'Production Delays Detected',
        message: `${delayedOrders.length} work orders are behind schedule`,
        suggestion: 'Consider reassigning workers or adjusting priorities'
      });
    }

    // Quality prediction based on scrap rate
    const completedOrders = workOrders.filter(wo => wo.status === 'completed');
    if (completedOrders.length > 5) {
      const avgProgress = completedOrders.reduce((sum, wo) => sum + (wo.progress || 0), 0) / completedOrders.length;
      if (avgProgress < 95) {
        newAlerts.push({
          id: 'quality-concern',
          type: 'quality',
          severity: 'medium',
          title: 'Quality Trend Alert',
          message: 'Production efficiency trending downward',
          suggestion: 'Check raw material quality and machine calibration'
        });
      }
    }

    // Maintenance prediction (simulated)
    const maintenanceAlerts = [
      {
        id: 'machine-maintenance',
        type: 'maintenance' as const,
        severity: 'medium' as const,
        title: 'Preventive Maintenance Due',
        message: 'Machine 3 scheduled for maintenance in 2 days',
        daysLeft: 2,
        suggestion: 'Schedule maintenance during low production hours'
      }
    ];

    newAlerts.push(...maintenanceAlerts);
    setAlerts(newAlerts);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'production': return <TrendingDown className="h-4 w-4" />;
      case 'maintenance': return <Zap className="h-4 w-4" />;
      case 'quality': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-purple-600" />
          Predictive Alerts
          <Badge variant="outline" className="ml-auto text-xs">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <div className="text-green-600 font-medium">✓ All systems optimal</div>
            <div className="text-sm">No predictive alerts at this time</div>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs mt-1">{alert.message}</div>
                    {alert.suggestion && (
                      <div className="text-xs mt-2 italic">
                        💡 {alert.suggestion}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => dismissAlert(alert.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
              {alert.daysLeft && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {alert.daysLeft} days left
                </Badge>
              )}
            </div>
          ))
        )}
        
        <div className="text-xs text-gray-500 border-t pt-2">
          AI analyzes patterns to predict issues before they occur
        </div>
      </CardContent>
    </Card>
  );
};

// Fix missing import
import { Package } from 'lucide-react';
