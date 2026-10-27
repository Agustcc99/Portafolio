// Cloudflare Workers (static assets): redirect de "/" por cookie `lang` > Accept-Language > inglés.
// El resto lo sirve el binding de assets (con fallback SPA, ver wrangler.jsonc).
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/') {
      const cookie = request.headers.get('Cookie') || ''
      const lang = /(?:^|;\s*)lang=(en|es)(?:;|$)/.exec(cookie)?.[1]
      const accept = request.headers.get('Accept-Language') || ''
      const target = lang ?? (/^\s*es/i.test(accept) ? 'es' : 'en')
      return Response.redirect(`${url.origin}/${target}`, 307)
    }
    return env.ASSETS.fetch(request)
  },
}
