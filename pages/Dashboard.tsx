import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../types';
import { StoreIcon, ClipboardListIcon, PlusIcon, TrashIcon, DatabaseIcon } from '../components/icons';
import AddStoreModal from '../components/AddStoreModal';

interface DashboardProps {
  stores: Store[];
  onAddStore: (name: string, location: string) => void;
  onDeleteStore: (storeId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stores, onAddStore, onDeleteStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Manajemen Toko</h2>
          <p className="text-gray-600 mt-1">Pilih toko untuk stok opname, kelola inventaris, atau tambah toko baru.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Toko
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stores.map(store => (
          <div key={store.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <StoreIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0"/>
                    <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                  </div>
                  <p className="text-gray-500">{store.location}</p>
                </div>
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStore(store.id);
                  }}
                  className="p-1 ml-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                  aria-label={`Hapus ${store.name}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-2 mt-auto">
              <Link
                to={`/inventory/${store.id}`}
                className="flex-1 text-center inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <DatabaseIcon className="h-5 w-5 mr-2" />
                Kelola Inventaris
              </Link>
              <Link
                to={`/opname/${store.id}`}
                className="flex-1 text-center inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <ClipboardListIcon className="h-5 w-5 mr-2" />
                Mulai Stok Opname
              </Link>
            </div>
          </div>
        ))}
         {stores.length === 0 && (
          <div className="md:col-span-2 text-center py-12 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Belum ada toko</h3>
            <p className="text-gray-500 mt-2">Silakan tambahkan toko pertama Anda untuk memulai.</p>
          </div>
        )}
      </div>
      <AddStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(name, location) => {
            onAddStore(name, location);
            setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;