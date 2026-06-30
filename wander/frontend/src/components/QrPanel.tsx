import React from "react";

interface QrPanelProps {
  qrDataUrl: string;
  fullUrl: string;
}

export default function QrPanel({ qrDataUrl, fullUrl }: QrPanelProps) {
  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 border border-gray-700 rounded-lg">
      <img
        src={qrDataUrl}
        alt="QR Code"
        className="w-48 h-48 bg-white p-2 rounded"
      />
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-1">Scan with your phone:</p>
        <p className="text-blue-400 text-sm font-mono break-all">{fullUrl}</p>
      </div>
    </div>
  );
}
