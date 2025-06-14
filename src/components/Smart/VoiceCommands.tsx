
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';

interface VoiceCommandsProps {
  onCommand?: (command: string, data?: any) => void;
}

export const VoiceCommands = ({ onCommand }: VoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const { data: inventory } = useFirestore(COLLECTIONS.INVENTORY);
  const { data: workers } = useFirestore(COLLECTIONS.WORKERS);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setLastCommand(command);
        processVoiceCommand(command);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice command. Please try again.",
          variant: "destructive"
        });
      };

      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Voice Commands Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }
  }, []);

  const processVoiceCommand = (command: string) => {
    console.log('Processing command:', command);
    
    // Start order commands
    if (command.includes('start order')) {
      const orderMatch = command.match(/start order (\w+)/);
      if (orderMatch) {
        const orderNumber = orderMatch[1];
        const order = workOrders.find(wo => wo.orderNumber?.toLowerCase().includes(orderNumber.toLowerCase()));
        if (order) {
          onCommand?.('start_order', order);
          toast({
            title: "Order Started",
            description: `Work order ${order.orderNumber} has been started.`,
          });
        } else {
          toast({
            title: "Order Not Found",
            description: `Could not find order ${orderNumber}.`,
            variant: "destructive"
          });
        }
      }
    }
    
    // Show stock commands
    else if (command.includes('show') && command.includes('stock')) {
      const materialMatch = command.match(/show (\w+) stock/);
      if (materialMatch) {
        const material = materialMatch[1];
        const item = inventory.find(inv => inv.name?.toLowerCase().includes(material.toLowerCase()));
        if (item) {
          onCommand?.('show_stock', item);
          toast({
            title: "Stock Information",
            description: `${item.name}: ${item.quantity} ${item.unit} available`,
          });
        } else {
          toast({
            title: "Item Not Found",
            description: `Could not find ${material} in inventory.`,
            variant: "destructive"
          });
        }
      }
    }
    
    // Assign worker commands
    else if (command.includes('assign worker')) {
      const workerMatch = command.match(/assign worker (\w+)/);
      if (workerMatch) {
        const workerName = workerMatch[1];
        const worker = workers.find(w => w.name?.toLowerCase().includes(workerName.toLowerCase()));
        if (worker) {
          onCommand?.('assign_worker', worker);
          toast({
            title: "Worker Assignment",
            description: `Ready to assign ${worker.name} to a work order.`,
          });
        }
      }
    }
    
    // Default response for unrecognized commands
    else {
      toast({
        title: "Command Not Recognized",
        description: "Try commands like 'Start Order 112', 'Show steel stock', or 'Assign worker John'",
        variant: "destructive"
      });
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="h-5 w-5 text-blue-600" />
          Voice Commands
          <Badge variant="outline" className="ml-auto text-xs">
            Smart Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Stop Listening' : 'Start Voice Command'}
          </Button>
          
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Listening...
            </div>
          )}
        </div>
        
        {lastCommand && (
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            <strong>Last command:</strong> "{lastCommand}"
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <div><strong>Try saying:</strong></div>
          <div>• "Start Order 112"</div>
          <div>• "Show steel stock"</div>
          <div>• "Assign worker to Line B"</div>
        </div>
      </CardContent>
    </Card>
  );
};
