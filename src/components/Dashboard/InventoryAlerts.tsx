
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockInventoryAlerts = [
  { item: 'Steel Sheets', current: 15, threshold: 50, unit: 'pieces', severity: 'high' },
  { item: 'Aluminum Rods', current: 25, threshold: 40, unit: 'kg', severity: 'medium' },
  { item: 'Welding Wire', current: 8, threshold: 20, unit: 'rolls', severity: 'high' },
  { item: 'Safety Gloves', current: 12, threshold: 30, unit: 'pairs', severity: 'medium' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const InventoryAlerts = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockInventoryAlerts.map((alert, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/50">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
              <div>
                <div className="font-medium text-sm">{alert.item}</div>
                <div className="text-xs text-muted-foreground">
                  {alert.current} {alert.unit} remaining
                </div>
              </div>
            </div>
            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
              Low Stock
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
