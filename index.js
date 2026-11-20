// Relay per gli open data del Portale Offerte (ARERA / Acquirente Unico), in esecuzione a Milano.
// Scarica solo pagine/file del Portale Offerte e li restituisce compressi (gzip).
// Accesso consentito solo con l'header x-relay-key uguale alla variabile RELAY_KEY.
const functions = require("@google-cloud/functions-framework");
const zlib = require("zlib");
const BASE = "https://www.ilportaleofferte.it";
const PATH_OK = /^\/portaleOfferte\/[A-Za-z0-9_\-\/\.]+$/;

functions.http("po", async (req, res) => {
  if (!process.env.RELAY_KEY || req.get("x-relay-key") !== process.env.RELAY_KEY) return res.status(401).send("unauthorized");
  const p = String(req.query.p || "");
  if (!PATH_OK.test(p) || p.includes("..")) return res.status(400).send("bad path");
  try {
    const r = await fetch(BASE + p, { headers: { "User-Agent": "comparaoffertelucegas.it (open data)" } });
    if (!r.ok) return res.status(r.status).send("upstream " + r.status);
    const gz = zlib.gzipSync(Buffer.from(await r.arrayBuffer()), { level: 9 });
    res.set("Content-Type", "application/gzip").set("Cache-Control", "no-store").status(200).send(gz);
  } catch (e) {
    res.status(502).send("error " + e.message);
  }
});
