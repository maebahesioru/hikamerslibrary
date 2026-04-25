export async function verifyRecaptcha(
  _executeRecaptcha: (action: string) => Promise<string | null>,
  _action: string
): Promise<boolean> {
  return true
}
