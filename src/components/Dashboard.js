import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from '@heroui/react';

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

const Dashboard = () => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setQrCodes([]);
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
        setQrCodes(list);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        console.error(err);
      }
    );
    return () => unsubscribe();
  }, [user?.uid]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Tus códigos QR</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          URLs y estadísticas de escaneo.
        </p>
      </div>

      <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" color="primary" />
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)] text-sm">
            Aún no tienes códigos. Crea uno desde el Generador.
          </div>
        ) : (
          <Table aria-label="Códigos QR" removeWrapper>
            <TableHeader>
              <TableColumn>URL destino</TableColumn>
              <TableColumn align="center" className="w-24">Escaneos</TableColumn>
              <TableColumn className="min-w-[160px]">Último escaneo</TableColumn>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    <a
                      href={qr.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline truncate block max-w-md"
                    >
                      {qr.originalUrl}
                    </a>
                  </TableCell>
                  <TableCell className="text-center">{qr.scanCount ?? 0}</TableCell>
                  <TableCell className="text-[var(--text-muted)] text-sm">
                    {qr.lastScanned ? formatDate(qr.lastScanned) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
