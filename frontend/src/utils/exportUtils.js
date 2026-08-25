/**
 * Utility to convert an array of objects to a CSV string and trigger a download.
 *
 * @param {Array<Object>} data - The array of objects to export.
 * @param {string} filename - The name of the file to be downloaded (e.g., 'export.csv').
 */
export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data to export.');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Convert data to CSV format
  const csvRows = [];
  
  // 1. Add headers row
  csvRows.push(headers.join(','));

  // 2. Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      
      // Handle null/undefined
      if (val === null || val === undefined) {
        val = '';
      } 
      // Handle arrays (join them)
      else if (Array.isArray(val)) {
        val = val.join(';');
      }
      // Handle objects (skip or stringify)
      else if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      
      // Escape quotes and commas
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');

  // Create Blob and download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
