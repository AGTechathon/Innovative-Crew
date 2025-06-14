
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MetricsCard } from '../components/Dashboard/MetricsCard';
import { LiveProductionChart } from '../components/Dashboard/LiveProductionChart';
import { WorkOrderStatus } from '../components/Dashboard/WorkOrderStatus';
import { WorkerAllocation } from '../components/Dashboard/WorkerAllocation';
import { InventoryAlerts } from '../components/Dashboard/InventoryAlerts';
import { ProductionMetrics } from '../components/Dashboard/ProductionMetrics';
import { SmartBanner } from '../components/Smart/SmartBanner';
import { VoiceCommands } from '../components/Smart/VoiceCommands';
import { QRScanner } from '../components/Smart/QRScanner';
import { PredictiveAlerts } from '../components/Smart/PredictiveAlerts';
import { FactoryBot } from '../components/Smart/FactoryBot';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Clock,
  Factory,
  AlertTriangle 
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [factoryBotMinimized, setFactoryBotMinimized] = useState(true);
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const { data: workers } = useFirestore(COLLECTIONS.WORKERS);
  const { data: inventory } = useFirestore(COLLECTIONS.INVENTORY);

  // Calculate dynamic metrics
  const todayProduction = workOrders.filter(wo => wo.status === 'completed').length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalWorkers = workers.length;
  const pendingOrders = workOrders.filter(wo => wo.status === 'pending').length;
  const lowStockItems = inventory.filter(item => item.quantity <= (item.reorderPoint || 50)).length;

  // Dynamic messages based on data
  const getDynamicMessage = () => {
    if (workOrders.length === 0) {
      return "All production lines are idle. Ready to start new orders!";
    }
    if (lowStockItems > 0) {
      return `⚠️ ${lowStockItems} inventory items are running low`;
    }
    if (pendingOrders > 5) {
      return `📋 ${pendingOrders} orders are pending - consider prioritizing`;
    }
    return `Production running smoothly with ${activeWorkers} active workers`;
  };

  const getEfficiencyRate = () => {
    if (workOrders.length === 0) return "0%";
    const completedOrders = workOrders.filter(wo => wo.status === 'completed').length;
    const totalOrders = workOrders.length;
    return `${Math.round((completedOrders / totalOrders) * 100)}%`;
  };

  const handleVoiceCommand = (command: string, data?: any) => {
    console.log('Voice command received:', command, data);
    // Handle voice commands - could navigate to specific pages or perform actions
  };

  const handleQRScan = (data: string) => {
    console.log('QR code scanned:', data);
    // Handle QR scan data - could auto-fill forms or navigate to item details
  };

  return (
    <div className="p-6 space-y-6">
      {/* Smart Banner */}
      <SmartBanner />

      {/* Header with Dynamic Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Production Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! {getDynamicMessage()}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Production</span>
        </div>
      </div>

      {/* Enhanced Metrics Cards with Dynamic Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Today's Production"
          value={todayProduction.toString()}
          subtitle="units completed"
          icon={Factory}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricsCard
          title="Active Workers"
          value={`${activeWorkers}`}
          subtitle={`out of ${totalWorkers} total`}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricsCard
          title="Efficiency Rate"
          value={getEfficiencyRate()}
          subtitle="vs 85% target"
          icon={TrendingUp}
          trend={{ value: 2.5, isPositive: getEfficiencyRate() !== "0%" }}
        />
        <MetricsCard
          title="Pending Orders"
          value={pendingOrders.toString()}
          subtitle="due this week"
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      {/* Smart Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VoiceCommands onCommand={handleVoiceCommand} />
        <QRScanner onScan={handleQRScan} />
        <PredictiveAlerts />
      </div>

      {/* Production Metrics */}
      <ProductionMetrics />

      {/* Charts and Live Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveProductionChart />
        <WorkOrderStatus />
      </div>

      {/* Worker and Inventory Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkerAllocation />
        <InventoryAlerts />
      </div>

      {/* FactoryBot Smart Assistant */}
      <FactoryBot 
        isMinimized={factoryBotMinimized}
        onToggleSize={() => setFactoryBotMinimized(!factoryBotMinimized)}
      />
    </div>
  );
};
