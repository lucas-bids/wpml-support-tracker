export function normalizeUrl(input) {
  try {
    const u = new URL(input)
    if (!/^https?:$/.test(u.protocol)) return null
    let pathname = u.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1)
    return `${u.origin}${pathname}`
  } catch {
    return null
  }
}

export function isValidTicketUrl(input) {
  try {
    const u = new URL(input)
    return /^https?:$/.test(u.protocol)
  } catch {
    return false
  }
}


