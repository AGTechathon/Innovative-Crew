
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface WorkerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker?: any;
  mode?: 'create' | 'edit';
}

export const WorkerForm = ({ open, onOpenChange, worker, mode = 'create' }: WorkerFormProps) => {
  const { user } = useAuth();
  const { addDocument, updateDocument } = useFirestore(COLLECTIONS.WORKERS);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    shift: '',
    skills: '',
    role: 'worker'
  });

  useEffect(() => {
    if (mode === 'edit' && worker) {
      setFormData({
        name: worker.name || '',
        email: worker.email || '',
        employeeId: worker.employeeId || '',
        department: worker.department || '',
        shift: worker.shift || '',
        skills: Array.isArray(worker.skills) ? worker.skills.join(', ') : (worker.skills || ''),
        role: worker.role || 'worker'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        department: '',
        shift: '',
        skills: '',
        role: 'worker'
      });
    }
  }, [mode, worker, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const workerData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        status: 'active',
        factoryId: user?.factoryId
      };

      if (mode === 'edit' && worker) {
        await updateDocument(worker.id, workerData);
      } else {
        await addDocument(workerData);
      }
      
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        department: '',
        shift: '',
        skills: '',
        role: 'worker'
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving worker:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john.doe@factory.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              placeholder="EMP-001"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Quality Control">Quality Control</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Assembly">Assembly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning (6 AM - 2 PM)</SelectItem>
                <SelectItem value="Evening">Evening (2 PM - 10 PM)</SelectItem>
                <SelectItem value="Night">Night (10 PM - 6 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worker">Worker</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              placeholder="Welding, Assembly, Quality Control"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update Worker' : 'Add Worker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
