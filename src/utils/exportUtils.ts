
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data: any[], filename: string) => {
  try {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Data');
    writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
};

export const exportToPDF = (data: any[], filename: string, title: string) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Prepare table data
    if (data.length > 0) {
      const columns = Object.keys(data[0]).filter(key => key !== 'id');
      const rows = data.map(item => columns.map(col => item[col] || ''));
      
      // Add table
      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
};

export const exportAllData = async (collections: string[]) => {
  // This would fetch all data from Firebase collections and export
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `manufacturing_data_${timestamp}`;
  
  // For now, return sample data structure
  const sampleData = {
    workOrders: [],
    inventory: [],
    workers: [],
    users: []
  };
  
  return { filename, data: sampleData };
};
