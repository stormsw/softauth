import type { NextApiRequest, NextApiResponse } from 'next';
import * as speakeasy from 'speakeasy';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { secret } = req.body;

  if (!secret) {
    return res.status(400).json({ error: 'Secret is required' });
  }

  try {
    const otp = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      time: Math.floor(Date.now() / 1000),
      step: 30
    });

    return res.status(200).json({ otp });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return res.status(500).json({ error: 'Failed to generate OTP' });
  }
}
