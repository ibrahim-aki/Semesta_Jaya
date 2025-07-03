
import React, { useState } from 'react';
import { XIcon } from './icons';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, location: string) => void;
}

const AddStoreModal: React.FC<AddStoreModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError('Nama toko dan lokasi tidak boleh kosong.');
      return;
    }
    onAdd(name, location);
    handleClose();
  };
  
  const handleClose = () => {
    setName('');
    setLocation('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" id="my-modal" onClick={handleClose}>
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">Tambah Toko Baru</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <span className="sr-only">Tutup</span>
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">Nama Toko</label>
            <input
              type="text"
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900"
              placeholder="Contoh: Toko Berkah Jaya"
              required
            />
          </div>
          <div>
            <label htmlFor="store-location" className="block text-sm font-medium text-gray-700">Lokasi</label>
            <input
              type="text"
              id="store-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900"
              placeholder="Contoh: Jl. Mawar No. 10"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Simpan Toko
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;
