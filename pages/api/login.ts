import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import * as crypto from 'crypto';
import { parse } from 'yaml';

// Define the shape of our configuration
interface AdminConfig {
  username: string;
  salt: string;
  password: string;
}

interface Config {
  admin: AdminConfig;
}

// Load and parse the configuration from config.yaml
const configPath = path.join(process.cwd(), 'config.yaml');
const file = fs.readFileSync(configPath, 'utf8');
const config: Config = parse(file);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email, password } = req.body;

  // Check if the provided email matches the admin username
  if (email !== config.admin.username) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Hash the provided password using the salt from the config
  const hash = crypto.pbkdf2Sync(password, config.admin.salt, 1000, 64, 'sha512').toString('hex');

  if (hash === config.admin.password) {
    return res.status(200).json({ message: 'Login success' });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
