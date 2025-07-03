
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpnameReport, OpnameItem } from '@/types';
import { getInventoryAnalysis } from '@/services/geminiService';
import Loader from '@/components/Loader';
import { downloadCsv } from '@/utils/csvHelper';

interface ReportViewProps {
  report: OpnameReport;
  onFinalize: (report: OpnameReport) => void;
}

const VarianceCell: React.FC<{ item: OpnameItem }> = ({ item }) => {
  if (item.variance === 0) {
    return <span className="text-gray-500">Sesuai</span>;
  }
  const color = item.variance > 0 ? 'text-green-600' : 'text-red-600';
  const sign = item.variance > 0 ? '+' : '';
  return <span className={`font-bold ${color}`}>{`${sign}${item.variance} ${item.unit}`}</span>;
};

const ReportView: React.FC<ReportViewProps> = ({ report, onFinalize }) => {
  const navigate = useNavigate();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const handleFinalize = () => {
    if (window.confirm('Apakah Anda yakin ingin menyelesaikan laporan ini? Stok sistem akan diperbarui dengan hasil stok fisik. Tindakan ini tidak dapat dibatalkan.')) {
      setIsFinalizing(true);
      // Simulate network delay
      setTimeout(() => {
        onFinalize(report);
        navigate('/');
      }, 500);
    }
  };
  
  const handleGetAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    const analysis = await getInventoryAnalysis(report);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };
  
  const handlePrint = () => window.print();

  const handleExport = () => {
    const headers = ['Nama Barang', 'SKU', 'Stok Sistem', 'Stok Fisik', 'Selisih', 'Satuan'];
    const rows = report.items.map(item => [
        item.name,
        item.sku,
        item.expectedStock,
        item.physicalCount ?? 0,
        item.variance,
        item.unit
    ]);
    const filename = `laporan_opname_${report.storeName.replace(/\s+/g, '_')}.csv`;
    downloadCsv(filename, headers, rows);
  };

  const formatAnalysis = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n/g, '<br />') // Newlines
      .replace(/(\-|\*)\s(.*?)(<br \/>|$)/g, '<li class="ml-4 list-disc">$2</li>') // List items
      .replace(/(<li.*<\/li>)+/g, '<ul>$&</ul>'); // Wrap lists
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center no-print">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ChevronLeftIcon className="h-5 w-5" />
            Kembali ke Dashboard
        </button>
        <div className="flex gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-md border">
                <DocumentDownloadIcon className="h-5 w-5" /> Ekspor Laporan
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-md border">
                <PrinterIcon className="h-5 w-5" /> Cetak Laporan
            </button>
        </div>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md printable-area">
        <div className="border-b border-gray-200 pb-5 mb-6">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Laporan Hasil Stok Opname
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Toko: {report.storeName} | Tanggal: {report.opnameDate}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {report.items.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barang</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Sistem</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Fisik</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Selisih</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.items.map(item => (
                  <tr key={item.id} className={item.variance !== 0 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.expectedStock} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">{item.physicalCount} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm"><VarianceCell item={item} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
              <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700">Laporan Kosong</h3>
                  <p className="text-gray-500 mt-2">Tidak ada barang yang dihitung dalam stok opname ini.</p>
              </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md no-print">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary-500 mr-2"/>
            Analisis & Rekomendasi AI
        </h3>
        {report.items.length > 0 ? (
            <>
            {isAnalyzing ? (
                <Loader text="AI sedang menganalisis data..."/>
            ) : aiAnalysis ? (
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: formatAnalysis(aiAnalysis) }} />
            ) : (
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-600 mb-4">Dapatkan wawasan tentang selisih stok Anda.</p>
                    <button
                        onClick={handleGetAnalysis}
                        disabled={isAnalyzing}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                    >
                        <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                        {isAnalyzing ? 'Menganalisis...' : 'Minta Analisis AI'}
                    </button>
                </div>
            )}
            </>
        ) : (
             <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600">Tidak ada data untuk dianalisis.</p>
            </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div>
            <h3 className="text-lg font-medium text-gray-900">Finalisasi Laporan</h3>
            <p className="text-sm text-gray-600 mt-1">
                Tindakan ini akan mengatur ulang stok sistem sesuai dengan hasil stok fisik.
            </p>
        </div>
        <button
          onClick={handleFinalize}
          disabled={isFinalizing || report.items.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
          {isFinalizing ? 'Memproses...' : 'Finalisasi & Reset Stok'}
        </button>
      </div>
    </div>
  );
};

export default ReportView;
