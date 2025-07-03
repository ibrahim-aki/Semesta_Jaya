
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import StockOpname from './pages/StockOpname';
import ReportView from './pages/ReportView';
import ManageInventory from './pages/MasterData'; // Renamed conceptually
import { INITIAL_STORES } from './data/mockData';
import { Store, OpnameReport, InventoryItem, OperationalCost } from './types';

function App() {
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [latestReport, setLatestReport] = useState<OpnameReport | null>(null);

  const handleOpnameComplete = (report: OpnameReport) => {
    setLatestReport(report);
  };

  const handleFinalizeReport = (finalizedReport: OpnameReport) => {
    setStores(prevStores => 
      prevStores.map(store => {
        if (store.id === finalizedReport.storeId) {
          const updatedInventory = store.inventory.map(invItem => {
            const reportItem = finalizedReport.items.find(repItem => repItem.id === invItem.id);
            return reportItem ? { ...invItem, expectedStock: reportItem.physicalCount ?? invItem.expectedStock } : invItem;
          });
          return { ...store, inventory: updatedInventory };
        }
        return store;
      })
    );
    setLatestReport(null); // Clear report after finalizing
  };
  
  const handleAddStore = (name: string, location: string) => {
    const newStore: Store = {
      id: `toko-${new Date().getTime()}`,
      name,
      location,
      inventory: [],
      operationalCosts: [],
    };
    setStores(prevStores => [...prevStores, newStore]);
  };

  const handleDeleteStore = (storeId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus toko ini? Semua data stok terkait akan hilang secara permanen.')) {
      setStores(prevStores => prevStores.filter(store => store.id !== storeId));
    }
  };
  
  const handleAddItem = (storeId: string, itemData: Omit<InventoryItem, 'id'> | Omit<InventoryItem, 'id'>[]) => {
    const itemsToAdd = Array.isArray(itemData) ? itemData : [itemData];
    const newItems = itemsToAdd.map(item => ({
      id: `item-${new Date().getTime()}-${Math.random()}`,
      ...item,
    }));
    
    setStores(prevStores =>
      prevStores.map(store =>
        store.id === storeId
          ? { ...store, inventory: [...store.inventory, ...newItems] }
          : store
      )
    );
  };

  const handleUpdateItem = (storeId: string, updatedItem: InventoryItem) => {
    setStores(prevStores =>
      prevStores.map(store =>
        store.id === storeId
          ? {
              ...store,
              inventory: store.inventory.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              ),
            }
          : store
      )
    );
  };
  
  const handleDeleteItem = (storeId: string, itemId: string) => {
     if (window.confirm('Apakah Anda yakin ingin menghapus item ini dari toko ini?')) {
        setStores(prevStores =>
            prevStores.map(store =>
              store.id === storeId
                ? {
                    ...store,
                    inventory: store.inventory.filter(item => item.id !== itemId),
                  }
                : store
            )
        );
     }
  };
  
  const handleAddOperationalCost = (storeId: string, costData: Omit<OperationalCost, 'id'>) => {
      const newCost: OperationalCost = {
          id: `cost-${new Date().getTime()}`,
          ...costData
      };
      setStores(prevStores => prevStores.map(store =>
          store.id === storeId ? { ...store, operationalCosts: [...store.operationalCosts, newCost] } : store
      ));
  };
  
  const handleUpdateOperationalCost = (storeId: string, updatedCost: OperationalCost) => {
       setStores(prevStores => prevStores.map(store =>
          store.id === storeId ? { ...store, operationalCosts: store.operationalCosts.map(cost => cost.id === updatedCost.id ? updatedCost : cost) } : store
      ));
  };

  const handleDeleteOperationalCost = (storeId: string, costId: string) => {
      if (window.confirm('Apakah Anda yakin ingin menghapus biaya operasional ini?')) {
          setStores(prevStores => prevStores.map(store =>
              store.id === storeId ? { ...store, operationalCosts: store.operationalCosts.filter(cost => cost.id !== costId)} : store
          ));
      }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 no-print">
        <Header />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard stores={stores} onAddStore={handleAddStore} onDeleteStore={handleDeleteStore} />} />
              <Route path="/inventory/:storeId" element={
                <ManageInventory 
                    stores={stores} 
                    onAddItem={handleAddItem} 
                    onUpdateItem={handleUpdateItem} 
                    onDeleteItem={handleDeleteItem}
                    onAddCost={handleAddOperationalCost}
                    onUpdateCost={handleUpdateOperationalCost}
                    onDeleteCost={handleDeleteOperationalCost}
                />} 
              />
              <Route path="/opname/:storeId" element={<StockOpname stores={stores} onOpnameComplete={handleOpnameComplete} />} />
              <Route path="/report" element={latestReport ? <ReportView report={latestReport} onFinalize={handleFinalizeReport} /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
