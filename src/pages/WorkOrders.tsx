
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Eye, Download, Trash2 } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { WorkOrderForm } from '@/components/Forms/WorkOrderForm';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'in-progress': return 'bg-blue-500';
    case 'pending': return 'bg-yellow-500';
    case 'on-hold': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const { data: workOrders, loading, deleteDocument } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const { toast } = useToast();

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const exportData = filteredOrders.map(order => ({
        'Order Number': order.orderNumber,
        'Product': order.productName,
        'Quantity': order.quantity,
        'Priority': order.priority,
        'Status': order.status,
        'Progress': `${order.progress || 0}%`,
        'Due Date': order.dueDate?.toDate?.()?.toLocaleDateString() || order.dueDate,
        'Assigned Worker': order.assignedWorker
      }));

      if (format === 'excel') {
        exportToExcel(exportData, 'work-orders');
        toast({ title: "Success", description: "Work orders exported to Excel!" });
      } else {
        exportToPDF(exportData, 'work-orders', 'Work Orders Report');
        toast({ title: "Success", description: "Work orders exported to PDF!" });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Error", description: "Failed to export work orders", variant: "destructive" });
    }
  };

  const handleDelete = async (workOrderId: string) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await deleteDocument(workOrderId);
        toast({ title: "Success", description: "Work order deleted successfully!" });
      } catch (error) {
        console.error('Delete error:', error);
        toast({ title: "Error", description: "Failed to delete work order", variant: "destructive" });
      }
    }
  };

  const handleEdit = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleView = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setFormMode('view');
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedWorkOrder(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedWorkOrder(null);
    setFormMode('create');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading work orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Manage and track all production orders</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({workOrders.filter(o => o.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({workOrders.filter(o => o.status === 'in-progress').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({workOrders.filter(o => o.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold ({workOrders.filter(o => o.status === 'on-hold').length})</TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <TabsContent value={selectedStatus} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders List ({filteredOrders.length} orders)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${order.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{order.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.dueDate?.toDate?.()?.toLocaleDateString() || order.dueDate}
                      </TableCell>
                      <TableCell>{order.assignedWorker}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleView(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status !== 'completed' && (
                            <Button variant="outline" size="sm" onClick={() => handleEdit(order)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No work orders found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <WorkOrderForm 
        open={showForm} 
        onOpenChange={handleFormClose}
        workOrder={selectedWorkOrder}
        mode={formMode}
      />
    </div>
  );
};
