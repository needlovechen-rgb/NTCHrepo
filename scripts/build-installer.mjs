import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const runtimeDir = path.join(rootDir, 'runtime');
const distDir = path.join(rootDir, 'dist');
const issFile = path.join(rootDir, 'setup.iss');

function findISCC() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
    'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Inno Setup 6', 'ISCC.exe'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function ensureInnoSetup() {
  console.log('[1/4] 檢查 Inno Setup 6 編譯器...');
  let iscc = findISCC();
  if (iscc) {
    console.log(`  ✓ 找到 Inno Setup: ${iscc}`);
    return iscc;
  }

  console.log('  ➜ 正在透過 winget 安裝 Inno Setup 6...');
  try {
    execSync('winget install --id JRSoftware.InnoSetup -e --silent --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
  } catch (e) {
    // ignore
  }

  iscc = findISCC();
  if (!iscc) {
    throw new Error('Inno Setup 未找到，請至 https://jrsoftware.org/isinfo.php 下載並安裝 Inno Setup 6');
  }
  console.log(`  ✓ Inno Setup 6 安裝完成: ${iscc}`);
  return iscc;
}

function ensureBuild() {
  console.log('[2/4] 檢查 Next.js 生產環境 Build...');
  const buildIdPath = path.join(rootDir, '.next', 'BUILD_ID');
  if (!fs.existsSync(buildIdPath)) {
    console.log('  ➜ 執行 npm run build...');
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  }
  console.log('  ✓ .next build 已就緒');
}

function prepareRuntime() {
  console.log('[3/4] 準備 Node.js 執行環境...');
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }
  const targetNodeExe = path.join(runtimeDir, 'node.exe');
  if (!fs.existsSync(targetNodeExe)) {
    const currentNodeExe = process.execPath;
    console.log(`  ➜ 複製 Node.js (${currentNodeExe}) 到 runtime\\node.exe`);
    fs.copyFileSync(currentNodeExe, targetNodeExe);
  }
  console.log('  ✓ runtime 就緒');
}

function runInnoSetup(isccPath) {
  console.log('[4/4] 正在進行高壓縮打包（約需 1-2 分鐘）...');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const result = spawnSync(isccPath, [issFile], { cwd: rootDir, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Inno Setup 打包失敗，Exit code: ${result.status}`);
  }
}

async function main() {
  const startTime = Date.now();
  try {
    const iscc = ensureInnoSetup();
    ensureBuild();
    prepareRuntime();
    runInnoSetup(iscc);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n======================================================');
    console.log(` 🎉 安裝檔打包成功！(耗時 ${elapsed} 秒)`);
    const files = fs.readdirSync(distDir).filter(f => f.endsWith('.exe'));
    for (const f of files) {
      const fullPath = path.join(distDir, f);
      const stat = fs.statSync(fullPath);
      const mb = (stat.size / (1024 * 1024)).toFixed(2);
      console.log(` 📦 安裝檔名稱: ${f}`);
      console.log(` 📂 完整路徑:   ${fullPath}`);
      console.log(` 💾 檔案大小:   ${mb} MB`);
    }
    console.log('------------------------------------------------------');
    console.log(' ✨ 使用說明：');
    console.log(' 1. 將 dist 資料夾內的 .exe 檔案複製至隨身碟');
    console.log(' 2. 在任何 Windows 10/11 電腦上雙擊該 .exe 即可安裝');
    console.log(' 3. 安裝完成後雙擊桌面捷徑即可啟動系統與資料庫');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ 打包過程發生錯誤:', err.message || err);
    process.exit(1);
  }
}

main();
