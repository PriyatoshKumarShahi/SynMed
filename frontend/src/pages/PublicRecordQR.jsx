import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import MedicalHistory from './MedicalHistory';

export default function PublicRecordQR() {
  const { token } = useParams();
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await API.post(`/verify-qr-token`, { token });
        setUserId(res.data.userId);  // returned userId from backend
      } catch (err) {
        setError('Invalid or expired QR code');
      }
    };
    verifyToken();
  }, [token]);

  if (error) return <div>{error}</div>;
  if (!userId) return <div>Loading...</div>;

  // Render MedicalHistory page for this userId
  return <MedicalHistory userId={userId} isQRView={true} />;
}
