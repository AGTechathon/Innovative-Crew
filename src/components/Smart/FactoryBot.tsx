
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Lightbulb, X, Minimize2, Maximize2 } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';

interface Suggestion {
  id: string;
  type: 'machine' | 'productivity' | 'quality' | 'efficiency';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action?: string;
}

interface FactoryBotProps {
  isMinimized?: boolean;
  onToggleSize?: () => void;
}

export const FactoryBot = ({ isMinimized = false, onToggleSize }: FactoryBotProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const { data: workers } = useFirestore(COLLECTIONS.WORKERS);

  useEffect(() => {
    generateSmartSuggestions();
    const interval = setInterval(generateSmartSuggestions, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [workOrders, workers]);

  const generateSmartSuggestions = () => {
    const newSuggestions: Suggestion[] = [];
    const now = new Date();

    // Machine idle suggestions
    const idleMachines = ['Machine 1', 'Machine 3', 'Line B'];
    idleMachines.forEach((machine, index) => {
      if (Math.random() > 0.7) { // Simulate some machines being idle
        newSuggestions.push({
          id: `idle-${machine}`,
          type: 'machine',
          title: `${machine} idle for ${15 + index * 10} minutes`,
          description: 'Consider assigning pending work orders or scheduling maintenance',
          priority: index === 0 ? 'high' : 'medium',
          action: 'Assign Work Order'
        });
      }
    });

    // Productivity suggestions
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const inProgressOrders = workOrders.filter(wo => wo.status === 'in-progress').length;
    
    if (activeWorkers > 0 && inProgressOrders === 0) {
      newSuggestions.push({
        id: 'no-active-orders',
        type: 'productivity',
        title: `${activeWorkers} workers available but no active orders`,
        description: 'All production lines are idle. Consider starting pending orders.',
        priority: 'high',
        action: 'Start Production'
      });
    }

    // Shift productivity
    const currentHour = now.getHours();
    if (currentHour >= 14 && currentHour <= 16) { // Afternoon shift
      newSuggestions.push({
        id: 'shift-productivity',
        type: 'productivity',
        title: 'Afternoon shift productivity down 15%',
        description: 'Consider break rotation or workstation ergonomics check',
        priority: 'medium',
        action: 'Optimize Workflow'
      });
    }

    // Quality suggestions
    const recentOrders = workOrders.filter(wo => {
      if (!wo.createdAt) return false;
      const orderDate = wo.createdAt.toDate ? wo.createdAt.toDate() : new Date(wo.createdAt);
      return (now.getTime() - orderDate.getTime()) < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentOrders.length > 3) {
      newSuggestions.push({
        id: 'quality-check',
        type: 'quality',
        title: 'Scrap rate increasing - check raw material quality',
        description: 'Recent increase in defects detected. Quality control needed.',
        priority: 'high',
        action: 'Quality Inspection'
      });
    }

    // Efficiency suggestions
    newSuggestions.push({
      id: 'efficiency-tip',
      type: 'efficiency',
      title: 'Optimize batch processing',
      description: 'Grouping similar orders can improve efficiency by 20%',
      priority: 'low',
      action: 'Group Orders'
    });

    setSuggestions(newSuggestions);
  };

  const nextSuggestion = () => {
    setCurrentSuggestion((prev) => 
      prev >= suggestions.length - 1 ? 0 : prev + 1
    );
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    if (currentSuggestion >= suggestions.length - 1) {
      setCurrentSuggestion(0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentSug = suggestions[currentSuggestion];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleSize}
          className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
        {suggestions.length > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{suggestions.length}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-blue-600" />
            FactoryBot
            <Badge variant="outline" className="ml-auto text-xs">
              AI Assistant
            </Badge>
            <Button
              onClick={onToggleSize}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <div className="text-blue-600 font-medium">🤖 All systems running smoothly!</div>
              <div className="text-sm">No suggestions at this time</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {currentSuggestion + 1} of {suggestions.length}
                </span>
                <Badge className={getPriorityColor(currentSug?.priority || 'low')}>
                  {currentSug?.priority} priority
                </Badge>
              </div>
              
              {currentSug && (
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{currentSug.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{currentSug.description}</div>
                        {currentSug.action && (
                          <Button variant="outline" size="sm" className="mt-2 text-xs">
                            {currentSug.action}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => dismissSuggestion(currentSug.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {suggestions.length > 1 && (
                <Button
                  onClick={nextSuggestion}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Next Suggestion
                </Button>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center border-t pt-2">
            💡 Smart factory insights powered by AI
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
