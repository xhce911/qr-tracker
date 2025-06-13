import React, { useState, useRef } from 'react';
import {QRCodeSVG} from 'qrcode.react';
import { Button, Input, Card, Alert } from '@heroui/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {  Dropdown,  DropdownTrigger,  DropdownMenu,  DropdownSection,  DropdownItem} from "@heroui/dropdown";
import { HiDownload, HiOutlinePhotograph, HiOutlineCode } from 'react-icons/hi';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

  const generateQR = async () => {
    if (!url) {
      setError('Por favor ingresa una URL válida');
      return;
    }

    try {
      setLoading(true);
      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'qrcodes'), {
        originalUrl: url,
        shortUrl: '', // Opcional: puedes acortar la URL
        createdAt: serverTimestamp(),
        scanCount: 0,
        lastScanned: null,
        
      });

      setQrData({
        id: docRef.id,
        url: url
      });
      setError('');
    } catch (err) {
      setError('Error al generar el QR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `qr-code-${qrData.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadPNG = async () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${qrData.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Generador de QR</h2>
      
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      
      <Input
        type="url"
        placeholder="Ingresa la URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mb-4"
      />
      
      <Button 
        onClick={generateQR} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Generando...' : 'Generar QR'}
      </Button>
      
      {qrData && (
        <div className="mt-6 text-center" ref={qrRef}>
          <div className="flex justify-center mb-4">
            <QRCodeSVG 
              value={`${qrData.url}`} 
              size={200}
              includeMargin={true}
              level="H" // Mayor nivel de corrección de errores
              fgColor="#5f2132" // Color personalizado (azul indigo)
              bgColor="#ffffff"
            />
          </div>
          <p className="text-sm text-gray-600">Escaneos: 0</p>
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="outline" 
                className="mt-2 flex items-center mx-auto"
              >
                <HiDownload className="mr-2" />
                Descargar QR
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem 
                key="png" 
                startContent={<HiOutlinePhotograph />}
                onClick={downloadPNG}
              >
                Descargar como PNG
              </DropdownItem>
              <DropdownItem 
                key="svg" 
                startContent={<HiOutlineCode />}
                onClick={downloadSVG}
              >
                Descargar como SVG
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>ID del QR: {qrData.id}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QRGenerator;