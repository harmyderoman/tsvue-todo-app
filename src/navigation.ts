/** Recover direct route URLs redirected through index.html by GitHub Pages. */
export function initialRoute(url: URL, base: string): string | null {
  const baseUrl = new URL(base, url.origin)
  const redirected = url.searchParams.get('__route')
  if (redirected) {
    try {
      const target = new URL(redirected, url.origin)
      if (target.origin === url.origin && target.pathname.startsWith(baseUrl.pathname)) {
        return target.pathname + target.search + target.hash
      }
    } catch {
      // Ignore malformed redirect parameters and open the normal route.
    }
  }
  return null
}
