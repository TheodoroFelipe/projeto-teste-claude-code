// NÃO é segurança real: hash só no cliente, sem estratégia de salt que
// importe, totalmente inspecionável/contornável via devtools. Existe só
// para não guardar senha em texto puro no localStorage.
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
