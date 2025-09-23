const QRCode = require('qrcode');

async function generateDataUrl(payload) {
  const str = JSON.stringify(payload);
  return await QRCode.toDataURL(str, { errorCorrectionLevel: 'H' });
}

module.exports = { generateDataUrl };
