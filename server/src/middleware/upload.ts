import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Ensure storage directories exist
if (!fs.existsSync(env.UPLOADS_STORAGE_PATH)) {
  fs.mkdirSync(env.UPLOADS_STORAGE_PATH, { recursive: true });
}

if (!fs.existsSync(env.SCRIPTS_STORAGE_PATH)) {
  fs.mkdirSync(env.SCRIPTS_STORAGE_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOADS_STORAGE_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const scriptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.SCRIPTS_STORAGE_PATH);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(cleanName) || '.zip';
    const base = path.basename(cleanName, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

export const uploadScriptZip = multer({
  storage: scriptStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (
      file.originalname.toLowerCase().endsWith('.zip') ||
      file.mimetype.includes('zip') ||
      file.mimetype.includes('octet-stream')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos comprimidos .zip'));
    }
  }
});
