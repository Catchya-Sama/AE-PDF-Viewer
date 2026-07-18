/**
 * copy-cep.mjs — Copies the Vite build output (dist/) into the Adobe CEP
 * extensions folder so After Effects can load the panel.
 *
 * Usage:  node scripts/copy-cep.mjs
 *
 * This script:
 *   1. Copies everything from dist/ into the CEP extensions folder
 *   2. Copies CSXS/manifest.xml, .debug, jsx/, mimetype into the target
 *   3. Creates a symlink from Program Files (x86) CEP folder to the
 *      user-writable AppData CEP folder (Windows only, for dev)
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync, symlinkSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Paths
const distDir = join(projectRoot, 'dist');
const csxsDir = join(projectRoot, 'CSXS');
const jsxDir = join(projectRoot, 'jsx');
const mimetypeFile = join(projectRoot, 'mimetype');
const debugFile = join(projectRoot, '.debug');

// Read bundle id from manifest
let bundleId = 'com.catchya.pdfviewer';
try {
  const manifest = readFileSync(join(csxsDir, 'manifest.xml'), 'utf-8');
  const match = manifest.match(/ExtensionBundleId="([^"]+)"/);
  if (match) bundleId = match[1];
} catch (e) {
  console.warn('Could not read manifest, using default bundle id:', bundleId);
}

// CEP target folders
const homeDir = process.env.USERPROFILE || process.env.HOME;
const cepAppDataDir = join(homeDir, 'AppData', 'Roaming', 'Adobe', 'CEP', 'extensions', bundleId);
const cepProgramDir = join('C:', 'Program Files (x86)', 'Common Files', 'Adobe', 'CEP', 'extensions', bundleId);

console.log('=== CEP Copy Script ===');
console.log('Bundle ID:', bundleId);
console.log('Source (dist):', distDir);
console.log('Target (AppData):', cepAppDataDir);
console.log('Symlink (Program Files):', cepProgramDir);
console.log('');

// 1. Ensure AppData target exists and is clean
if (existsSync(cepAppDataDir)) {
  console.log('Cleaning existing AppData target...');
  rmSync(cepAppDataDir, { recursive: true, force: true });
}
mkdirSync(cepAppDataDir, { recursive: true });

// 2. Copy dist/ contents into AppData target
function copyDirRecursive(src, dest) {
  if (!existsSync(src)) return;
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying dist/ build output...');
copyDirRecursive(distDir, cepAppDataDir);

// 3. Copy CSXS/manifest.xml
console.log('Copying CSXS/manifest.xml...');
mkdirSync(join(cepAppDataDir, 'CSXS'), { recursive: true });
copyFileSync(join(csxsDir, 'manifest.xml'), join(cepAppDataDir, 'CSXS', 'manifest.xml'));

// 4. Copy jsx/ folder
console.log('Copying jsx/ folder...');
mkdirSync(join(cepAppDataDir, 'jsx'), { recursive: true });
copyDirRecursive(jsxDir, join(cepAppDataDir, 'jsx'));

// 5. Copy mimetype and .debug
console.log('Copying mimetype and .debug...');
copyFileSync(mimetypeFile, join(cepAppDataDir, 'mimetype'));
copyFileSync(debugFile, join(cepAppDataDir, '.debug'));

// 6. Create symlink in Program Files (x86) if it doesn't exist
//    (Windows: CEP reads from Program Files, but we symlink to AppData
//     so we don't need admin rights for every rebuild)
if (process.platform === 'win32') {
  if (!existsSync(cepProgramDir)) {
    console.log('Creating symlink in Program Files (x86)...');
    console.log('  (This may require admin rights the first time)');
    try {
      // Try to create symlink (may fail without admin)
      symlinkSync(cepAppDataDir, cepProgramDir, 'junction');
      console.log('  Symlink created successfully.');
    } catch (e) {
      console.warn('  Could not create symlink:', e.message);
      console.warn('  Please manually create a junction:');
      console.warn('    mklink /J "' + cepProgramDir + '" "' + cepAppDataDir + '"');
      console.warn('  (Run cmd as Administrator)');
    }
  } else {
    console.log('Symlink already exists in Program Files (x86).');
  }
}

console.log('');
console.log('=== Done! ===');
console.log('Extension installed to:', cepAppDataDir);
console.log('');
console.log('Next steps:');
console.log('  1. Open After Effects 2020');
console.log('  2. Window > Extensions > PDF Viewer');
console.log('  3. For debugging: http://localhost:8088');