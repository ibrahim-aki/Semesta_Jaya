
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { InventoryItem, ItemCategory, itemCategories, ItemUnit, itemUnits } from '../types';

interface MerchandiseItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id'>) => void;
  itemToEdit: InventoryItem | null;
}

const categoryToCode: { [key: string]: string } = {
  'Sembako': 'SMBK', 'Makanan': 'MKNN', 'Minuman': 'MNMN', 'Rokok': 'RKK',
  'Cemilan': 'CMLN', 'Rempah Serbuk': 'RMPS', 'Rempah Cair': 'RMPC',
  'Obat': 'OBT', 'Bahan Bakar': 'BBKR', 'Lainnya': 'LLN',
};

const generateSKU = (category: string, name: string): string => {
  const catCode = categoryToCode[category] || 'BRG';
  const nameInitials = name.trim().split(' ').map(word => word[0]).slice(0, 3).join('').toUpperCase();
  const uniquePart = Date.now().toString().slice(-5);
  
  if (!nameInitials) return `${catCode}-${uniquePart}`;
  return `${catCode}-${nameInitials}-${uniquePart}`;
};

export const MerchandiseItemModal: React.FC<MerchandiseItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ItemCategory>(itemCategories[0]);
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [sellingPrice, setSellingPrice] = useState<number | string>('');
  const [expectedStock, setExpectedStock] = useState<number | string>('');
  const [unit, setUnit] = useState<ItemUnit>(itemUnits[0]);
  const [error, setError] = useState('');

  const resetState = () => {
    setName('');
    setSku('');
    setCategory(itemCategories[0]);
    setPurchasePrice('');
    setSellingPrice('');
    setExpectedStock('');
    setUnit(itemUnits[0]);
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setSku(itemToEdit.sku);
            setCategory(itemToEdit.category as ItemCategory);
            setPurchasePrice(itemToEdit.purchasePrice);
            setSellingPrice(itemToEdit.sellingPrice);
            setExpectedStock(itemToEdit.expectedStock);
            setUnit(itemToEdit.unit);
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
    const sp = Number(sellingPrice);
    const stock = Number(expectedStock);

    if (!name.trim() || !sku.trim() || !category || !unit) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (isNaN(pp) || isNaN(sp) || isNaN(stock) || pp < 0 || sp < 0 || stock < 0) {
        setError('Harga dan stok harus angka positif.');
        return;
    }
    if (sp < pp) {
      setError('Harga jual tidak boleh lebih rendah dari harga beli.');
      return;
    }
    
    onSave({ name, sku, category, purchasePrice: pp, sellingPrice: sp, expectedStock: stock, unit, type: 'BARANG' });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">{itemToEdit ? 'Ubah Barang Dagangan' : 'Tambah Barang Dagangan Baru'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <span className="sr-only">Tutup</span>
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
            <div>
                <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">Nama Item</label>
                <input id="item-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={baseInputStyle} placeholder="Contoh: Beras Super 5kg" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label htmlFor="item-stock" className="block text-sm font-medium text-gray-700">Stok Awal</label>
                <input id="item-stock" type="number" value={expectedStock} onChange={e => setExpectedStock(e.target.value)} className={baseInputStyle} placeholder="Jumlah" min="0" required />
                </div>
                <div>
                <label htmlFor="item-unit" className="block text-sm font-medium text-gray-700">Satuan</label>
                <select id="item-unit" value={unit} onChange={(e) => setUnit(e.target.value as ItemUnit)} className={dropdownStyle}>
                    {itemUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                </div>
            </div>
            
            <div>
                <label htmlFor="item-category" className="block text-sm font-medium text-gray-700">Kategori</label>
                <select id="item-category" value={category} onChange={(e) => setCategory(e.target.value as ItemCategory)} className={dropdownStyle}>
                {itemCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            
            <div>
                <label htmlFor="item-sku" className="block text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)</label>
                <input id="item-sku" type="text" value={sku} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm text-gray-500" placeholder="Dibuat otomatis"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label htmlFor="item-purchase-price" className="block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
                <input id="item-purchase-price" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className={baseInputStyle} placeholder="Harga modal" min="0" required />
                </div>
                <div>
                <label htmlFor="item-selling-price" className="block text-sm font-medium text-gray-700">Harga Jual (Rp)</label>
                <input id="item-selling-price" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className={baseInputStyle} placeholder="Harga di toko" min="0" required />
                </div>
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
