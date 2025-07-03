
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { OperationalCost, operationalCostPeriods, OperationalCostPeriod } from '../types';

interface OperationalCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<OperationalCost, 'id'>) => void;
  costToEdit: OperationalCost | null;
}

export const OperationalCostModal: React.FC<OperationalCostModalProps> = ({ isOpen, onClose, onSave, costToEdit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [period, setPeriod] = useState<OperationalCostPeriod>(operationalCostPeriods[0]);
  const [error, setError] = useState('');

  const resetState = () => {
    setName('');
    setAmount('');
    setPeriod(operationalCostPeriods[0]);
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      if (costToEdit) {
        setName(costToEdit.name);
        setAmount(costToEdit.amount);
        setPeriod(costToEdit.period);
      } else {
        resetState();
      }
    }
  }, [costToEdit, isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const baseInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900";
  const dropdownStyle = `${baseInputStyle} bg-gray-50`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!name.trim()) {
      setError('Nama biaya tidak boleh kosong.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah harus angka positif.');
      return;
    }
    
    onSave({ name, amount: numAmount, period });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-medium text-gray-900">{costToEdit ? 'Ubah Biaya' : 'Tambah Biaya Operasional'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="cost-name" className="block text-sm font-medium text-gray-700">Nama Biaya</label>
            <input id="cost-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={baseInputStyle} placeholder="Contoh: Sewa Toko" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost-amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
              <input id="cost-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className={baseInputStyle} placeholder="1500000" min="0" required />
            </div>
            <div>
              <label htmlFor="cost-period" className="block text-sm font-medium text-gray-700">Periode</label>
              <select id="cost-period" value={period} onChange={(e) => setPeriod(e.target.value as OperationalCostPeriod)} className={dropdownStyle}>
                {operationalCostPeriods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
