import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createApp } from './app';
import { createDatabase } from './db/database';

dotenv.config();

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = createDatabase();
const app = createApp(db);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Car Dealership Inventory API listening on port ${PORT}`);
});
