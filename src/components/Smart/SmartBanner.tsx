
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Mic, QrCode, TrendingUp } from 'lucide-react';

export const SmartBanner = () => {
  return (
    <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-bold text-lg text-gray-800">
                  Not just an ERP — this is your factory's smart digital assistant 🚀
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Mic className="h-4 w-4" />
                    Voice Commands
                  </span>
                  <span className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    QR Scanning
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Predictive Analytics
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    AI Insights
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">
            Smart Manufacturing
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
