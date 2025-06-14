import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Users, UserCheck, Download, Edit, Trash2 } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { WorkerForm } from '@/components/Forms/WorkerForm';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

export const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { data: workers, loading, deleteDocument } = useFirestore(COLLECTIONS.WORKERS);
  const { data: workOrders } = useFirestore(COLLECTIONS.WORK_ORDERS);
  const { toast } = useToast();

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalWorkers = workers.length;

  const getWorkerCurrentTask = (workerId: string) => {
    const assignedOrder = workOrders.find(wo => 
      wo.assignedWorkerId === workerId && 
      wo.status === 'in-progress'
    );
    return assignedOrder ? `Running Order #${assignedOrder.orderNumber}` : 'Available';
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const exportData = filteredWorkers.map(worker => ({
        'Name': worker.name,
        'Employee ID': worker.employeeId,
        'Email': worker.email,
        'Department': worker.department,
        'Role': worker.role,
        'Shift': worker.shift,
        'Skills': Array.isArray(worker.skills) ? worker.skills.join(', ') : worker.skills,
        'Status': worker.status,
        'Current Task': getWorkerCurrentTask(worker.id)
      }));

      if (format === 'excel') {
        exportToExcel(exportData, 'workers');
        toast({ title: "Success", description: "Workers exported to Excel!" });
      } else {
        exportToPDF(exportData, 'workers', 'Workers Report');
        toast({ title: "Success", description: "Workers exported to PDF!" });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Error", description: "Failed to export workers", variant: "destructive" });
    }
  };

  const handleDelete = async (workerId: string, workerName: string) => {
    try {
      // Check if worker has assigned work orders
      const assignedOrders = workOrders.filter(wo => wo.assignedWorkerId === workerId);
      
      if (assignedOrders.length > 0) {
        toast({
          title: "Cannot Delete Worker",
          description: `${workerName} has ${assignedOrders.length} assigned work order(s). Reassign or complete them first.`,
          variant: "destructive"
        });
        return;
      }

      await deleteDocument(workerId);
      toast({
        title: "Worker Deleted",
        description: `${workerName} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete worker",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (worker: any) => {
    setSelectedWorker(worker);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedWorker(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedWorker(null);
    setFormMode('create');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workers Management</h1>
          <p className="text-muted-foreground">Manage workforce and track allocations</p>
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
            Add Worker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkers}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(workers.map(w => w.department)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workers List ({filteredWorkers.length} workers)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Task</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{worker.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-sm text-muted-foreground">{worker.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{worker.employeeId}</TableCell>
                  <TableCell className="capitalize">{worker.role}</TableCell>
                  <TableCell>{worker.department}</TableCell>
                  <TableCell>{worker.shift}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(worker.skills) ? 
                        worker.skills.slice(0, 2).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        )) : 
                        <Badge variant="outline" className="text-xs">{worker.skills}</Badge>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={worker.status === 'active' ? "default" : "secondary"}>
                      {worker.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getWorkerCurrentTask(worker.id)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(worker)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {worker.name}? This action cannot be undone.
                              {workOrders.filter(wo => wo.assignedWorkerId === worker.id).length > 0 && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                                  ⚠️ This worker has assigned work orders. Please reassign them first.
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(worker.id, worker.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Worker
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredWorkers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workers found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <WorkerForm 
        open={showForm} 
        onOpenChange={handleFormClose}
        worker={selectedWorker}
        mode={formMode}
      />
    </div>
  );
};
