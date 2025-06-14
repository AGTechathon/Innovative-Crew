
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem?: any;
  mode?: 'create' | 'edit';
}

const INVENTORY_CATEGORIES = [
  'Raw Materials',
  'Finished Goods', 
  'Tools',
  'Scrap',
  'Work in Progress',
  'Components'
];

const INVENTORY_UNITS = [
  'pieces',
  'kg',
  'tons',
  'meters',
  'liters',
  'boxes',
  'pallets',
  'rolls',
  'sheets'
];

export const InventoryForm = ({ open, onOpenChange, inventoryItem, mode = 'create' }: InventoryFormProps) => {
  const { user } = useAuth();
  const { addDocument, updateDocument } = useFirestore(COLLECTIONS.INVENTORY);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: '',
    unit: '',
    minStock: '',
    maxStock: '',
    supplier: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (inventoryItem && mode === 'edit') {
      setFormData({
        itemName: inventoryItem.itemName || '',
        category: inventoryItem.category || '',
        quantity: inventoryItem.quantity?.toString() || '',
        unit: inventoryItem.unit || '',
        minStock: inventoryItem.minStock?.toString() || '',
        maxStock: inventoryItem.maxStock?.toString() || '',
        supplier: inventoryItem.supplier || '',
        location: inventoryItem.location || '',
        description: inventoryItem.description || ''
      });
    } else {
      setFormData({
        itemName: '',
        category: '',
        quantity: '',
        unit: '',
        minStock: '',
        maxStock: '',
        supplier: '',
        location: '',
        description: ''
      });
    }
  }, [inventoryItem, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        maxStock: parseInt(formData.maxStock),
        factoryId: user?.factoryId,
        lastUpdated: new Date()
      };

      if (mode === 'edit' && inventoryItem?.id) {
        await updateDocument(inventoryItem.id, submitData);
      } else {
        await addDocument(submitData);
      }
      
      setFormData({
        itemName: '',
        category: '',
        quantity: '',
        unit: '',
        minStock: '',
        maxStock: '',
        supplier: '',
        location: '',
        description: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                placeholder="Steel Bars"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="100"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                placeholder="10"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxStock">Maximum Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({...formData, maxStock: e.target.value})}
                placeholder="1000"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              placeholder="MetalCorp Inc"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Storage Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Warehouse A, Section 1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Additional notes about the item"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
