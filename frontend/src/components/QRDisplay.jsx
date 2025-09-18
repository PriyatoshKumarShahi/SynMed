import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import API from '../utils/api';

export default function QRDisplay({ userId }) {
  const [qrData, setQrData] = useState('');

 
useEffect(() => {
  if (!userId) return;
  const load = async () => {
    try {
      const res = await API.get(`/user/qr/${userId}`);
      setQrData(res.data.url);   // 👈 use the public profile page link
    } catch (err) {
      console.error(err);
    }
  };
  load();
}, [userId]);

return qrData ? <QRCodeCanvas value={qrData} size={300} /> : <div>Loading...</div>;

}
