
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Aplikasi Stok Opname</h1>
        <p className="text-sm text-gray-500">Manajemen Inventaris Toko Sembako Anda</p>
      </div>
    </header>
  );
};

export default Header;
