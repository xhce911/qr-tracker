import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, Card, Button } from '@heroui/react';

const Dashboard = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'qrcodes'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const codes = [];
      querySnapshot.forEach((doc) => {
        codes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setQrCodes(codes);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Tus Códigos QR</h2>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>URL</Table.Header>
              <Table.Header>Escaneos</Table.Header>
              <Table.Header>Último escaneo</Table.Header>
              <Table.Header>Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {qrCodes.map((qr) => (
              <Table.Row key={qr.id}>
                <Table.Cell>{qr.originalUrl}</Table.Cell>
                <Table.Cell>{qr.scanCount}</Table.Cell>
                <Table.Cell>
                  {qr.lastScanned ? new Date(qr.lastScanned.seconds * 1000).toLocaleString() : 'Nunca'}
                </Table.Cell>
                <Table.Cell>
                  <Button size="sm" variant="outline">
                    Ver detalles
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Card>
  );
};

export default Dashboard;