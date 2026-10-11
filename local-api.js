// Local dev server: serves this folder AND runs POST /api/contact,
// so the Contact Us form can be tested end-to-end on your own machine.
//
//   1. npm install                      (once, inside website/)
//   2. copy .env.example to .env and put the real Gmail app password in it
//   3. npm run local
//   4. open http://127.0.0.1:4321 and submit the form
//
// IMPORTANT: .env holds a real secret. Delete it (or never upload it) before
// deploying — on Vercel the same values live in Project → Settings →
// Environment Variables instead.
const http = require("http");
const fs = require("fs");
const path = require("path");

// Load ./env (same keys as .env.example) into process.env if present.
try {
  const envText = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  envText.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !m[1].startsWith("#") && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
  console.log("[local-api] loaded .env");
} catch (e) {
  console.log("[local-api] no .env file — /api/contact will report 'not configured'");
}

const handler = require("./api/contact.js");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  if (req.url.split("?")[0] === "/api/contact") {
    let raw = "";
    req.on("data", (c) => { raw += c; });
    req.on("end", () => {
      const fakeReq = { method: req.method, body: raw };
      const fakeRes = {
        status(c) { this._c = c; return this; },
        json(o) {
          res.writeHead(this._c || 200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(o));
        },
      };
      Promise.resolve(handler(fakeReq, fakeRes)).catch(() => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Local handler crashed." }));
      });
    });
    return;
  }

  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(__dirname, p));
  if (!file.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    res.end(data);
  });
});

server.listen(4321, "127.0.0.1", () => {
  console.log("Serving http://127.0.0.1:4321  (static + POST /api/contact)");
});
