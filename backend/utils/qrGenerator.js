const QRCode = require('qrcode');

async function generateDataUrl(payload) {
  // payload should be small-ish; in production encrypt and/or host on a public endpoint
  const str = JSON.stringify(payload);
  return await QRCode.toDataURL(str, { errorCorrectionLevel: 'H' });
}

module.exports = { generateDataUrl };
