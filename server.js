const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

const appDir = __dirname;
const nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');
const nodeExe = process.execPath;

console.log('==================================================');
console.log('  演出技術會議需求管理系統 — 正在啟動...');
console.log('  網址: http://localhost:3000');
console.log('  請勿關閉此視窗（關閉視窗即停止系統）');
console.log('==================================================\n');

// 啟動 Next.js Production 伺服器
const child = spawn(nodeExe, [nextBin, 'start'], {
  cwd: appDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3000',
    NODE_ENV: 'production',
  }
});

let openedBrowser = false;

// 輪詢檢測 localhost:3000 是否已可連線
function checkServer() {
  if (openedBrowser) return;
  const req = http.get('http://localhost:3000', (res) => {
    if (!openedBrowser) {
      openedBrowser = true;
      console.log('\n[✓] 系統伺服器已成功就緒，正在為您開啟瀏覽器...');
      exec('start http://localhost:3000');
    }
  });

  req.on('error', () => {
    if (!openedBrowser) {
      setTimeout(checkServer, 500);
    }
  });
}

// 啟動 800ms 後開始探測
setTimeout(checkServer, 800);

child.on('error', (err) => {
  console.error('[!] 伺服器啟動失敗:', err);
});

child.on('close', (code) => {
  console.log(`\n伺服器已關閉 (代碼: ${code})`);
  process.exit(code || 0);
});
