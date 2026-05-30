// ビルド後のrecovery: prerender-manifest.jsonがなければ最小限のものを作成
const fs = require('fs')
const path = require('path')

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
