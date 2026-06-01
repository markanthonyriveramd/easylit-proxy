const ALLOWED_HOSTS = [
  'pmc.ncbi.nlm.nih.gov',
  'ncbi.nlm.nih.gov',
  'europepmc.org',
  'www.nejm.org',
  'nejm.org',
  'jamanetwork.com',
  'www.jamanetwork.com',
  'ahajournals.org',
  'www.ahajournals.org',
  'onlinelibrary.wiley.com',
  'academic.oup.com',
  'www.thelancet.com',
  'thelancet.com',
  'bmj.com',
  'www.bmj.com',
  'link.springer.com',
  'downloads.hindawi.com',
  'journals.plos.org',
  'diabetesjournals.org',
  'www.diabetesjournals.org',
  'jasn.asnjournals.org',
  'cjasn.asnjournals.org',
  'www.kidney-international.org',
  'kidney-international.org',
  'arxiv.org',
  'biorxiv.org',
  'medrxiv.org',
];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  let parsedUrl;
  try { parsedUrl = new URL(url); }
  catch(e) { return res.status(400).send('Invalid URL'); }

  const host = parsedUrl.hostname.toLowerCase();
  const allowed = ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
  if (!allowed) return res.status(403).send('Host not allowed');

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': parsedUrl.origin + '/',
      }
    });

    if (!response.ok) return res.status(response.status).send('Upstream error: ' + response.status);

    const contentType = response.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));
  } catch(e) {
    res.status(500).send('Fetch error: ' + e.message);
  }
}
