
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { OpnameReport } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getInventoryAnalysis = async (report: OpnameReport): Promise<string> => {
  if (!API_KEY) {
    return "Analisis AI tidak tersedia. Kunci API Google Gemini belum diatur.";
  }

  const significantDiscrepancies = report.items
    .filter(item => item.variance !== 0)
    .map(({ name, expectedStock, physicalCount, variance }) => ({
      name,
      expectedStock,
      physicalCount,
      variance
    }));

  if (significantDiscrepancies.length === 0) {
    return "Tidak ada selisih stok yang signifikan untuk dianalisis. Semua stok cocok!";
  }

  const prompt = `
    Anda adalah seorang ahli manajemen inventaris untuk toko sembako skala kecil hingga menengah.
    Berdasarkan laporan stok opname berikut untuk toko "${report.storeName}", berikan analisis singkat, kemungkinan penyebab selisih stok, dan saran tindakan preventif.
    
    Fokuskan analisis pada 3 item dengan kekurangan (shortage) terbesar. Jika tidak ada kekurangan, sebutkan item dengan kelebihan (surplus) terbesar.
    
    Format respons Anda dalam bentuk poin-poin menggunakan markdown agar mudah dibaca.
    Mulai dengan ringkasan umum, lalu detail item, dan terakhir saran umum.

    Berikut adalah data laporannya dalam format JSON:
    ${JSON.stringify(significantDiscrepancies, null, 2)}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Gagal mendapatkan analisis dari AI. Silakan coba lagi nanti.";
  }
};
