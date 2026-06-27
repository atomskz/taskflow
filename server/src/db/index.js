// Single shared SQLite connection (Node's built-in node:sqlite — no native deps).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

// Ensure the data directory exists before opening the file.
fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });

export const db = new DatabaseSync(config.databaseFile);

// Pragmas: enforce FKs and use WAL for better concurrent read/write behaviour.
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
