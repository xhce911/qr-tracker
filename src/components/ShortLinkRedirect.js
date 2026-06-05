import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Spinner } from '@heroui/react';

const ShortLinkRedirect = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const resolve = async () => {
      try {
        const q = query(
          collection(db, 'qrcodes'),
          where('shortCode', '==', shortCode),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setError('Enlace no encontrado');
          return;
        }
        const doc = snapshot.docs[0];
        navigate(`/scan/${doc.id}`, { replace: true });
      } catch (err) {
        setError('Error al resolver el enlace');
      }
    };
    resolve();
  }, [shortCode, navigate]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" color="primary" />
    </div>
  );
};

export default ShortLinkRedirect;
