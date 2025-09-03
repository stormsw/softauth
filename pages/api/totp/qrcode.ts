import type { NextApiRequest, NextApiResponse } from 'next';
import * as QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, secret, issuer = 'SoftAuth' } = req.body;

  if (!name || !secret) {
    return res.status(400).json({ error: 'Name and secret are required' });
  }

  try {
    // Create the TOTP URI
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(name)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return res.status(200).json({ qrCodeUrl, otpAuthUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
