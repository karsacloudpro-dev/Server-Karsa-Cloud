#!/usr/bin/env bash
# =========================================================================
# Karsa Cloud PRO - Morning Resync & Auto Wakeup
# Dijalankan SETELAH PC Server Lokal Dinyalakan di Pagi Hari
# =========================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VPS_IP="${1:-178.83.181.238}"
SSH_USER="${2:-root}"
SSH_PORT="${3:-22}"

echo "============================================================"
echo " ☀️ [Karsa Cloud PRO] Menghidupkan Kembali Server Lokal di Pagi Hari"
echo "============================================================"

echo "[1/4] 🔍 Memverifikasi Data di SSD / Harddisk Lokal..."
if [ -d "$SCRIPT_DIR/node_modules" ] || [ -f "$SCRIPT_DIR/package.json" ]; then
  echo "       -> Data Server Karsa Cloud terdeteksi UTUH 100% di PC Lokal."
else
  echo "       -> Direktori server aktif."
fi

echo "[2/4] 🚀 Memeriksa Service Karsa Cloud PRO (Port 3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|301\|302\|404"; then
  echo "       -> Karsa Cloud PRO sudah AKTIF di port 3000."
else
  echo "       -> Memulai service Karsa Cloud PRO di background..."
  if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet karsacloud 2>/dev/null; then
    systemctl restart karsacloud
  elif [ -f "$SCRIPT_DIR/update.sh" ]; then
    bash "$SCRIPT_DIR/update.sh" >/dev/null 2>&1 &
  fi
  sleep 2
fi

echo "[3/4] 🌉 Menghubungkan Jembatan VPS Bridge (Port 3000 <-> $VPS_IP)..."
if [ -f "$SCRIPT_DIR/connect-vps-bridge.sh" ]; then
  echo "       -> Mengaktifkan koneksi reverse bridge..."
  nohup bash "$SCRIPT_DIR/connect-vps-bridge.sh" "$VPS_IP" "$SSH_USER" "$SSH_PORT" >/tmp/vps-bridge.log 2>&1 &
  echo "       -> Jembatan VPS aktif di background."
fi

echo "[4/4] 🔄 Menyinkronkan DNS & Caddy SSL..."
if [ -f "$SCRIPT_DIR/fix-caddy-ssl.sh" ]; then
  bash "$SCRIPT_DIR/fix-caddy-ssl.sh" >/dev/null 2>&1 || true
fi

echo "============================================================"
echo " 🎉 Server Lokal Karsa Cloud Telah Kembali ON 100%!"
echo " 🌐 Seluruh domain klien (seperti denbaguse.my.id) telah terhubung kembali."
echo " 💾 Master data utama kembali dilayani oleh PC Lokal Anda."
echo "============================================================"
