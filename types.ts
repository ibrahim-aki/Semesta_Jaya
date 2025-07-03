export const itemCategories = [
  'Sembako', 'Makanan', 'Minuman', 'Rokok', 'Cemilan', 'Rempah Serbuk', 
  'Rempah Cair', 'Obat', 'Bahan Bakar', 'Lainnya'
] as const;

export const assetCategories = [
  'Elektronik', 'Mebel', 'Aset Diam', 'Aset Bergerak', 'Lainnya'
] as const;

export const itemUnits = [
    'Pcs', 'Kg', 'Gram', 'Ltr', 'Ml', 'Botol', 'Karton', 'Dus', 'Renteng', 'Bungkus', 'Lainnya'
] as const;

export const itemTypes = ['BARANG', 'ASET_TETAP'] as const;

export const operationalCostPeriods = ['Bulanan', 'Tahunan', 'Sekali Bayar'] as const;

export type ItemCategory = typeof itemCategories[number];
export type AssetCategory = typeof assetCategories[number];
export type ItemUnit = typeof itemUnits[number];
export type ItemType = typeof itemTypes[number];
export type OperationalCostPeriod = typeof operationalCostPeriods[number];

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string; // Now a string to hold both ItemCategory and AssetCategory
  purchasePrice: number;
  sellingPrice: number;
  expectedStock: number;
  unit: ItemUnit;
  type: ItemType;
  purchaseDate?: string; // Format YYYY-MM-DD
  notes?: string;
}

export interface OperationalCost {
  id: string;
  name: string;
  amount: number;
  period: OperationalCostPeriod;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  inventory: InventoryItem[];
  operationalCosts: OperationalCost[];
}

export interface OpnameItem extends InventoryItem {
  physicalCount: number | null;
  variance: number;
}

export interface OpnameReport {
  storeId: string;
  storeName: string;
  opnameDate: string;
  items: OpnameItem[];
}