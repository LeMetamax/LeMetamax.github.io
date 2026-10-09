import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, `http://localhost:${port}`);
        const pathname = decodeURIComponent(url.pathname);
        const isGame = pathname === '/Exbots-Revolution' || pathname.startsWith('/Exbots-Revolution/');
        const folder = path.join(root, isGame ? 'Exbots-Revolution' : 'MetamaxWeb');
        const relative = isGame ? pathname.slice('/Exbots-Revolution'.length) : pathname;
        let filename = path.resolve(folder, '.' + (relative || '/'));
        if (filename !== folder && !filename.startsWith(folder + path.sep)) {
            response.writeHead(403).end('Forbidden');
            return;
        }
        const stat = await fs.stat(filename);
        if (stat.isDirectory()) {
            if (!pathname.endsWith('/')) {
                response.writeHead(302, { Location: pathname + '/' }).end();
                return;
            }
            filename = path.join(filename, 'index.html');
        }
        let content = await fs.readFile(filename);
        if (filename.endsWith('.html')) {
            // Keep cross-repository navigation local during preview, without changing production metadata.
            content = content.toString().replaceAll('href="https://lemetamax.github.io/', 'href="/');
        }
        response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' });
        response.end(content);
    } catch {
        response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    }
});
server.listen(port, '0.0.0.0', () => console.log(`Studio: http://localhost:${port}/\nGame: http://localhost:${port}/Exbots-Revolution/`));
