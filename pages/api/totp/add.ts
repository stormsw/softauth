import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Simple file-based storage for demo purposes
// In production, you'd use a proper database
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, secret } = req.body;

  if (!name || !secret) {
    return res.status(400).json({ error: 'Name and secret are required' });
  }

  try {
    const items = loadItems();
    
    // Check if name already exists
    if (items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: 'A TOTP item with this name already exists' });
    }

    const newItem: TotpItem = {
      id: uuidv4(),
      name,
      secret: secret.toUpperCase().replace(/\s/g, ''),
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    saveItems(items);

    return res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding TOTP item:', error);
    return res.status(500).json({ error: 'Failed to add TOTP item' });
  }
}
