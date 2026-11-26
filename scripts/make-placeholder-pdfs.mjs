/* Genera los PDF provisionales de /public/docs.
   Sustitúyelos por los documentos reales conservando el nombre de archivo. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/docs');
mkdirSync(out, { recursive: true });

// WinAnsi: los acentos van en octal
const enc = (s) => s
  .replace(/[\\()]/g, (c) => `\\${c}`)
  .replace(/[^\x20-\x7e]/g, (c) => `\\${c.charCodeAt(0).toString(8).padStart(3, '0')}`);

function pdf(title, lines) {
  const text = [
    'BT', '/F1 30 Tf', '72 720 Td', `(${enc(title)}) Tj`,
    '/F2 12 Tf', '0 -34 Td', `(${enc('ADUPA · Asociación de Debate Universitario del Principado de Asturias')}) Tj`,
    ...lines.flatMap((l) => ['0 -22 Td', `(${enc(l)}) Tj`]),
    'ET',
  ].join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(text, 'latin1')} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(body, 'latin1')); body += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(body, 'latin1');
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { body += `${String(o).padStart(10, '0')} 00000 n \n`; });
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

const note = ['', 'Documento provisional.', 'El texto definitivo se publicará aquí en cuanto esté aprobado.', '', 'adupa.es'];
writeFileSync(resolve(out, 'estatutos-adupa.pdf'), pdf('Estatutos', note));
writeFileSync(resolve(out, 'reglamento-adupa.pdf'), pdf('Reglamento de régimen interno', note));
console.log('PDF provisionales creados en', out);
