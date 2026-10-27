// Equivalente a los redirects de "/" de vercel.json: cookie `lang` > Accept-Language > inglés.
export function onRequest({ request }) {
  const url = new URL(request.url)
  const cookie = request.headers.get('Cookie') || ''
  const lang = /(?:^|;\s*)lang=(en|es)(?:;|$)/.exec(cookie)?.[1]
  const accept = request.headers.get('Accept-Language') || ''
  const target = lang ?? (/^\s*es/i.test(accept) ? 'es' : 'en')
  return Response.redirect(`${url.origin}/${target}`, 307)
}
