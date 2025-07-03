
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { InventoryItem, AssetCategory, assetCategories } from '../types';

interface FixedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id'>) => void;
  itemToEdit: InventoryItem | null;
}

const categoryToCode: { [key: string]: string } = {
  'Elektronik': 'ELK', 'Mebel': 'MBL', 'Aset Diam': 'AD', 'Aset Bergerak': 'AB', 'Lainnya': 'LLN',
};

const generateSKU = (category: string, name: string): string => {
  const catCode = categoryToCode[category] || 'ASET';
  const nameInitials = name.trim().split(' ').map(word => word[0]).slice(0, 3).join('').toUpperCase();
  const uniquePart = Date.now().toString().slice(-5);
  
  if (!nameInitials) return `${catCode}-${uniquePart}`;
  return `${catCode}-${nameInitials}-${uniquePart}`;
};

export const FixedAssetModal: React.FC<FixedAssetModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<AssetCategory>(assetCategories[0]);
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [expectedStock, setExpectedStock] = useState<number | string>(1);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const resetState = () => {
    setName('');
    setSku('');
    setCategory(assetCategories[0]);
    setPurchasePrice('');
    setExpectedStock(1);
    setPurchaseDate('');
    setNotes('');
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setSku(itemToEdit.sku);
            setCategory(itemToEdit.category as AssetCategory);
            setPurchasePrice(itemToEdit.purchasePrice);
            setExpectedStock(itemToEdit.expectedStock);
            setPurchaseDate(itemToEdit.purchaseDate || '');
            setNotes(itemToEdit.notes || '');
        } else {
            resetState();
        }
    }
  }, [itemToEdit, isOpen]);
  
  useEffect(() => {
    if (!itemToEdit && name && category) {
      setSku(generateSKU(category, name));
    }
  }, [name, category, itemToEdit]);

  if (!isOpen) {
    return null;
  }
  
  const baseInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900";
  const dropdownStyle = `${baseInputStyle} bg-gray-50`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pp = Number(purchasePrice);
    if (!name.trim()) {
        setError('Nama Aset tidak boleh kosong.');
        return;
    }
    if (isNaN(pp) || pp < 0) {
        setError('Harga pembelian harus angka positif.');
        return;
    }
    if (!purchaseDate) {
        setError('Tanggal pembelian wajib diisi.');
        return;
    }
    
    onSave({
        name,
        purchasePrice: pp,
        purchaseDate: purchaseDate,
        notes: notes,
        type: 'ASET_TETAP',
        category: category,
        sku: itemToEdit?.sku || generateSKU(category, name),
        sellingPrice: 0,
        expectedStock: Number(expectedStock) || 1,
        unit: 'Pcs',
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">{itemToEdit ? 'Ubah Aset Tetap' : 'Tambah Aset Tetap Baru'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <span className="sr-only">Tutup</span>
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
            <div>
                <label htmlFor="asset-name" className="block text-sm font-medium text-gray-700">Nama Aset</label>
                <input id="asset-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={baseInputStyle} placeholder="Contoh: Kulkas Showcase" required />
            </div>
            <div>
                <label htmlFor="asset-sku" className="block text-sm font-medium text-gray-700">SKU (Kode Aset)</label>
                <input id="asset-sku" type="text" value={sku} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm text-gray-500" placeholder="Dibuat otomatis"/>
            </div>
            <div>
              <label htmlFor="asset-category" className="block text-sm font-medium text-gray-700">Kategori Aset</label>
              <select id="asset-category" value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)} className={dropdownStyle}>
                {assetCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="asset-purchase-date" className="block text-sm font-medium text-gray-700">Tanggal Pembelian</label>
                    <input id="asset-purchase-date" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={baseInputStyle} required />
                </div>
                <div>
                    <label htmlFor="asset-purchase-price" className="block text-sm font-medium text-gray-700">Harga Pembelian (Rp)</label>
                    <input id="asset-purchase-price" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className={baseInputStyle} placeholder="Harga perolehan" min="0" required />
                </div>
            </div>
            <div>
              <label htmlFor="item-stock" className="block text-sm font-medium text-gray-700">Jumlah Aset</label>
              <input id="item-stock" type="number" value={expectedStock} onChange={e => setExpectedStock(e.target.value)} className={baseInputStyle} placeholder="Jumlah" min="0" required />
            </div>
            <div>
                <label htmlFor="asset-notes" className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea id="asset-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={baseInputStyle} placeholder="Nomor seri, kondisi, garansi, dll."></textarea>
            </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
