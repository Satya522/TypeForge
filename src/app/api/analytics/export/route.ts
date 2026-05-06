import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-security';

type ExportFormat = 'csv' | 'google-sheets' | 'html' | 'json' | 'md' | 'ndjson' | 'tsv' | 'txt' | 'xls' | 'xml';

const EXPORT_COLUMNS = [
  ['Date', 'date'],
  ['WPM', 'wpm'],
  ['Raw WPM', 'rawWpm'],
  ['Accuracy', 'accuracy'],
  ['Consistency', 'consistency'],
  ['Duration', 'duration'],
] as const;

const safeSpreadsheetValue = (value: string | number) => {
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
};

const escapeDelimited = (value: string | number, delimiter: ',' | '\t') => {
  const text = safeSpreadsheetValue(value);
  const mustQuote = delimiter === ',' ? /[",\n\r]/.test(text) : /["\t\n\r]/.test(text);
  return mustQuote ? `"${text.replace(/"/g, '""')}"` : text;
};

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeFormat = (value: string | null): ExportFormat => {
  if (
    value === 'google-sheets' ||
    value === 'html' ||
    value === 'json' ||
    value === 'md' ||
    value === 'ndjson' ||
    value === 'tsv' ||
    value === 'txt' ||
    value === 'xls' ||
    value === 'xml'
  ) return value;
  return 'csv';
};

const contentTypeByFormat: Record<ExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  'google-sheets': 'text/csv; charset=utf-8',
  html: 'text/html; charset=utf-8',
  json: 'application/json; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  ndjson: 'application/x-ndjson; charset=utf-8',
  tsv: 'text/tab-separated-values; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  xls: 'application/vnd.ms-excel; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
};

const filenameByFormat: Record<ExportFormat, string> = {
  csv: 'analytics.csv',
  'google-sheets': 'analytics-google-sheets.csv',
  html: 'analytics.html',
  json: 'analytics.json',
  md: 'analytics.md',
  ndjson: 'analytics.ndjson',
  tsv: 'analytics.tsv',
  txt: 'analytics.txt',
  xls: 'analytics.xls',
  xml: 'analytics.xml',
};

type ExportColumnKey = (typeof EXPORT_COLUMNS)[number][1];

const formatReportDate = (value: string | number) => {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

const formatReportValue = (key: ExportColumnKey, value: string | number) => {
  if (key === 'date') return formatReportDate(value);
  if (key === 'accuracy' || key === 'consistency') return `${Number(value).toFixed(1).replace(/\.0$/, '')}%`;
  if (key === 'duration') return `${value}s`;
  return String(value);
};

const reportLabel = (label: string, key: ExportColumnKey) => {
  if (key === 'duration') return 'Duration';
  if (key === 'accuracy' || key === 'consistency') return label;
  return label;
};

/**
 * API route to export a user's practice session statistics in multiple formats.
 * Only authenticated users can access their own data.
 */
export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`analytics-export:${session.user.id}:${ip}`, 10, 10 * 60 * 1000);
  if (!rateLimit.ok) {
    return new Response(JSON.stringify({ error: 'Too many export requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id;
  const format = normalizeFormat(req.nextUrl.searchParams.get('format'));
  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { sessionDate: 'asc' },
  });

  const rows = sessions.map((s) => ({
    date: s.sessionDate.toISOString(),
    wpm: s.wpm,
    rawWpm: s.rawWpm,
    accuracy: s.accuracy,
    consistency: s.consistency,
    duration: s.sessionDuration,
  }));

  const exportedAt = new Date();
  const bestWpm = rows.length ? Math.max(...rows.map((row) => row.wpm)) : 0;
  const avgAccuracy = rows.length
    ? rows.reduce((total, row) => total + row.accuracy, 0) / rows.length
    : 0;
  const totalMinutes = Math.round(rows.reduce((total, row) => total + row.duration, 0) / 60);
  const reportTitle = 'TypeForge Analytics Export';
  const exportedAtIso = exportedAt.toISOString();
  const exportedAtDisplay = formatReportDate(exportedAtIso);
  const summary = {
    sessions: rows.length,
    bestWpm,
    averageAccuracy: Number(avgAccuracy.toFixed(2)),
    totalMinutes,
  };
  const summaryRows: Array<[string, string | number]> = [
    ['Report', reportTitle],
    ['Exported', exportedAtDisplay],
    ['Sessions', rows.length],
    ['Best WPM', bestWpm],
    ['Avg Accuracy', formatReportValue('accuracy', avgAccuracy)],
    ['Total Time', `${totalMinutes}m`],
  ];
  const displayRows = rows.map((row) => ({
    date: formatReportValue('date', row.date),
    wpm: formatReportValue('wpm', row.wpm),
    rawWpm: formatReportValue('rawWpm', row.rawWpm),
    accuracy: formatReportValue('accuracy', row.accuracy),
    consistency: formatReportValue('consistency', row.consistency),
    duration: formatReportValue('duration', row.duration),
  }));

  const delimited = (delimiter: ',' | '\t') => [
    [reportTitle].map((value) => escapeDelimited(value, delimiter)).join(delimiter),
    ...summaryRows.slice(1).map(([label, value]) => [label, value].map((cell) => escapeDelimited(cell, delimiter)).join(delimiter)),
    '',
    EXPORT_COLUMNS.map(([label, key]) => escapeDelimited(reportLabel(label, key), delimiter)).join(delimiter),
    ...displayRows.map((row) => EXPORT_COLUMNS.map(([, key]) => escapeDelimited(row[key], delimiter)).join(delimiter)),
  ].join('\n');

  const htmlTable = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>TypeForge Analytics Export</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; }
      body {
        background: #050608;
        color: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        padding: 28px;
      }
      .report {
        max-width: 1120px;
        margin: 0 auto;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 18px;
        background:
          radial-gradient(circle at top left, rgba(139, 92, 246, 0.18), transparent 34%),
          radial-gradient(circle at top right, rgba(34, 211, 238, 0.14), transparent 32%),
          #0b0d10;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
      }
      .header {
        padding: 24px 26px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      }
      .eyebrow {
        color: #a78bfa;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      h1 {
        margin: 6px 0 8px;
        color: #ffffff;
        font-size: 28px;
        line-height: 1.1;
      }
      .meta {
        color: #94a3b8;
        font-size: 13px;
      }
      .summary {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 12px;
        padding: 18px 26px 0;
      }
      .summary-card {
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.045);
        padding: 12px 14px;
      }
      .summary-card span {
        display: block;
        color: #818cf8;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .summary-card strong {
        display: block;
        margin-top: 6px;
        color: #f8fafc;
        font-size: 20px;
      }
      .table-wrap {
        overflow-x: auto;
        padding: 20px 26px 26px;
      }
      table {
        width: 100%;
        min-width: 760px;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 14px;
        background: rgba(2, 6, 23, 0.78);
      }
      th {
        background: rgba(15, 23, 42, 0.98);
        color: #f8fafc;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-align: left;
        text-transform: uppercase;
      }
      th, td {
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        padding: 13px 14px;
      }
      td {
        color: #e2e8f0;
        font-size: 14px;
        font-variant-numeric: tabular-nums;
      }
      tbody tr:nth-child(even) td {
        background: rgba(255, 255, 255, 0.025);
      }
      tbody tr:hover td {
        background: rgba(139, 92, 246, 0.12);
      }
      tbody tr:last-child td {
        border-bottom: 0;
      }
      .date-cell {
        color: #bfdbfe;
        white-space: nowrap;
      }
      .metric-cell {
        color: #ffffff;
        font-weight: 800;
      }
      .footer {
        border-top: 1px solid rgba(148, 163, 184, 0.14);
        color: #64748b;
        font-size: 12px;
        padding: 14px 26px 20px;
      }
    </style>
  </head>
  <body>
    <main class="report">
      <section class="header">
        <div class="eyebrow">TypeForge Export</div>
        <h1>Analytics Report</h1>
        <div class="meta">Exported ${escapeHtml(exportedAtDisplay)}</div>
      </section>
      <section class="summary">
        <div class="summary-card"><span>Sessions</span><strong>${rows.length}</strong></div>
        <div class="summary-card"><span>Best WPM</span><strong>${bestWpm}</strong></div>
        <div class="summary-card"><span>Avg Accuracy</span><strong>${formatReportValue('accuracy', avgAccuracy)}</strong></div>
        <div class="summary-card"><span>Total Time</span><strong>${totalMinutes}m</strong></div>
      </section>
      <section class="table-wrap">
        <table>
          <thead>
            <tr>${EXPORT_COLUMNS.map(([label, key]) => `<th>${escapeHtml(reportLabel(label, key))}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => `<tr>${EXPORT_COLUMNS.map(([, key]) => {
                const className = key === 'date' ? 'date-cell' : 'metric-cell';
                return `<td class="${className}">${escapeHtml(formatReportValue(key, row[key]))}</td>`;
              }).join('')}</tr>`)
              .join('')}
          </tbody>
        </table>
      </section>
      <footer class="footer">Generated by TypeForge Analytics.</footer>
    </main>
  </body>
</html>`;

  const bodyByFormat: Record<ExportFormat, string> = {
    csv: `\uFEFF${delimited(',')}`,
    'google-sheets': `\uFEFF${delimited(',')}`,
    html: htmlTable,
    json: JSON.stringify({
      title: reportTitle,
      exportedAt: exportedAtIso,
      timezone: 'Asia/Kolkata',
      summary,
      columns: EXPORT_COLUMNS.map(([label, key]) => ({ key, label: reportLabel(label, key) })),
      sessions: rows.map((row, index) => ({ ...row, display: displayRows[index] })),
    }, null, 2),
    md: [
      `# ${reportTitle}`,
      '',
      `Exported: ${exportedAtDisplay}`,
      '',
      '## Summary',
      '',
      '| Metric | Value |',
      '| --- | --- |',
      ...summaryRows.slice(2).map(([label, value]) => `| ${label} | ${value} |`),
      '',
      '## Session Data',
      '',
      `| ${EXPORT_COLUMNS.map(([label, key]) => reportLabel(label, key)).join(' | ')} |`,
      `| ${EXPORT_COLUMNS.map(() => '---').join(' | ')} |`,
      ...displayRows.map((row) => `| ${EXPORT_COLUMNS.map(([, key]) => row[key]).join(' | ')} |`),
    ].join('\n'),
    ndjson: [
      JSON.stringify({ type: 'report', title: reportTitle, exportedAt: exportedAtIso, timezone: 'Asia/Kolkata' }),
      JSON.stringify({ type: 'summary', ...summary }),
      JSON.stringify({ type: 'columns', columns: EXPORT_COLUMNS.map(([label, key]) => ({ key, label: reportLabel(label, key) })) }),
      ...rows.map((row, index) => JSON.stringify({ type: 'session', data: row, display: displayRows[index] })),
    ].join('\n'),
    tsv: `\uFEFF${delimited('\t')}`,
    txt: [
      reportTitle,
      '='.repeat(reportTitle.length),
      '',
      ...summaryRows.slice(1).map(([label, value]) => `${label}: ${value}`),
      '',
      'Session Data',
      '-'.repeat(12),
      '',
      EXPORT_COLUMNS.map(([label, key]) => reportLabel(label, key).padEnd(key === 'date' ? 24 : 14)).join(''),
      ...displayRows.map((row) =>
        EXPORT_COLUMNS.map(([, key]) => String(row[key]).padEnd(key === 'date' ? 24 : 14)).join(''),
      ),
    ].join('\n'),
    xls: htmlTable,
    xml: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<analyticsReport>',
      `  <title>${escapeHtml(reportTitle)}</title>`,
      `  <exportedAt>${escapeHtml(exportedAtIso)}</exportedAt>`,
      '  <summary>',
      `    <sessions>${summary.sessions}</sessions>`,
      `    <bestWpm>${summary.bestWpm}</bestWpm>`,
      `    <averageAccuracy>${summary.averageAccuracy}</averageAccuracy>`,
      `    <totalMinutes>${summary.totalMinutes}</totalMinutes>`,
      '  </summary>',
      '  <sessions>',
      ...rows.map((row) => [
        '    <session>',
        ...EXPORT_COLUMNS.map(([, key]) => `    <${key}>${escapeHtml(row[key])}</${key}>`),
        '    </session>',
      ].join('\n')),
      '  </sessions>',
      '</analyticsReport>',
    ].join('\n'),
  };

  return new Response(bodyByFormat[format], {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': contentTypeByFormat[format],
      'Content-Disposition': `attachment; filename="${filenameByFormat[format]}"`,
    },
  });
}
