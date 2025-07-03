import { Store } from '../types';

export const INITIAL_STORES: Store[] = [
  {
    id: 'toko-a',
    name: 'Toko Sembako Jaya Abadi',
    location: 'Jl. Merdeka No. 12',
    inventory: [
      { id: 'item-a01', name: 'Beras Super 5kg', sku: 'SMBK-BS5-A1B2', category: 'Sembako', purchasePrice: 65000, sellingPrice: 68000, expectedStock: 50, unit: 'Pcs', type: 'BARANG' },
      { id: 'item-a02', name: 'Minyak Goreng 2L', sku: 'SMBK-MG2-C3D4', category: 'Sembako', purchasePrice: 32000, sellingPrice: 35000, expectedStock: 40, unit: 'Botol', type: 'BARANG' },
      { id: 'item-a03', name: 'Rak Gondola Besi', sku: 'ASET-RGB-E5F6', category: 'Mebel', purchasePrice: 1200000, sellingPrice: 0, expectedStock: 4, unit: 'Pcs', type: 'ASET_TETAP', purchaseDate: '2023-01-15', notes: 'Rak 2 sisi, 5 susun. Diletakkan di lorong 1.' },
      { id: 'item-a04', name: 'Timbangan Digital', sku: 'ASET-TDG-G7H8', category: 'Elektronik', purchasePrice: 350000, sellingPrice: 0, expectedStock: 1, unit: 'Pcs', type: 'ASET_TETAP', purchaseDate: '2023-02-20', notes: 'Maksimal 30kg. Perlu kalibrasi tahunan.' },
    ],
    operationalCosts: [
      { id: 'cost-a01', name: 'Sewa Toko', amount: 1500000, period: 'Bulanan' },
      { id: 'cost-a02', name: 'Gaji Karyawan', amount: 2500000, period: 'Bulanan' },
      { id: 'cost-a03', name: 'Listrik & Air', amount: 500000, period: 'Bulanan' },
    ]
  },
  {
    id: 'toko-b',
    name: 'Toko Berkah Sentosa',
    location: 'Jl. Pahlawan No. 45',
    inventory: [
        { id: 'item-b01', name: 'Gula Pasir 1kg', sku: 'SMBK-GP1-I9J0', category: 'Sembako', purchasePrice: 14000, sellingPrice: 15500, expectedStock: 80, unit: 'Kg', type: 'BARANG' },
        { id: 'item-b02', name: 'Mie Instan (Kardus)', sku: 'MKNN-MIK-K1L2', category: 'Makanan', purchasePrice: 105000, sellingPrice: 115000, expectedStock: 25, unit: 'Karton', type: 'BARANG' },
        { id: 'item-b03', name: 'Kopi Sachet (Renteng)', sku: 'MNMN-KSR-M3N4', category: 'Minuman', purchasePrice: 11000, sellingPrice: 12500, expectedStock: 100, unit: 'Renteng', type: 'BARANG' },
        { id: 'item-b04', name: 'Kulkas Showcase', sku: 'ASET-KSW-O5P6', category: 'Elektronik', purchasePrice: 4500000, sellingPrice: 0, expectedStock: 1, unit: 'Pcs', type: 'ASET_TETAP', purchaseDate: '2022-11-01', notes: 'Garansi sampai Nov 2024.' },
    ],
    operationalCosts: [],
  },
  {
    id: 'toko-c',
    name: 'Warung Ibu Siti',
    location: 'Jl. Kenanga No. 8',
    inventory: [],
    operationalCosts: [],
  },
];