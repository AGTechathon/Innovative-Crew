
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useFirestore = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(documents);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
        // Only show error toast, not on every reload
        if (err.code !== 'permission-denied') {
          toast({
            title: "Database Error",
            description: "Failed to load data. Please refresh the page.",
            variant: "destructive"
          });
        }
      });
    } catch (err: any) {
      console.error('Firestore setup error:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName]); // Removed toast from dependencies to prevent unnecessary re-renders

  const addDocument = async (documentData: any, showToast: boolean = true) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...documentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Only show toast if explicitly requested (on user action, not on reload)
      if (showToast) {
        toast({
          title: "Success",
          description: getSuccessMessage(collectionName, 'added'),
        });
      }
      
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding document:', err);
      if (showToast) {
        toast({
          title: "Error",
          description: `Failed to add ${getItemType(collectionName)}: ${err.message}`,
          variant: "destructive"
        });
      }
      throw err;
    }
  };

  const updateDocument = async (docId: string, updateData: any, showToast: boolean = true) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...updateData,
        updatedAt: new Date()
      });
      
      if (showToast) {
        toast({
          title: "Success",
          description: getSuccessMessage(collectionName, 'updated'),
        });
      }
    } catch (err: any) {
      console.error('Error updating document:', err);
      if (showToast) {
        toast({
          title: "Error",
          description: `Failed to update ${getItemType(collectionName)}: ${err.message}`,
          variant: "destructive"
        });
      }
      throw err;
    }
  };

  const deleteDocument = async (docId: string, showToast: boolean = true) => {
    try {
      // Optimistic update - remove from local state immediately
      setData(prevData => prevData.filter(item => item.id !== docId));
      
      await deleteDoc(doc(db, collectionName, docId));
      
      if (showToast) {
        toast({
          title: "Success",
          description: getSuccessMessage(collectionName, 'deleted'),
        });
      }
    } catch (err: any) {
      console.error('Error deleting document:', err);
      // Revert optimistic update on error
      setData(prevData => [...prevData]);
      if (showToast) {
        toast({
          title: "Error",
          description: `Failed to delete ${getItemType(collectionName)}: ${err.message}`,
          variant: "destructive"
        });
      }
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  };
};

// Helper functions for better user feedback
const getItemType = (collectionName: string): string => {
  const types: Record<string, string> = {
    'workOrders': 'work order',
    'inventory': 'inventory item',
    'workers': 'worker',
    'users': 'user',
    'machines': 'machine',
    'productionMetrics': 'production metric'
  };
  return types[collectionName] || 'item';
};

const getSuccessMessage = (collectionName: string, action: string): string => {
  const itemType = getItemType(collectionName);
  const capitalizedItemType = itemType.charAt(0).toUpperCase() + itemType.slice(1);
  return `${capitalizedItemType} ${action} successfully!`;
};
