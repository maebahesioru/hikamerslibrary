// ビルド後のrecovery: prerender-manifest.jsonがなければ最小限のものを作成
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// pip依存パッケージをインストール（scraper API用）
try {
  console.log('[postbuild] Installing Python packages for scraper...')
  execSync('pip3 install httpx orjson python-dotenv regex psycopg2-binary 2>&1', {
    stdio: 'pipe',
    timeout: 120000,
  })
  console.log('[postbuild] Python packages installed')
} catch (e) {
  console.log('[postbuild] pip install issue (non-fatal):', e.message?.slice(0, 200))
}

const manifestPath = path.join(__dirname, '..', '.next', 'prerender-manifest.json')

if (!fs.existsSync(manifestPath)) {
  console.log('[postbuild] Creating minimal prerender-manifest.json')
  const manifest = {
    version: 4,
    routes: {},
    dynamicRoutes: {},
    notFoundRoutes: [],
    preview: {
      previewModeId: '',
      previewModeSigningKey: '',
      previewModeEncryptionKey: ''
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log('[postbuild] prerender-manifest.json created')
} else {
  console.log('[postbuild] prerender-manifest.json already exists')
}
