import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Chip, Button } from '@heroui/react';
import {
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineClipboard,
} from 'react-icons/hi';
import AnalyticsModal from './AnalyticsModal';

const QR_TYPE_LABELS = {
  url: 'URL',
  text: 'Texto',
  email: 'Email',
  phone: 'Teléfono',
  sms: 'SMS',
  wifi: 'WiFi',
};

const QR_TYPE_COLORS = {
  url: 'primary',
  text: 'secondary',
  email: 'success',
  phone: 'warning',
  sms: 'danger',
  wifi: 'default',
};

const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return '—';
  return new Date(timestamp.seconds * 1000).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'scanned', label: 'Escaneados' },
  { key: 'unscanned', label: 'Sin escanear' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [allQrCodes, setAllQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const copyShortLink = (id) => {
    const text = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!user?.uid) {
      setAllQrCodes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'qrcodes'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setAllQrCodes(list);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        console.error(err);
      }
    );
    return () => unsubscribe();
  }, [user?.uid]);

  const filtered = allQrCodes.filter((qr) => {
    if (activeFilter === 'scanned') return (qr.scanCount ?? 0) > 0;
    if (activeFilter === 'unscanned') return (qr.scanCount ?? 0) === 0;
    return true;
  });

  const totalScans = allQrCodes.reduce((sum, qr) => sum + (qr.scanCount ?? 0), 0);
  const scannedCount = allQrCodes.filter((qr) => (qr.scanCount ?? 0) > 0).length;

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este código QR? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDoc(doc(db, 'qrcodes', id));
      setSelectedQr(null);
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Resumen y estadísticas de tus códigos QR.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Códigos QR</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{allQrCodes.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Escaneos totales</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{totalScans}</p>
        </div>
        <div className="p-4 rounded-xl border border-green-200 bg-green-50">
          <p className="text-xs text-green-600 uppercase tracking-wide">Escaneados</p>
          <p className="text-2xl font-bold text-green-700 mt-0.5">
            {scannedCount} / {allQrCodes.length}
          </p>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" color="primary" />
          </div>
        ) : allQrCodes.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)] text-sm">
            Aún no tienes códigos. Crea uno desde el Generador.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <HiOutlineFilter className="w-4 h-4 text-[var(--text-muted)]" />
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === f.key
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  {f.label} ({f.key === 'all' ? allQrCodes.length : f.key === 'scanned' ? scannedCount : allQrCodes.length - scannedCount})
                </button>
              ))}
            </div>
            <Table aria-label="Códigos QR" removeWrapper>
              <TableHeader>
                <TableColumn>Tipo</TableColumn>
                <TableColumn>Contenido</TableColumn>
                <TableColumn align="center" className="w-24">Escaneos</TableColumn>
                <TableColumn className="min-w-[140px]">Último escaneo</TableColumn>
                <TableColumn>Link corto</TableColumn>
                <TableColumn align="center" className="w-16">Detalle</TableColumn>
              </TableHeader>
              <TableBody>
                {filtered.map((qr) => {
                  const hasScans = (qr.scanCount ?? 0) > 0;
                  const typeLabel = QR_TYPE_LABELS[qr.type] || 'URL';
                  const typeColor = QR_TYPE_COLORS[qr.type] || 'default';
                  const content = qr.originalUrl || qr.textContent || qr.emailTo || qr.phoneNumber || qr.wifiSsid || '—';

                  return (
                    <TableRow key={qr.id} className="hover:bg-[var(--bg-page)]/50 transition-colors">
                      <TableCell>
                        <Chip size="sm" variant="flat" color={typeColor}>
                          {typeLabel}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-[var(--text)] truncate block max-w-xs">
                          {content}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={hasScans ? 'text-green-700 font-semibold' : 'text-[var(--text-muted)]'}>
                          {qr.scanCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)] text-sm">
                        {qr.lastScanned ? formatDate(qr.lastScanned) : '—'}
                      </TableCell>
                      <TableCell>
                        {qr.shortCode ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[var(--text-muted)] truncate max-w-[100px]">
                              /s/{qr.shortCode}
                            </span>
                            <button
                              onClick={() => copyShortLink(qr.shortCode)}
                              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex-shrink-0"
                            >
                              {copiedId === qr.shortCode ? (
                                <span className="text-[10px] text-green-600 font-medium">✓</span>
                              ) : (
                                <HiOutlineClipboard className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => setSelectedQr(qr)}
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <AnalyticsModal
        qr={selectedQr}
        isOpen={!!selectedQr}
        onClose={() => setSelectedQr(null)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Dashboard;
