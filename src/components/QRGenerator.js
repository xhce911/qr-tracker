import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Card } from '@heroui/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { HiDownload, HiOutlinePhotograph, HiOutlineCode } from 'react-icons/hi';

const QRGenerator = ({ user }) => {
  const [url, setUrl] = useState('');
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

  const generateQR = async () => {
    if (!user) {
      setError('Inicia sesión para crear códigos QR');
      return;
    }
    const trimmed = url?.trim();
    if (!trimmed) {
      setError('Ingresa una URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const docRef = await addDoc(collection(db, 'qrcodes'), {
        originalUrl: trimmed,
        createdAt: serverTimestamp(),
        scanCount: 0,
        lastScanned: null,
        createdBy: user.uid,
      });

      const scanUrl = `${window.location.origin}/scan/${docRef.id}`;
      setQrData({
        id: docRef.id,
        url: scanUrl,
        originalUrl: trimmed,
        scanCount: 0,
      });
    } catch (err) {
      setError('Error al generar el QR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    if (!qrRef.current || !qrData) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `qr-${qrData.id}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const downloadPNG = () => {
    if (!qrRef.current || !qrData) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `qr-${qrData.id}.png`;
      a.click();
    };
    img.src = URL.createObjectURL(blob);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card className="p-8 border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--text)] mb-1">Nuevo código QR</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          La URL se guarda y cada escaneo se contabiliza.
        </p>

        {!user && (
          <p className="text-sm text-[var(--text-muted)] mb-4 p-3 rounded-lg bg-amber-50 text-amber-800">
            Inicia sesión para generar y guardar códigos QR.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-4 p-3 rounded-lg bg-red-50">{error}</p>
        )}

        <Input
          type="url"
          placeholder="https://ejemplo.com"
          value={url}
          onValueChange={setUrl}
          className="mb-4"
          size="md"
          variant="bordered"
          isDisabled={!user}
        />

        <Button
          color="primary"
          onPress={generateQR}
          isLoading={loading}
          isDisabled={!user}
          className="w-full font-medium"
        >
          Generar QR
        </Button>

        {qrData && (
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center" ref={qrRef}>
            <div className="inline-flex p-4 bg-white rounded-xl border border-[var(--border)]">
              <QRCodeSVG
                value={qrData.url}
                size={200}
                includeMargin
                level="H"
                fgColor="#111827"
                bgColor="#ffffff"
              />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-3">
              Escaneos: {qrData.scanCount}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    size="sm"
                    startContent={<HiDownload className="w-4 h-4" />}
                  >
                    Descargar
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={(key) => (key === 'png' ? downloadPNG() : downloadSVG())}>
                  <DropdownItem key="png" startContent={<HiOutlinePhotograph className="w-4 h-4" />}>
                    PNG
                  </DropdownItem>
                  <DropdownItem key="svg" startContent={<HiOutlineCode className="w-4 h-4" />}>
                    SVG
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 break-all">
              {qrData.url}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRGenerator;
