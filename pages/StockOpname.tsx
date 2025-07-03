
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, OpnameItem, OpnameReport, InventoryItem, OperationalCost } from '../types';
import { StoreIcon, ClipboardListIcon, ChevronLeftIcon, PrinterIcon, DocumentDownloadIcon } from '../components/icons';
import { downloadCsv } from '../utils/csvHelper';

interface StockOpnameProps {
  stores: Store[];
  onOpnameComplete: (report: OpnameReport) => void;
}

const VarianceCell: React.FC<{ variance: number, unit: string }> = ({ variance, unit }) => {
  if (variance === 0) {
    return <span className="text-sm text-gray-500">Sesuai</span>;
  }
  const color = variance > 0 ? 'text-green-600' : 'text-red-600';
  const sign = variance > 0 ? '+' : '';
  return <span className={`text-sm font-bold ${color}`}>{`${sign}${variance} ${unit}`}</span>;
};

const StockOpname: React.FC<StockOpnameProps> = ({ stores, onOpnameComplete }) => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [opnameItems, setOpnameItems] = useState<OpnameItem[]>([]);
  const [fixedAssets, setFixedAssets] = useState<InventoryItem[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);

  useEffect(() => {
    const currentStore = stores.find(s => s.id === storeId);
    if (currentStore) {
      setStore(currentStore);
      const itemsToCount = currentStore.inventory.filter(item => item.type === 'BARANG');
      setOpnameItems(itemsToCount.map(item => ({
        ...item,
        physicalCount: null,
        variance: 0,
      })));
      setFixedAssets(currentStore.inventory.filter(item => item.type === 'ASET_TETAP'));
      setOperationalCosts(currentStore.operationalCosts);
    } else {
      navigate('/');
    }
  }, [storeId, stores, navigate]);

  const handleCountChange = (itemId: string, count: string) => {
    const newCount = count === '' ? null : parseInt(count, 10);
    if (newCount !== null && isNaN(newCount)) return;

    setOpnameItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const variance = newCount !== null ? newCount - item.expectedStock : 0;
          return { ...item, physicalCount: newCount, variance };
        }
        return item;
      })
    );
  };
  
  const handlePrint = () => window.print();
  
  const handleExport = () => {
    if (!store) return;
    const headers = ['Nama Item', 'SKU', 'Stok Sistem', 'Satuan', 'Stok Fisik (Kosongkan)'];
    const rows = opnameItems.map(item => [
        item.name,
        item.sku,
        item.expectedStock,
        item.unit,
        '' // Empty for physical count
    ]);
    const filename = `checklist_opname_${store.name.replace(/\s+/g, '_')}.csv`;
    downloadCsv(filename, headers, rows);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const isAllFilled = opnameItems.every(item => item.physicalCount !== null);
    if (!isAllFilled && opnameItems.length > 0) {
        alert('Harap isi semua jumlah fisik barang sebelum menyelesaikan.');
        return;
    }

    const report: OpnameReport = {
      storeId: store!.id,
      storeName: store!.name,
      opnameDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: opnameItems, // opnameItems already contains the latest variance
    };
    
    onOpnameComplete(report);
    navigate('/report');
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);


  if (!store) {
    return <div>Memuat data toko...</div>;
  }

  const itemsDone = opnameItems.filter(item => item.physicalCount !== null).length;
  const totalItems = opnameItems.length;
  const progress = totalItems > 0 ? (itemsDone / totalItems) * 100 : 0;


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center no-print">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                <ChevronLeftIcon className="h-5 w-5" />
                Kembali ke Dashboard
            </button>
            <div className="flex gap-2">
                <button onClick={handleExport} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-md border">
                    <DocumentDownloadIcon className="h-5 w-5" /> Ekspor Checklist
                </button>
                <button onClick={handlePrint} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-md border">
                    <PrinterIcon className="h-5 w-5" /> Cetak
                </button>
            </div>
       </div>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md printable-area">
        <div className="border-b border-gray-200 pb-5 mb-6">
          <div className="flex items-center">
              <StoreIcon className="h-8 w-8 text-primary-600 mr-4 no-print"/>
              <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Stok Opname: {store.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{store.location}</p>
              </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Ringkasan Aset Tetap</h3>
                {fixedAssets.length > 0 ? (
                    <ul className="space-y-1 text-sm text-gray-600">
                        {fixedAssets.map(asset => <li key={asset.id} className="flex justify-between"><span>{asset.name}</span> <span className="font-medium">{asset.expectedStock} {asset.unit}</span></li>)}
                    </ul>
                ) : <p className="text-sm text-gray-500">Tidak ada aset tetap.</p>}
            </div>
             <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Ringkasan Biaya Operasional</h3>
                {operationalCosts.length > 0 ? (
                     <ul className="space-y-1 text-sm text-gray-600">
                        {operationalCosts.map(cost => <li key={cost.id} className="flex justify-between"><span>{cost.name} ({cost.period})</span> <span className="font-medium">{formatCurrency(cost.amount)}</span></li>)}
                    </ul>
                ) : <p className="text-sm text-gray-500">Tidak ada biaya operasional.</p>}
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 no-print">
              <h3 className="text-lg font-medium text-gray-700">Progress Hitung Barang: {itemsDone} / {totalItems} item</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
          </div>

          <div className="overflow-x-auto">
              {totalItems > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barang</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Sistem</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Fisik</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selisih</th>
                      </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                      {opnameItems.map(item => (
                          <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{item.expectedStock} {item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <input
                              type="number"
                              min="0"
                              value={item.physicalCount ?? ''}
                              onChange={e => handleCountChange(item.id, e.target.value)}
                              className="w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 no-print text-gray-900"
                              placeholder="Jumlah"
                              required
                              />
                               <span className="print-only hidden">{item.physicalCount ?? '___'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.physicalCount !== null ? <VarianceCell variance={item.variance} unit={item.unit} /> : <span className="text-gray-400">-</span>}
                          </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              ) : (
                  <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-700">Tidak Ada Barang Dagangan</h3>
                      <p className="text-gray-500 mt-2">Tidak ada item yang ditandai sebagai 'Barang Dagangan' di inventaris toko ini untuk di-opname.</p>
                  </div>
              )}
          </div>

          <div className="mt-8 flex justify-end gap-4 no-print">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ClipboardListIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Selesaikan & Buat Laporan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOpname;