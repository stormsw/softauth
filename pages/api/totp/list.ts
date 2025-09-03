import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'totp-items.json');

interface TotpItem {
  id: string;
  name: string;
  secret: string;
  createdAt: string;
}

function loadItems(): TotpItem[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading items:', error);
  }
  return [];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const items = loadItems();
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching TOTP items:', error);
    return res.status(500).json({ error: 'Failed to fetch TOTP items' });
  }
}
