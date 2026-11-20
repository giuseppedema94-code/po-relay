// Relay per gli open data del Portale Offerte (ARERA / Acquirente Unico).
// Il Portale non risponde ai server statunitensi di GitHub: questa funzione gira a Francoforte,
// scarica solo file del Portale Offerte e li restituisce compressi (gzip).
// Accesso solo con la chiave segreta RELAY_KEY.
const zlib = require("zlib");

const BASE = "https://www.ilportaleofferte.it";
const PATH_OK = /^\/portaleOfferte\/[A-Za-z0-9_\-\/\.]+$/;

module.exports = async (req, res) => {
  if (!process.env.RELAY_KEY || req.headers["x-relay-key"] !== process.env.RELAY_KEY) {
    res.statusCode = 401; return res.end("unauthorized");
  }
  const p = String(req.query.p || "");
  if (!PATH_OK.test(p) || p.includes("..")) { res.statusCode = 400; return res.end("bad path"); }
  try {
    const r = await fetch(BASE + p, { headers: { "User-Agent": "comparaoffertelucegas.it (open data)" } });
    if (!r.ok) { res.statusCode = r.status; return res.end("upstream " + r.status); }
    const buf = Buffer.from(await r.arrayBuffer());
    const gz = zlib.gzipSync(buf, { level: 9 });
    res.setHeader("Content-Type", "application/gzip");
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 200; res.end(gz);
  } catch (e) {
    res.statusCode = 502; res.end("error " + e.message);
  }
};
