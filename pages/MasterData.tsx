import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Store, InventoryItem, OperationalCost, ItemType } from '../types';
import { PencilIcon, PlusIcon, TrashIcon, ChevronLeftIcon, PrinterIcon, DocumentDownloadIcon, UploadIcon, DotsHorizontalIcon } from '../components/icons';
import { MerchandiseItemModal } from '../components/MerchandiseItemModal';
import { FixedAssetModal } from '../components/FixedAssetModal';
import { OperationalCostModal } from '../components/OperationalCostModal';
import { ImportModal } from '../components/ImportModal';
import { downloadCsv } from '../utils/csvHelper';

type ActiveTab = ItemType | 'BIAYA_OPERASIONAL';

interface ManageInventoryProps {
  stores: Store[];
  onAddItem: (storeId: string, data: Omit<InventoryItem, 'id'> | Omit<InventoryItem, 'id'>[]) => void;
  onUpdateItem: (storeId: string, item: InventoryItem) => void;
  onDeleteItem: (storeId: string, itemId: string) => void;
  onAddCost: (storeId: string, data: Omit<OperationalCost, 'id'>) => void;
  onUpdateCost: (storeId: string, cost: OperationalCost) => void;
  onDeleteCost: (storeId: string, costId: string) => void;
}

const ManageInventory: React.FC<ManageInventoryProps> = ({ stores, onAddItem, onUpdateItem, onDeleteItem, onAddCost, onUpdateCost, onDeleteCost }) => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  
  const store = useMemo(() => stores.find(s => s.id === storeId), [stores, storeId]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('BARANG');
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isMerchandiseModalOpen, setIsMerchandiseModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleOpenAddModal = () => {
    if (activeTab === 'BIAYA_OPERASIONAL') {
      setEditingCost(null);
      setIsCostModalOpen(true);
    } else if (activeTab === 'BARANG') {
      setEditingItem(null);
      setIsMerchandiseModalOpen(true);
    } else if (activeTab === 'ASET_TETAP') {
      setEditingItem(null);
      setIsAssetModalOpen(true);
    }
  };

  const handleSaveItem = (data: Omit<InventoryItem, 'id'>) => {
    if (!storeId) return;
    if (editingItem) {
      onUpdateItem(storeId, { ...editingItem, ...data });
    } else {
      onAddItem(storeId, data);
    }
    setIsMerchandiseModalOpen(false);
    setIsAssetModalOpen(false);
  };

  const handleSaveCost = (data: Omit<OperationalCost, 'id'>) => {
    if (!storeId) return;
    if (editingCost) {
      onUpdateCost(storeId, { ...editingCost, ...data });
    } else {
      onAddCost(storeId, data);
    }
    setIsCostModalOpen(false);
  };
  
  const handleImport = (data: Omit<InventoryItem, 'id'>[]) => {
      if(storeId) {
          onAddItem(storeId, data);
          alert(`${data.length} item berhasil diimpor!`);
      }
  }
  
  const handlePrint = () => window.print();

  const handleExport = () => {
    if (!store) return;
  
    let headers: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];
    const filename = `data_${store.name.replace(/\s+/g, '_')}_${activeTab.toLowerCase()}.csv`;

    if (activeTab === 'BARANG') {
      headers = ["Nama", "SKU", "Kategori", "Harga Beli", "Harga Jual", "Stok", "Satuan"];
      rows = store.inventory
        .filter(item => item.type === 'BARANG')
        .map(item => [
          item.name, item.sku, item.category, item.purchasePrice,
          item.sellingPrice, item.expectedStock, item.unit
        ]);
    } else if (activeTab === 'ASET_TETAP') {
        headers = ["Nama Aset", "SKU", "Kategori", "Tgl Pembelian", "Harga Pembelian", "Jumlah Stok", "Catatan"];
        rows = store.inventory
            .filter(item => item.type === 'ASET_TETAP')
            .map(item => [
                item.name, item.sku, item.category, item.purchaseDate, item.purchasePrice, item.expectedStock, item.notes
            ]);
    } else if (activeTab === 'BIAYA_OPERASIONAL') {
      headers = ["Nama Biaya", "Jumlah", "Periode"];
      rows = store.operationalCosts.map(cost => [cost.name, cost.amount, cost.period]);
    }

    downloadCsv(filename, headers, rows);
  };

  const formatCurrency = (value: number) => {
    if (value === 0 && activeTab !== 'BIAYA_OPERASIONAL') return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        // Add timezone offset to prevent date from shifting
        const offset = date.getTimezoneOffset();
        const correctedDate = new Date(date.getTime() + (offset * 60 * 1000));
        return correctedDate.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch {
        return dateString; // fallback
    }
  };
  
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    if (item.type === 'BARANG') {
      setIsMerchandiseModalOpen(true);
    } else {
      setIsAssetModalOpen(true);
    }
  };
  
  if (!store) {
    return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-gray-700">Toko tidak ditemukan</h2>
            <p className="text-gray-500 mt-2">Toko yang Anda cari tidak ada atau telah dihapus.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md">Kembali ke Dashboard</button>
        </div>
    );
  }
  
  const renderTableBody = () => {
    if (activeTab === 'BIAYA_OPERASIONAL') {
        return (
            <tbody className="bg-white divide-y divide-gray-200">
                {store.operationalCosts.map(cost => (
                    <tr key={cost.id}>
                        <td className="px-6 py-4">{cost.name}</td>
                        <td className="px-6 py-4">{formatCurrency(cost.amount)}</td>
                        <td className="px-6 py-4">{cost.period}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                           <button onClick={() => { setEditingCost(cost); setIsCostModalOpen(true);}} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon className="h-5 w-5" /></button>
                           <button onClick={() => onDeleteCost(storeId!, cost.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                    </tr>
                ))}
                {store.operationalCosts.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-gray-500">Belum ada biaya operasional.</td></tr>}
            </tbody>
        );
    }

    if (activeTab === 'ASET_TETAP') {
        const items = store.inventory.filter(item => item.type === 'ASET_TETAP');
        return (
            <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                    <tr key={item.id}>
                        <td className="px-6 py-4 text-center">{index + 1}</td>
                        <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                        </td>
                        <td className="px-6 py-4">{item.category}</td>
                        <td className="px-6 py-4">{formatDisplayDate(item.purchaseDate)}</td>
                        <td className="px-6 py-4">{formatCurrency(item.purchasePrice)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.notes}>{item.notes || '-'}</td>
                        <td className="px-6 py-4 text-right space-x-2 no-print">
                            <button onClick={() => handleEditItem(item)} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon className="h-5 w-5" /></button>
                            <button onClick={() => onDeleteItem(storeId!, item.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                    </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-500">Belum ada aset tetap.</td></tr>}
            </tbody>
        );
    }
    
    const items = store.inventory.filter(item => item.type === 'BARANG');
    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map(item => (
          <tr key={item.id}>
            <td className="px-6 py-4"><div className="font-medium text-gray-900">{item.name}</div><div className="text-sm text-gray-500">SKU: {item.sku} | {item.category}</div></td>
            <td className="px-6 py-4 font-semibold">{item.expectedStock} {item.unit}</td>
            <td className="px-6 py-4">{formatCurrency(item.purchasePrice)}</td>
            <td className="px-6 py-4">{formatCurrency(item.sellingPrice)}</td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleEditItem(item)} className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => onDeleteItem(storeId!, item.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
            </td>
          </tr>
        ))}
        {items.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">Belum ada data.</td></tr>}
      </tbody>
    );
  }

  const renderTableHead = () => {
      if (activeTab === 'BIAYA_OPERASIONAL') {
          return (
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Biaya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                <th className="relative px-6 py-3 no-print"><span className="sr-only">Aksi</span></th>
              </tr>
          );
      }
      if (activeTab === 'ASET_TETAP') {
          return (
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Pembelian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Pembelian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                <th className="relative px-6 py-3 no-print"><span className="sr-only">Aksi</span></th>
              </tr>
          );
      }
      // Default for BARANG
      return (
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
              <th className="relative px-6 py-3 no-print"><span className="sr-only">Aksi</span></th>
            </tr>
      );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md printable-area">
      <div className="no-print">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeftIcon className="h-5 w-5" />
            Kembali ke Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 border-b border-gray-200 pb-5">
            <div>
                <h2 className="text-xl font-bold text-gray-900 sm:truncate">
                    {store.name}
                </h2>
            </div>
            <div className="flex items-center gap-2">
                {/* Dropdown Menu Container */}
                <div ref={actionMenuRef} className="relative">
                    <button
                        onClick={() => setIsActionMenuOpen(prevState => !prevState)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        id="menu-button"
                        aria-expanded={isActionMenuOpen}
                        aria-haspopup="true"
                    >
                        <span className="sr-only">Opsi Lainnya</span>
                        <DotsHorizontalIcon className="h-5 w-5" />
                    </button>

                    {isActionMenuOpen && (
                        <div 
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                            role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}
                        >
                            <div className="py-1" role="none">
                                <button onClick={() => { setIsImportModalOpen(true); setIsActionMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1}>
                                   <UploadIcon className="h-5 w-5 mr-3 text-gray-400" />
                                   <span>Impor</span>
                                </button>
                                <button onClick={() => { handleExport(); setIsActionMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1}>
                                   <DocumentDownloadIcon className="h-5 w-5 mr-3 text-gray-400" />
                                   <span>Ekspor</span>
                                </button>
                                <button onClick={() => { handlePrint(); setIsActionMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" tabIndex={-1}>
                                    <PrinterIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>Cetak</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Action Button */}
                <button onClick={handleOpenAddModal} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    <span>Tambah Baru</span>
                </button>
            </div>
        </div>
        
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('BARANG')} className={`${activeTab === 'BARANG' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Barang Dagangan</button>
                <button onClick={() => setActiveTab('ASET_TETAP')} className={`${activeTab === 'ASET_TETAP' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Aset Tetap</button>
                <button onClick={() => setActiveTab('BIAYA_OPERASIONAL')} className={`${activeTab === 'BIAYA_OPERASIONAL' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Biaya Operasional</button>
            </nav>
        </div>
      </div>
      
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {renderTableHead()}
          </thead>
          {renderTableBody()}
        </table>
      </div>
      
      <div className="no-print">
        <MerchandiseItemModal isOpen={isMerchandiseModalOpen} onClose={() => setIsMerchandiseModalOpen(false)} onSave={handleSaveItem} itemToEdit={editingItem} />
        <FixedAssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onSave={handleSaveItem} itemToEdit={editingItem} />
        <OperationalCostModal isOpen={isCostModalOpen} onClose={() => setIsCostModalOpen(false)} onSave={handleSaveCost} costToEdit={editingCost}/>
        <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} />
      </div>
    </div>
  );
};

export default ManageInventory;