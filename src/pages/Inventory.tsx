
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, AlertTriangle, Package, Download, Edit, Trash2 } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebase';
import { InventoryForm } from '@/components/Forms/InventoryForm';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Raw Materials': return 'bg-blue-100 text-blue-800';
    case 'Finished Goods': return 'bg-green-100 text-green-800';
    case 'Scrap': return 'bg-red-100 text-red-800';
    case 'Tools': return 'bg-purple-100 text-purple-800';
    case 'Work in Progress': return 'bg-orange-100 text-orange-800';
    case 'Components': return 'bg-cyan-100 text-cyan-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { data: inventory, loading, deleteDocument } = useFirestore(COLLECTIONS.INVENTORY);
  const { toast } = useToast();

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.category === selectedType;
    return matchesSearch && matchesType;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const exportData = filteredInventory.map(item => ({
        'Item Name': item.itemName,
        'Category': item.category,
        'Quantity': item.quantity,
        'Unit': item.unit,
        'Min Stock': item.minStock,
        'Max Stock': item.maxStock,
        'Supplier': item.supplier,
        'Location': item.location || 'N/A',
        'Status': item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'
      }));

      if (format === 'excel') {
        exportToExcel(exportData, 'inventory');
        toast({ title: "Success", description: "Inventory exported to Excel!" });
      } else {
        exportToPDF(exportData, 'inventory', 'Inventory Report');
        toast({ title: "Success", description: "Inventory exported to PDF!" });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Error", description: "Failed to export inventory", variant: "destructive" });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteDocument(itemId);
        toast({ title: "Success", description: "Inventory item deleted successfully!" });
      } catch (error) {
        console.error('Delete error:', error);
        toast({ title: "Error", description: "Failed to delete inventory item", variant: "destructive" });
      }
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedItem(null);
    setFormMode('create');
  };

  const getItemCounts = () => {
    const counts: Record<string, number> = {
      all: inventory.length,
      'Raw Materials': 0,
      'Finished Goods': 0,
      'Tools': 0,
      'Scrap': 0,
      'Work in Progress': 0,
      'Components': 0
    };

    inventory.forEach(item => {
      if (counts.hasOwnProperty(item.category)) {
        counts[item.category]++;
      }
    });

    return counts;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  const itemCounts = getItemCounts();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track raw materials, finished goods, and tools</p>
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
            Add Item
          </Button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-2">{lowStockItems.length} items are below minimum threshold:</p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="text-orange-800 border-orange-300">
                  {item.itemName} ({item.quantity} {item.unit})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedType} onValueChange={setSelectedType} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Items ({itemCounts.all})</TabsTrigger>
          <TabsTrigger value="Raw Materials">Raw Materials ({itemCounts['Raw Materials']})</TabsTrigger>
          <TabsTrigger value="Finished Goods">Finished Goods ({itemCounts['Finished Goods']})</TabsTrigger>
          <TabsTrigger value="Tools">Tools ({itemCounts['Tools']})</TabsTrigger>
          <TabsTrigger value="Scrap">Scrap ({itemCounts['Scrap']})</TabsTrigger>
          <TabsTrigger value="Work in Progress">WIP ({itemCounts['Work in Progress']})</TabsTrigger>
          <TabsTrigger value="Components">Components ({itemCounts['Components']})</TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <TabsContent value={selectedType} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Items ({filteredInventory.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(item.category)}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.minStock}/{item.maxStock}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.location || 'N/A'}</TableCell>
                      <TableCell>
                        {item.quantity <= item.minStock ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : item.quantity >= item.maxStock ? (
                          <Badge className="bg-blue-100 text-blue-800">Overstocked</Badge>
                        ) : (
                          <Badge variant="secondary">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(item.id)}
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
              {filteredInventory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No inventory items found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InventoryForm 
        open={showForm} 
        onOpenChange={handleFormClose}
        inventoryItem={selectedItem}
        mode={formMode}
      />
    </div>
  );
};
