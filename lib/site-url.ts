/** 公開サイトのオリジン（末尾スラッシュなし）。Cloudflare では NEXT_PUBLIC_SITE_URL を設定。 */
const DEFAULT_SITE = 'https://hikamerslibrary.vercel.app'

/** env がホストのみ・スキームなしでも有効な https URL に正規化する */
export function getSiteUrl(): string {
  let raw = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE).trim()
  if (!raw) return DEFAULT_SITE
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`
  }
  try {
    return new URL(raw).origin
  } catch {
    return DEFAULT_SITE
  }
}
