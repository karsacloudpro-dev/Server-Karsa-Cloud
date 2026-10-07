import os from 'os';

export function renderWebTerminalHtml(host: string, initialCwd: string): string {
  const hostname = 'ubuntu';
  const username = 'karsacloud';
  const platform = `Ubuntu Linux (x86_64)`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content, viewport-fit=cover" />
  <title>Karsa Cloud PRO Web SSH Terminal — ${host}</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    /* Modern Cloud (Awan) Theme Core Variables */
    :root {
      --cloud-bg: #0b1526;
      --cloud-screen: #070e1b;
      --cloud-header: rgba(15, 29, 52, 0.95);
      --cloud-dock: rgba(13, 26, 46, 0.98);
      --cloud-quickbar: #0c1b30;
      --cloud-border: rgba(56, 189, 248, 0.28);
      --cloud-border-strong: rgba(56, 189, 248, 0.6);
      --cloud-text: #f0f7ff;
      --cloud-text-muted: #93a8c7;
      --cloud-primary: #0284c7;
      --cloud-primary-hover: #0369a1;
      --cloud-cyan: #38bdf8;
      --cloud-card: rgba(18, 36, 64, 0.82);
      --cloud-input-bg: #0e2440;
      --cloud-key-bg: #142e50;
      --cloud-key-text: #bae6fd;
      --cloud-prompt-user: #10b981;
      --cloud-prompt-path: #38bdf8;
    }

    /* Light Cloud Theme (Awan Putih Murni Modern) */
    body.theme-light-cloud {
      --cloud-bg: #f4f8fe;
      --cloud-screen: #ffffff;
      --cloud-header: rgba(255, 255, 255, 0.96);
      --cloud-dock: rgba(255, 255, 255, 0.98);
      --cloud-quickbar: #edf5fe;
      --cloud-border: rgba(14, 165, 233, 0.22);
      --cloud-border-strong: #0284c7;
      --cloud-text: #0f172a;
      --cloud-text-muted: #475569;
      --cloud-primary: #0284c7;
      --cloud-primary-hover: #0369a1;
      --cloud-cyan: #0284c7;
      --cloud-card: rgba(255, 255, 255, 0.94);
      --cloud-input-bg: #f8fafc;
      --cloud-key-bg: #e0f2fe;
      --cloud-key-text: #0369a1;
      --cloud-prompt-user: #059669;
      --cloud-prompt-path: #0284c7;
    }

    html, body {
      height: 100%;
      width: 100%;
      background: var(--cloud-bg);
      color: var(--cloud-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow: hidden;
      position: fixed;
      inset: 0;
      transition: background-color 0.25s ease, color 0.25s ease;
    }
    
    /* Layout */
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      max-height: 100vh;
      max-height: 100dvh;
      width: 100vw;
      overflow: hidden;
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, transparent 55%), var(--cloud-bg);
    }
    
    /* Header (Modern Cloud Navigation) */
    .terminal-header {
      background: var(--cloud-header);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--cloud-border);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      gap: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-shadow: 0 4px 20px rgba(2, 132, 199, 0.08);
      z-index: 50;
    }
    .header-left { display: flex; align-items: center; gap: 11px; min-width: 0; }
    
    /* Modern Cloud Logo Emblem */
    .cloud-logo-emblem {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%);
      border: 1px solid var(--cloud-border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      box-shadow: 0 2px 10px rgba(56, 189, 248, 0.25);
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }
    .cloud-logo-emblem:hover { transform: scale(1.05); }
    .cloud-svg { width: 100%; height: 100%; display: block; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
    
    .header-brand { display: flex; flex-direction: column; min-width: 0; }
    .header-title {
      font-weight: 800;
      font-size: 14.5px;
      color: var(--cloud-text);
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-title .cloud-word {
      color: var(--cloud-cyan);
      text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
    }
    .header-title .pro-tag {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 800;
      padding: 1.5px 5.5px;
      border-radius: 5px;
      letter-spacing: 0.05em;
    }
    .header-meta {
      font-size: 10.5px;
      color: var(--cloud-text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .status-dot {
      width: 7.5px;
      height: 7.5px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      flex-shrink: 0;
      animation: cloud-pulse 2s infinite ease-in-out;
    }
    @keyframes cloud-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.65; transform: scale(1.2); }
    }
    
    .header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .btn-header {
      background: var(--cloud-card);
      color: var(--cloud-text);
      border: 1px solid var(--cloud-border);
      padding: 6px 11px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .btn-header:hover {
      background: var(--cloud-primary);
      color: #ffffff;
      border-color: var(--cloud-cyan);
      box-shadow: 0 2px 10px rgba(2, 132, 199, 0.3);
    }
    
    /* Quick Action Buttons (Modern Cloud Pills) */
    .quick-bar {
      background: var(--cloud-quickbar);
      border-bottom: 1px solid var(--cloud-border);
      padding: 8px 12px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      white-space: nowrap;
      flex-shrink: 0;
      scrollbar-width: none;
    }
    .quick-bar::-webkit-scrollbar { display: none; }
    .quick-btn {
      background: var(--cloud-key-bg);
      border: 1px solid var(--cloud-border);
      color: var(--cloud-key-text);
      padding: 5.5px 13px;
      border-radius: 999px;
      font-size: 11.5px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      flex-shrink: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    .quick-btn:hover {
      background: var(--cloud-primary);
      border-color: var(--cloud-cyan);
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 3px 12px rgba(2, 132, 199, 0.35);
    }
    .quick-btn.highlight {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border-color: #38bdf8;
      color: #ffffff;
      font-weight: 700;
    }
    .quick-btn.success {
      background: linear-gradient(135deg, #10b981, #059669);
      border-color: #6ee7b7;
      color: #ffffff;
      font-weight: 700;
    }
    
    /* Terminal Output Screen (Atmospheric Cloud Canvas) */
    .terminal-screen {
      flex: 1 1 0px;
      min-height: 0;
      height: 0;
      max-height: 100%;
      padding: 16px;
      overflow-y: auto;
      overflow-x: auto;
      background: var(--cloud-screen);
      display: flex;
      flex-direction: column;
      gap: 8px;
      scroll-behavior: smooth;
    }
    .terminal-screen::-webkit-scrollbar { width: 6px; height: 6px; }
    .terminal-screen::-webkit-scrollbar-thumb { background: var(--cloud-border); border-radius: 3px; }
    
    /* Modern Cloud Banner */
    .banner {
      color: var(--cloud-text-muted);
      border: 1px solid var(--cloud-border);
      border-radius: 14px;
      padding: 15px 18px;
      background: var(--cloud-card);
      backdrop-filter: blur(8px);
      margin-bottom: 12px;
      font-size: 12px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
    }
    .banner::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #0284c7, #38bdf8, #0ea5e9);
    }
    .banner-title {
      color: var(--cloud-cyan);
      font-weight: 800;
      font-size: 13.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .banner-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 18px;
      color: var(--cloud-text-muted);
      font-size: 11px;
    }
    .banner-grid strong { color: var(--cloud-text); font-weight: 600; }
    
    .history-block { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .cmd-line { display: flex; align-items: baseline; gap: 8px; font-weight: 600; flex-wrap: wrap; }
    .prompt-user { color: var(--cloud-prompt-user); }
    .prompt-sep { color: var(--cloud-text-muted); }
    .prompt-path { color: var(--cloud-prompt-path); }
    .prompt-sym { color: #f59e0b; }
    .cmd-text { color: var(--cloud-text); font-weight: 700; word-break: break-all; }
    
    .output-text {
      color: var(--cloud-text);
      white-space: pre-wrap;
      word-break: break-all;
      padding-left: 12px;
      border-left: 2px solid var(--cloud-border);
      margin-top: 4px;
      font-size: 12.5px;
      opacity: 0.95;
    }
    .output-text.error { border-left-color: #ef4444; color: #f87171; }
    .output-text.success { border-left-color: #10b981; }
    
    /* Pinned Bottom Dock (Cloud Glassmorphic Control Bar) */
    .terminal-dock {
      position: relative;
      flex-shrink: 0;
      z-index: 100;
      background: var(--cloud-dock);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 2px solid var(--cloud-primary);
      box-shadow: 0 -8px 24px rgba(2, 132, 199, 0.12);
      display: flex;
      flex-direction: column;
      padding-bottom: max(6px, env(safe-area-inset-bottom));
    }
    
    /* Interactive Input Row */
    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      padding: 8px 12px;
      flex-shrink: 0;
    }
    .input-prompt {
      font-weight: 700;
      color: var(--cloud-prompt-user);
      white-space: nowrap;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .input-prompt span { color: var(--cloud-prompt-path); }
    .cmd-input {
      flex: 1;
      background: var(--cloud-input-bg);
      border: 1.5px solid var(--cloud-border);
      border-radius: 9px;
      padding: 9px 12px;
      outline: none;
      color: var(--cloud-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      width: 100%;
      min-width: 0;
      transition: all 0.15s ease;
    }
    .cmd-input:focus {
      border-color: var(--cloud-cyan);
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
    }
    .btn-send {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #fff;
      border: none;
      border-radius: 9px;
      padding: 9px 18px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.15s ease;
      flex-shrink: 0;
      box-shadow: 0 3px 12px rgba(2, 132, 199, 0.35);
    }
    .btn-send:hover {
      background: linear-gradient(135deg, #0369a1, #075985);
      transform: translateY(-1px);
    }
    
    /* Virtual Mobile Keyboard Row */
    .mobile-keys {
      background: var(--cloud-quickbar);
      border-bottom: 1px solid var(--cloud-border);
      padding: 6px 8px;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      flex-shrink: 0;
    }
    .mobile-keys::-webkit-scrollbar { display: none; }
    .m-key {
      background: var(--cloud-key-bg);
      color: var(--cloud-key-text);
      border: 1px solid var(--cloud-border);
      border-radius: 6px;
      padding: 6px 11px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
      transition: all 0.1s ease;
    }
    .m-key:active { background: var(--cloud-primary); color: #ffffff; }

    @media (max-width: 768px) {
      .terminal-header { padding: 8px 12px; }
      .header-title { font-size: 13px; }
      .input-prompt { font-size: 11px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
      .cmd-input { font-size: 14px; padding: 8px 10px; }
      .btn-send { padding: 8px 13px; font-size: 11.5px; }
      .m-key { padding: 5px 9px; font-size: 11px; }
    }
    
    /* Security PIN Modal (Cloud Dialog) */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 12, 24, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 200;
    }
    .modal-card {
      background: var(--cloud-header);
      border: 1px solid var(--cloud-border-strong);
      border-radius: 20px;
      max-width: 410px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2);
      text-align: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
    }
    .modal-icon-cloud {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(56, 189, 248, 0.15) 100%);
      border: 1px solid var(--cloud-border-strong);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      padding: 10px;
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);
    }
    .modal-title { font-size: 19px; font-weight: 800; color: var(--cloud-text); margin-bottom: 6px; }
    .modal-desc { font-size: 12.5px; color: var(--cloud-text-muted); margin-bottom: 20px; line-height: 1.5; }
    .pin-input {
      width: 100%;
      background: var(--cloud-input-bg);
      border: 1.5px solid var(--cloud-border);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--cloud-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      letter-spacing: 2px;
      text-align: center;
      outline: none;
      margin-bottom: 16px;
    }
    .pin-input:focus { border-color: var(--cloud-cyan); box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25); }
    .btn-unlock {
      width: 100%;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
    }
    .btn-unlock:hover { opacity: 0.95; transform: translateY(-1px); }
    .default-hint { font-size: 11.5px; color: var(--cloud-text-muted); margin-top: 14px; }
    .default-hint strong { color: var(--cloud-cyan); cursor: pointer; text-decoration: underline; }
    
    /* ANSI colors */
    .ansi-green { color: #34d399; }
    .ansi-red { color: #f87171; }
    .ansi-yellow { color: #fbbf24; }
    .ansi-blue { color: #60a5fa; }
    .ansi-cyan { color: #38bdf8; }
    .ansi-magenta { color: #c084fc; }
    .ansi-bold { font-weight: bold; }
    
    .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--cloud-cyan); border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; margin-left: 6px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Header with Modern Cloud Logo -->
    <header class="terminal-header">
      <div class="header-left">
        <div class="cloud-logo-emblem" title="Karsa Cloud PRO Logo">
          <svg viewBox="0 0 100 100" fill="none" class="cloud-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cloudGradHead" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="40%" stop-color="#0284c7" />
                <stop offset="85%" stop-color="#0369a1" />
                <stop offset="100%" stop-color="#1e3a8a" />
              </linearGradient>
              <linearGradient id="cloudCrestHead" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                <stop offset="60%" stop-color="#bae6fd" stop-opacity="0.4" />
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="goldSparkHead" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fef08a" />
                <stop offset="50%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#d97706" />
              </linearGradient>
            </defs>
            <path d="M 28 78 C 16 78 8 70 8 59 C 8 49 16 41 26 39 C 29 25 41 16 55 16 C 68 16 78 23 82 34 C 91 36 98 44 98 55 C 98 67 89 77 78 78 Z" fill="url(#cloudGradHead)" />
            <path d="M 32 37 C 35 27 44 20 55 20 C 65 20 73 25 77 33" stroke="url(#cloudCrestHead)" stroke-width="3.2" stroke-linecap="round" />
            <ellipse cx="44" cy="46" rx="14" ry="9" fill="#ffffff" fill-opacity="0.18" transform="rotate(-15 44 46)" />
            <path d="M 22 66 H 58" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.95" />
            <path d="M 64 66 H 76" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.95" />
            <path d="M 28 58 H 48" stroke="#bae6fd" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.8" />
            <path d="M 54 58 H 68" stroke="#bae6fd" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.8" />
            <g transform="translate(73, 20) scale(0.9)">
              <path d="M 12 0 L 14.5 8.5 L 23 11 L 14.5 13.5 L 12 22 L 9.5 13.5 L 1 11 L 9.5 8.5 Z" fill="url(#goldSparkHead)" />
              <circle cx="12" cy="11" r="1.8" fill="#ffffff" />
            </g>
          </svg>
        </div>
        <div class="header-brand">
          <div class="header-title">
            <span>Karsa</span>
            <span class="cloud-word">Cloud</span>
            <span class="pro-tag">PRO</span>
            <span style="font-size:12px; font-weight:700; color:var(--cloud-cyan); margin-left:4px;">Web SSH</span>
          </div>
          <div class="header-meta">
            <div class="status-dot"></div>
            <span>${username}@${hostname}</span>
            <span>•</span>
            <span style="color:var(--cloud-cyan);">Port 22 SSH Linux</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-header" onclick="toggleCloudTheme()" id="themeToggleBtn" title="Ganti Tema Awan">☁️ Tema</button>
        <button class="btn-header" onclick="clearTerminal()" title="Bersihkan Layar">🧹 Clear</button>
      </div>
    </header>

    <!-- Quick Action Pills for Mobile -->
    <div class="quick-bar">
      <button class="quick-btn highlight" onclick="runCommand('bash update.sh --check')">☁️ Cek Kommit Terbaru</button>
      <button class="quick-btn" onclick="runCommand('git log -1 --stat')">📜 Log Kommit</button>
      <button class="quick-btn success" onclick="runCommand('bash update.sh')">🚀 1-Click Update</button>
      <button class="quick-btn" onclick="runCommand('pm2 restart karsacloud 2>/dev/null || pm2 restart cloudpro 2>/dev/null || pm2 restart all')">🔄 PM2 Restart</button>
      <button class="quick-btn" onclick="runCommand('pm2 status')">📊 PM2 Status</button>
      <button class="quick-btn" onclick="runCommand('pm2 logs --lines 25')">📜 PM2 Logs</button>
      <button class="quick-btn" style="background:#7c3aed; color:#fff; font-weight:700;" onclick="runCommand('bash fix-caddy-ssl.sh')">🔒 Fix SSL Subdomain (Caddy)</button>
      <button class="quick-btn" onclick="runCommand('systemctl status caddy --no-pager')">🌐 Caddy Status</button>
      <button class="quick-btn" onclick="runCommand('systemctl reload caddy')">🔄 Caddy Reload</button>
      <button class="quick-btn" onclick="runCommand('ss -tulpn | grep LISTEN')">🔌 Port Aktif</button>
      <button class="quick-btn" onclick="runCommand('git status -s')">📁 Git Status</button>
      <button class="quick-btn" onclick="runCommand('git pull origin main')">⬇️ Git Pull</button>
      <button class="quick-btn" onclick="runCommand('free -h && echo --- && df -h /')">💾 RAM, Swap & Disk</button>
      <button class="quick-btn" onclick="runCommand('lsof -i :3000 || netstat -tlpn | grep 3000')">🔌 Cek Port 3000</button>
      <button class="quick-btn" onclick="runCommand('pwd')">📂 Cek Direktori CWD</button>
    </div>

    <!-- Terminal Screen -->
    <div class="terminal-screen" id="terminalScreen">
      <div class="banner">
        <div class="banner-title">
          <span>☁️ Karsa Cloud PRO — Direct Web Shell Terminal (Cloud Engine)</span>
        </div>
        <div class="banner-grid">
          <div>Platform:</div><strong>${platform}</strong>
          <div>User & Host:</div><strong>${username}@${hostname}</strong>
          <div>Root CWD:</div><strong id="bannerCwd">${initialCwd}</strong>
          <div>Koneksi:</div><strong style="color:#10b981;">Terhubung Aktif ke Shell Linux Bash</strong>
        </div>
        <div style="margin-top:8px; font-size:11px; color:var(--cloud-text-muted);">
          Ketik perintah bash langsung seperti di console SSH / PuTTY / Termux. Pintasan cepat tersedia di bilah atas layar.
        </div>
      </div>
      <div id="outputHistory"></div>
    </div>

    <!-- Sticky Dock for Mobile / Android Keyboard Visibility -->
    <div class="terminal-dock" id="terminalDock">
      <!-- Virtual Mobile Keys -->
      <div class="mobile-keys">
        <button class="m-key" onclick="insertChar('\t')">Tab</button>
        <button class="m-key" onclick="handleCtrlC()">Ctrl+C</button>
        <button class="m-key" onclick="navHistory(-1)">▲ History</button>
        <button class="m-key" onclick="navHistory(1)">▼ History</button>
        <button class="m-key" onclick="insertChar('/')">/</button>
        <button class="m-key" onclick="insertChar('-')">-</button>
        <button class="m-key" onclick="insertChar('~')">~</button>
        <button class="m-key" onclick="insertChar('|')">|</button>
        <button class="m-key" onclick="insertChar(' && ')">&&</button>
        <button class="m-key" onclick="insertChar('sudo ')">sudo</button>
      </div>

      <!-- Input Row -->
      <div class="input-row">
        <div class="input-prompt" id="activePrompt">${username}@${hostname}:<span>~</span>$</div>
        <input
          type="text"
          id="cmdInput"
          class="cmd-input"
          placeholder="Ketik perintah linux (contoh: update, git pull)..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <button class="btn-send" id="btnSend" onclick="submitCommand()">Kirim ↵</button>
      </div>
    </div>
  </div>

  <!-- Security PIN Modal with Modern Cloud Emblem -->
  <div class="modal-overlay" id="pinModal" style="display:none;">
    <div class="modal-card">
      <div class="modal-icon-cloud">
        <svg viewBox="0 0 100 100" fill="none" class="cloud-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudModalGrad" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="40%" stop-color="#0284c7" />
              <stop offset="85%" stop-color="#0369a1" />
              <stop offset="100%" stop-color="#1e3a8a" />
            </linearGradient>
            <linearGradient id="cloudModalCrest" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
              <stop offset="60%" stop-color="#bae6fd" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="goldSparkModal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="50%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#d97706" />
            </linearGradient>
          </defs>
          <path d="M 28 78 C 16 78 8 70 8 59 C 8 49 16 41 26 39 C 29 25 41 16 55 16 C 68 16 78 23 82 34 C 91 36 98 44 98 55 C 98 67 89 77 78 78 Z" fill="url(#cloudModalGrad)" />
          <path d="M 32 37 C 35 27 44 20 55 20 C 65 20 73 25 77 33" stroke="url(#cloudModalCrest)" stroke-width="3.2" stroke-linecap="round" />
          <ellipse cx="44" cy="46" rx="14" ry="9" fill="#ffffff" fill-opacity="0.18" transform="rotate(-15 44 46)" />
          <path d="M 22 66 H 58" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.95" />
          <path d="M 64 66 H 76" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.95" />
          <path d="M 28 58 H 48" stroke="#bae6fd" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.8" />
          <path d="M 54 58 H 68" stroke="#bae6fd" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.8" />
          <g transform="translate(73, 20) scale(0.9)">
            <path d="M 12 0 L 14.5 8.5 L 23 11 L 14.5 13.5 L 12 22 L 9.5 13.5 L 1 11 L 9.5 8.5 Z" fill="url(#goldSparkModal)" />
            <circle cx="12" cy="11" r="1.8" fill="#ffffff" />
          </g>
        </svg>
      </div>
      <div class="modal-title">Karsa Cloud PRO Web SSH</div>
      <div class="modal-desc">
        Akses shell server cloud aman terenkripsi. Masukkan PIN keamanan untuk membuka terminal.
      </div>
      <input
        type="password"
        id="pinInput"
        class="pin-input"
        placeholder="Masukkan PIN"
        maxlength="32"
        autofocus
      />
      <button class="btn-unlock" onclick="unlockTerminal()">Buka Terminal</button>
      <div class="default-hint">
        PIN Bawaan: <strong onclick="useDefaultPin()">karsacloud</strong> (Klik untuk isi)
      </div>
    </div>
  </div>

  <script>
    let currentCwd = '${initialCwd}';
    let history = [];
    let historyIndex = -1;
    let isRunning = false;
    let terminalPin = localStorage.getItem('karsacloud_terminal_pin') || localStorage.getItem('cloudpro_terminal_pin') || 'karsacloud';

    const cmdInput = document.getElementById('cmdInput');
    const outputHistory = document.getElementById('outputHistory');
    const terminalScreen = document.getElementById('terminalScreen');
    const activePrompt = document.getElementById('activePrompt');
    const pinModal = document.getElementById('pinModal');
    const pinInput = document.getElementById('pinInput');

    function toggleCloudTheme() {
      const isLight = document.body.classList.toggle('theme-light-cloud');
      localStorage.setItem('karsacloud_terminal_theme', isLight ? 'light' : 'dark');
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerHTML = isLight ? '☁️ Awan Malam' : '☁️ Awan Terang';
    }

    // Init theme
    if (localStorage.getItem('karsacloud_terminal_theme') === 'light') {
      document.body.classList.add('theme-light-cloud');
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerHTML = '☁️ Awan Malam';
    }

    function safeFocus(el) {
      if (!el) return;
      try { el.focus(); } catch {}
    }

    function updatePrompt(cwd) {
      currentCwd = cwd;
      const shortCwd = cwd.length > 28 ? '...' + cwd.slice(-25) : cwd;
      activePrompt.innerHTML = '${username}@${hostname}:<span>' + shortCwd + '</span>$';
    }

    function checkAuth() {
      if (pinModal) pinModal.style.display = 'none';
      safeFocus(cmdInput);
    }

    function useDefaultPin() {
      pinInput.value = 'karsacloud';
    }

    function unlockTerminal() {
      const pin = pinInput.value.trim();
      if (!pin) return;
      terminalPin = pin;
      localStorage.setItem('karsacloud_terminal_pin', pin);
      pinModal.style.display = 'none';
      safeFocus(cmdInput);
      runCommand('pwd');
    }

    function lockTerminal() {
      localStorage.removeItem('karsacloud_terminal_pin');
      localStorage.removeItem('cloudpro_terminal_pin');
      terminalPin = '';
      pinInput.value = '';
      pinModal.style.display = 'flex';
      safeFocus(pinInput);
    }

    function insertChar(ch) {
      if (!cmdInput) return;
      cmdInput.value += ch;
      safeFocus(cmdInput);
    }

    function handleCtrlC() {
      if (!cmdInput) return;
      appendHistoryBlock(cmdInput.value || '^C', '^C (Perintah diinterupsi)', false);
      cmdInput.value = '';
      isRunning = false;
    }

    function clearTerminal() {
      if (outputHistory) outputHistory.innerHTML = '';
      safeFocus(cmdInput);
    }

    function navHistory(dir) {
      if (history.length === 0) return;
      historyIndex += dir;
      if (historyIndex < 0) historyIndex = 0;
      if (historyIndex >= history.length) {
        historyIndex = history.length;
        cmdInput.value = '';
        return;
      }
      cmdInput.value = history[historyIndex];
    }

    function ansiToHtml(text) {
      if (!text) return '';
      let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Strip ANSI cursor positioning and clear codes
      escaped = escaped.replace(/\\x1b\\[[0-9;]*[HJKsu]/g, '');

      // Convert common ANSI color codes
      escaped = escaped
        .replace(/\\x1b\\[0m/g, '</span>')
        .replace(/\\x1b\\[1m/g, '<span class="ansi-bold">')
        .replace(/\\x1b\\[31m/g, '<span class="ansi-red">')
        .replace(/\\x1b\\[32m/g, '<span class="ansi-green">')
        .replace(/\\x1b\\[33m/g, '<span class="ansi-yellow">')
        .replace(/\\x1b\\[34m/g, '<span class="ansi-blue">')
        .replace(/\\x1b\\[35m/g, '<span class="ansi-magenta">')
        .replace(/\\x1b\\[36m/g, '<span class="ansi-cyan">')
        .replace(/\\x1b\\[90m/g, '<span style="color:#64748b;">')
        .replace(/\\x1b\\[92m/g, '<span class="ansi-green">')
        .replace(/\\x1b\\[93m/g, '<span class="ansi-yellow">')
        .replace(/\\x1b\\[96m/g, '<span class="ansi-cyan">')
        .replace(/\\x1b\\[[0-9;]*m/g, ''); // strip any remaining

      return escaped;
    }

    function appendHistoryBlock(cmd, output, isError, exitCode) {
      const block = document.createElement('div');
      block.className = 'history-block';

      const cmdLine = document.createElement('div');
      cmdLine.className = 'cmd-line';
      cmdLine.innerHTML =
        '<span class="prompt-user">${username}@${hostname}</span>' +
        '<span class="prompt-sep">:</span>' +
        '<span class="prompt-path">' + currentCwd + '</span>' +
        '<span class="prompt-sym">$</span>' +
        '<span class="cmd-text">' + cmd + '</span>' +
        (exitCode !== undefined
          ? (exitCode === 0
              ? ' <span style="color:#10b981;font-size:11px;">✓</span>'
              : ' <span style="color:#ef4444;font-size:11px;">✗ (' + exitCode + ')</span>')
          : '');

      block.appendChild(cmdLine);

      if (output && output.trim()) {
        const outDiv = document.createElement('div');
        outDiv.className = 'output-text' + (isError ? ' error' : '');
        outDiv.innerHTML = ansiToHtml(output);
        block.appendChild(outDiv);
      }

      outputHistory.appendChild(block);
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    }

    async function executeApi(cmd) {
      if (isRunning) return;
      isRunning = true;
      document.getElementById('btnSend').disabled = true;

      // Temporary running indicator
      const tempBlock = document.createElement('div');
      tempBlock.className = 'history-block';
      tempBlock.id = 'activeRunningBlock';
      tempBlock.innerHTML =
        '<div class="cmd-line"><span class="prompt-user">${username}@${hostname}</span><span class="prompt-sep">:</span><span class="prompt-path">' +
        currentCwd +
        '</span><span class="prompt-sym">$</span><span class="cmd-text">' +
        cmd +
        '</span> <div class="spinner"></div></div>';
      outputHistory.appendChild(tempBlock);
      terminalScreen.scrollTop = terminalScreen.scrollHeight;

      try {
        const res = await fetch('/api/terminal/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-terminal-pin': terminalPin,
          },
          body: JSON.stringify({ command: cmd, cwd: currentCwd }),
        });

        const rawText = await res.text();
        tempBlock.remove();

        if (res.status === 401) {
          appendHistoryBlock(cmd, '❌ [AKSES DITOLAK] PIN Terminal Salah! Silakan masukkan PIN yang benar.', false);
          lockTerminal();
          return;
        }

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (jsonErr) {
          const isCheckCmd = cmd.includes('--check') || cmd.includes('-c') || cmd.includes('versi') || cmd.includes('status');
          // If server reloaded during update/restart and connection returned HTML
          if (!isCheckCmd && (cmd.includes('update') || cmd.includes('restart') || cmd.includes('pm2') || rawText.includes('<!DOCTYPE') || rawText.includes('<html'))) {
            appendHistoryBlock(
              cmd,
              '⚡ [INFO] Perintah update / restart sedang dieksekusi di background server...\\n' +
              'Service PM2 sedang me-reload process Karsa Cloud PRO.\\n' +
              'Menghubungi ulang server dalam 3 detik...',
              false,
              0
            );
            setTimeout(async () => {
              try {
                const check = await fetch('/');
                if (check.ok || check.status < 500) {
                  appendHistoryBlock('status', '✅ [SUKSES] Server Karsa Cloud PRO telah aktif kembali dan siap melayani!', false, 0);
                }
              } catch (e) {}
            }, 3500);
            return;
          }
          throw new Error(rawText.slice(0, 160) || 'Format respon tidak valid');
        }

        if (data.clear) {
          outputHistory.innerHTML = '';
        } else {
          const finalOutput = (data.stdout || '') + (data.stderr ? '\\n[STDERR] ' + data.stderr : '');
          appendHistoryBlock(cmd, finalOutput, !data.ok, data.exitCode);
        }

        if (data.cwd) {
          updatePrompt(data.cwd);
        }
      } catch (err) {
        tempBlock.remove();
        const isCheckCmd = cmd.includes('--check') || cmd.includes('-c') || cmd.includes('versi') || cmd.includes('status');
        if (!isCheckCmd && (cmd.includes('update') || cmd.includes('restart'))) {
          appendHistoryBlock(
            cmd,
            '⚡ [INFO] Server Karsa Cloud PRO sedang me-restart service di background.\\n' +
            'Silakan refresh browser beberapa detik lagi untuk melihat versi terbaru.',
            false,
            0
          );
        } else {
          appendHistoryBlock(cmd, 'Koneksi gagal atau server terputus: ' + err.message, true, 1);
        }
      } finally {
        isRunning = false;
        document.getElementById('btnSend').disabled = false;
        safeFocus(cmdInput);
      }
    }

    function runCommand(cmd) {
      if (!cmd || isRunning) return;
      cmdInput.value = '';
      history.push(cmd);
      historyIndex = history.length;
      executeApi(cmd);
    }

    function submitCommand() {
      const cmd = cmdInput.value.trim();
      if (!cmd) return;
      runCommand(cmd);
    }

    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitCommand();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navHistory(1);
      } else if (e.key === 'c' && e.ctrlKey) {
        handleCtrlC();
      }
    });

    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') unlockTerminal();
    });

    // Auto-adjust layout for Android Virtual Keyboard & Viewport Resizing
    function handleVisualViewport() {
      if (window.visualViewport) {
        const vh = window.visualViewport.height;
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
          appContainer.style.height = vh + 'px';
        }
        window.scrollTo(0, 0);
        if (terminalScreen) {
          terminalScreen.scrollTop = terminalScreen.scrollHeight;
        }
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
      window.visualViewport.addEventListener('scroll', handleVisualViewport);
    }
    window.addEventListener('resize', handleVisualViewport);

    cmdInput.addEventListener('focus', () => {
      setTimeout(() => {
        handleVisualViewport();
        cmdInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    });

    // Tapping on terminal output focuses command input on touch devices
    terminalScreen.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && !window.getSelection().toString()) {
        cmdInput.focus();
      }
    });

    // Auto init
    updatePrompt(currentCwd);
    checkAuth();
  </script>
</body>
</html>`;
}
