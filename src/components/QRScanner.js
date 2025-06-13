import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Alert, Spinner } from '@heroui/react';

const QRScanner = () => {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleScan = async () => {
      try {
        const qrRef = doc(db, 'qrcodes', qrId);
        const qrSnap = await getDoc(qrRef);
        
        if (!qrSnap.exists()) {
          setError('QR no encontrado');
          setLoading(false);
          return;
        }
        
        // Actualizar contador
        await updateDoc(qrRef, {
          scanCount: increment(1),
          lastScanned: new Date()
        });
        
        // Redirigir a la URL original
        const qrData = qrSnap.data();
        window.location.href = qrData.originalUrl;
        
      } catch (err) {
        setError('Error al procesar el QR: ' + err.message);
        setLoading(false);
      }
    };
    
    handleScan();
  }, [qrId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4">Procesando código QR...</p>
        </div>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : null}
    </div>
  );
};

export default QRScanner;