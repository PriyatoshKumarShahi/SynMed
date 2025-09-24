import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import MedicalHistory from './MedicalHistory';

export default function PublicRecord() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await API.get(`/user/public/${userId}`);
        setUserData(res.data);
      } catch (err) {
        setError('Unable to fetch public record');
      }
    };
    fetchRecord();
  }, [userId]);

  if (error) return <div>{error}</div>;
  if (!userData) return <div>Loading...</div>;

  // Pass the fetched record into MedicalHistory component
  return <MedicalHistory userId={userId} isQRView={true} publicData={userData} />;
}
