import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Button, Chip } from '@heroui/react';
import { Spinner } from '@heroui/react';
import { HiOutlineHome } from 'react-icons/hi';

const QRScanner = () => {
  const { qrId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState(null);
  const [action, setAction] = useState(null);

  useEffect(() => {
    const handleScan = async () => {
      try {
        const qrRef = doc(db, 'qrcodes', qrId);
        const qrSnap = await getDoc(qrRef);

        if (!qrSnap.exists()) {
          setError('Este código QR no existe o ha sido eliminado.');
          setLoading(false);
          return;
        }

        const data = qrSnap.data();
        setQrData(data);

        await updateDoc(qrRef, {
          scanCount: increment(1),
          lastScanned: serverTimestamp(),
        });

        const type = data.type || 'url';
        let destination = null;

        switch (type) {
          case 'url':
            destination = data.originalUrl;
            if (destination) {
              window.location.href = destination;
              return;
            }
            break;
          case 'email': {
            const mailto = `mailto:${data.emailTo || ''}?subject=${encodeURIComponent(data.emailSubject || '')}&body=${encodeURIComponent(data.emailBody || '')}`;
            window.location.href = mailto;
            return;
          }
          case 'phone':
            window.location.href = `tel:${data.phoneNumber || ''}`;
            return;
          case 'sms': {
            const smsUri = `sms:${data.smsNumber || ''}${data.smsMessage ? `?body=${encodeURIComponent(data.smsMessage)}` : ''}`;
            window.location.href = smsUri;
            return;
          }
          case 'wifi': {
            setAction('wifi');
            setLoading(false);
            return;
          }
          case 'text':
          default:
            setAction('text');
            setLoading(false);
            return;
        }

        if (!destination) {
          setAction('text');
          setLoading(false);
        }
      } catch (err) {
        setError('Error al procesar el QR: ' + err.message);
        setLoading(false);
      }
    };

    handleScan();
  }, [qrId]);

  const typeLabel = {
    url: 'URL',
    text: 'Texto',
    email: 'Email',
    phone: 'Teléfono',
    sms: 'SMS',
    wifi: 'WiFi',
  };

  const renderContent = () => {
    if (action === 'text' && qrData) {
      return (
        <div className="p-6 max-w-md rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
          <Chip size="sm" variant="flat" color="primary" className="mb-3">
            {qrData.type ? typeLabel[qrData.type] || qrData.type : 'Texto'}
          </Chip>
          <p className="text-[var(--text)] text-base whitespace-pre-wrap break-words">
            {qrData.textContent || qrData.originalUrl || 'Sin contenido'}
          </p>
          <div className="mt-6">
            <Button
              as={Link}
              to="/"
              variant="flat"
              color="primary"
              startContent={<HiOutlineHome className="w-4 h-4" />}
            >
              Ir al generador
            </Button>
          </div>
        </div>
      );
    }

    if (action === 'wifi' && qrData) {
      return (
        <div className="p-6 max-w-sm rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
          <Chip size="sm" variant="flat" color="primary" className="mb-3">WiFi</Chip>
          <div className="space-y-2 text-left">
            <p className="text-sm text-[var(--text-muted)]">
              Red: <span className="text-[var(--text)] font-medium">{qrData.wifiSsid || '—'}</span>
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Contraseña: <span className="text-[var(--text)] font-medium">{qrData.wifiPassword || 'Sin contraseña'}</span>
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Cifrado: <span className="text-[var(--text)]">{qrData.wifiEncryption || 'WPA'}</span>
            </p>
          </div>
          <div className="mt-6">
            <Button
              as={Link}
              to="/"
              variant="flat"
              color="primary"
              startContent={<HiOutlineHome className="w-4 h-4" />}
            >
              Ir al generador
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[var(--bg-page)]">
      {loading && (
        <div className="text-center">
          <Spinner size="lg" color="primary" className="mx-auto" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Redirigiendo...</p>
        </div>
      )}
      {error && !loading && (
        <div className="p-6 max-w-sm rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button
            as={Link}
            to="/"
            variant="flat"
            color="primary"
            startContent={<HiOutlineHome className="w-4 h-4" />}
          >
            Ir al generador
          </Button>
        </div>
      )}
      {!loading && !error && renderContent()}
    </div>
  );
};

export default QRScanner;
