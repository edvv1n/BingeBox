import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";
import dotenv from "dotenv";
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
dotenv.config({ path: ".env.local" });
dotenv.config();
// Node 18's Fetch implementation may not have the newer Response.json helper.
if (!Response.json)
  Response.json = (data, init = {}) => {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify(data), { ...init, headers });
  };
const moduleURL = (source) =>
  "data:text/javascript;base64," +
  Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
      },
    }).outputText
  ).toString("base64");
const knowledge = moduleURL(await readFile("lib/support-knowledge.ts", "utf8"));
const routes = {};
for (const name of ["chat", "movies"]) {
  const source = (await readFile(`app/api/${name}/route.ts`, "utf8")).replace(
    "../../../lib/support-knowledge.js",
    knowledge
  );
  routes["/api/" + name] = await import(moduleURL(source));
}
const production = process.argv.includes("--production");
const vite = production
  ? null
  : await (
      await import("vite")
    ).createServer({ server: { middlewareMode: true }, appType: "spa" });
const port = Number(process.env.PORT || 5173),
  host = process.env.HOST || "127.0.0.1";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url,
      `http://${req.headers.host || "localhost:" + port}`
    );
    if (url.pathname.startsWith("/api/")) {
      const handler = routes[url.pathname]?.[req.method];
      if (!handler) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      let bytes = 0;
      const chunks = [];
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 20000) {
          res.writeHead(413);
          res.end("Request too large");
          return;
        }
        chunks.push(chunk);
      }
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (v) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
      }
      const result = await handler(
        new Request(url, {
          method: req.method,
          headers,
          ...(req.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
        })
      );
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(Buffer.from(await result.arrayBuffer()));
      return;
    }
    if (vite) {
      vite.middlewares(req, res, () => {
        res.writeHead(404);
        res.end("Not found");
      });
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const base = path.resolve("dist");
    let file = path.resolve(base, "." + decodeURIComponent(url.pathname));
    if (!file.startsWith(base + path.sep) && file !== base) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      if (!(await stat(file)).isFile()) file = path.join(base, "index.html");
    } catch {
      if (path.extname(file)) {
        res.writeHead(404);
        res.end();
        return;
      }
      file = path.join(base, "index.html");
    }
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream"
    );
    res.end(req.method === "HEAD" ? undefined : await readFile(file));
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Server error. Check configuration and try again.",
      })
    );
  }
});
server.listen(port, host, () =>
  console.log(
    `BingeBox: http://${host}:${port} (${
      production ? "built app" : "development"
    })`
  )
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close();
    vite?.close().finally(() => process.exit());
    if (!vite) process.exit();
  });
