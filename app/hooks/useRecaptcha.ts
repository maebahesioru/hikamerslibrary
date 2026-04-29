'use client'

export function useRecaptcha() {
  const executeRecaptcha = async (_action: string): Promise<string | null> => 'skip'
  return { isLoaded: true, executeRecaptcha }
}
