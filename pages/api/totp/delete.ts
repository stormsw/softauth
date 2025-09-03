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

function saveItems(items: TotpItem[]): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Error saving items:', error);
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  try {
    const items = loadItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'TOTP item not found' });
    }

    const deletedItem = items.splice(itemIndex, 1)[0];
    saveItems(items);

    return res.status(200).json({ message: 'TOTP item deleted successfully', deletedItem });
  } catch (error) {
    console.error('Error deleting TOTP item:', error);
    return res.status(500).json({ error: 'Failed to delete TOTP item' });
  }
}
