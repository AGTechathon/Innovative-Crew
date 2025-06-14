
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '06:00', production: 45, target: 50 },
  { time: '08:00', production: 78, target: 80 },
  { time: '10:00', production: 92, target: 90 },
  { time: '12:00', production: 86, target: 85 },
  { time: '14:00', production: 95, target: 95 },
  { time: '16:00', production: 88, target: 90 },
  { time: '18:00', production: 76, target: 75 },
];

export const LiveProductionChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Production Tracking
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="production" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Actual Production"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
