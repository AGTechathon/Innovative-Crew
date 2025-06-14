
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScan?: (data: string) => void;
  isActive?: boolean;
  onToggle?: () => void;
}

export const QRScanner = ({ onScan, isActive = false, onToggle }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        toast({
          title: "QR Scanner Active",
          description: "Point camera at QR code to scan inventory items",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateQRScan = (type: string) => {
    const mockData = {
      inventory: JSON.stringify({
        id: 'INV-001',
        name: 'Steel Sheets',
        category: 'Raw Material',
        quantity: 100,
        unit: 'pieces'
      }),
      workorder: JSON.stringify({
        id: 'WO-001',
        orderNumber: 'ORD-112',
        productName: 'Steel Brackets',
        status: 'pending'
      })
    };

    const data = mockData[type as keyof typeof mockData];
    setLastScan(data);
    onScan?.(data);
    
    toast({
      title: "QR Code Scanned",
      description: `${type === 'inventory' ? 'Inventory item' : 'Work order'} details loaded automatically`,
    });
  };

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-green-600" />
          QR Code Scanner
          <Badge variant="outline" className="ml-auto text-xs">
            Smart Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isScanning ? (
          <div className="space-y-3">
            <Button
              onClick={startScanner}
              className="w-full flex items-center gap-2"
              variant="default"
            >
              <Camera className="h-4 w-4" />
              Start QR Scanner
            </Button>
            
            <div className="text-xs text-gray-500 text-center">Or try demo scans:</div>
            <div className="flex gap-2">
              <Button
                onClick={() => simulateQRScan('inventory')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Demo Inventory
              </Button>
              <Button
                onClick={() => simulateQRScan('workorder')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Demo Work Order
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-32 bg-black rounded border"
              />
              <div className="absolute inset-0 border-2 border-green-500 border-dashed rounded pointer-events-none flex items-center justify-center">
                <div className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  Point at QR Code
                </div>
              </div>
            </div>
            
            <Button
              onClick={stopScanner}
              variant="destructive"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Stop Scanner
            </Button>
          </div>
        )}
        
        {lastScan && (
          <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
            <strong>Last scan:</strong> {lastScan.substring(0, 100)}...
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Scan QR codes to auto-fill inventory or work order details
        </div>
      </CardContent>
    </Card>
  );
};
