
import React, { useState } from 'react';
import { XIcon } from './icons';
import { InventoryItem, ItemCategory, itemCategories, ItemUnit, itemUnits, ItemType, itemTypes } from '../types';


interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Omit<InventoryItem, 'id'>[]) => void;
}

const categoryToCode: { [key in ItemCategory]: string } = {
  'Sembako': 'SMBK', 'Makanan': 'MKNN', 'Minuman': 'MNMN', 'Rokok': 'RKK',
  'Cemilan': 'CMLN', 'Rempah Serbuk': 'RMPS', 'Rempah Cair': 'RMPC',
  'Obat': 'OBT', 'Bahan Bakar': 'BBKR', 'Lainnya': 'LLN',
};

const generateSKU = (category: ItemCategory, name: string): string => {
  const catCode = categoryToCode[category] || 'BRG';
  const nameInitials = name.trim().split(' ').map(word => word[0]).slice(0, 3).join('').toUpperCase();
  const uniquePart = Date.now().toString().slice(-5) + Math.random().toString(36).substr(2, 2).toUpperCase();
  if (!nameInitials) return `${catCode}-${uniquePart}`;
  return `${catCode}-${nameInitials}-${uniquePart}`;
};


export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleImportClick = () => {
    if (!file) {
      setError('Silakan pilih file CSV terlebih dahulu.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') {
        setError('Gagal membaca file.');
        return;
      }
      try {
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          setError('File CSV kosong atau hanya berisi header.');
          return;
        }
        
        const headers = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const requiredHeaders = ['nama', 'kategori', 'harga beli', 'harga jual', 'stok', 'satuan', 'tipe'];
        const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));
        if (missingHeaders.length > 0) {
            setError(`Header CSV tidak valid. Header yang hilang: ${missingHeaders.join(', ')}.`);
            return;
        }

        const data: Omit<InventoryItem, 'id'>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''));
          const rowData = headers.reduce((obj, header, index) => {
            obj[header] = values[index] ?? '';
            return obj;
          }, {} as any);
          
          const category = rowData.kategori as ItemCategory;
          const type = rowData.tipe.toUpperCase() as ItemType;

          if (!itemCategories.includes(category)) throw new Error(`Kategori tidak valid di baris ${i+1}: ${category}`);
          if (!itemTypes.includes(type)) throw new Error(`Tipe tidak valid di baris ${i+1}: ${type}`);

          const newItem: Omit<InventoryItem, 'id'> = {
            name: rowData.nama,
            sku: generateSKU(category, rowData.nama),
            category: category,
            purchasePrice: parseFloat(rowData['harga beli']),
            sellingPrice: parseFloat(rowData['harga jual']),
            expectedStock: parseInt(rowData.stok, 10),
            unit: rowData.satuan as ItemUnit,
            type: type,
          };
          data.push(newItem);
        }
        onImport(data);
        onClose();
      } catch (err: any) {
        setError(`Terjadi kesalahan saat memproses file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };
  
  const handleDownloadTemplate = () => {
      const headers = "nama;kategori;harga beli;harga jual;stok;satuan;tipe";
      const exampleRow1 = "Beras Premium 10kg;Sembako;120000;125000;20;Kg;BARANG";
      const exampleRow2 = "Kipas Angin Dinding;Lainnya;250000;0;2;Pcs;ASET_TETAP";

      const bom = "\uFEFF";
      const csvContent = bom + [headers, exampleRow1, exampleRow2].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `template_impor_item.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-medium text-gray-900">Impor Item dari CSV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="font-semibold">Instruksi:</p>
                <ul className="list-disc list-inside mt-1">
                    <li>File harus berformat CSV dan menggunakan pemisah titik koma (;).</li>
                    <li>Header harus: <strong>nama;kategori;harga beli;harga jual;stok;satuan;tipe</strong>.</li>
                    <li>Kolom 'tipe' harus berisi 'BARANG' atau 'ASET_TETAP'.</li>
                    <li>Pastikan kategori dan satuan sesuai dengan pilihan yang ada di sistem.</li>
                </ul>
                <button onClick={handleDownloadTemplate} className="text-sm text-primary-600 hover:underline font-medium mt-2">Unduh Template CSV</button>
            </div>
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Pilih File CSV</label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
            </div>

          {file && <p className="text-sm text-gray-800">File dipilih: <strong>{file.name}</strong></p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Batal</button>
            <button onClick={handleImportClick} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Impor Data</button>
        </div>
      </div>
    </div>
  );
};