import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Spinner } from '@heroui/react';

const QRScanner = () => {
  const { qrId } = useParams();
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
        
        await updateDoc(qrRef, {
          scanCount: increment(1),
          lastScanned: serverTimestamp(),
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
      {loading && (
        <div className="text-center">
          <Spinner size="lg" color="primary" className="mx-auto" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Redirigiendo...</p>
        </div>
      )}
      {error && !loading && (
        <div className="p-6 max-w-sm rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;