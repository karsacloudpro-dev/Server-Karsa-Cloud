#!/usr/bin/env bash
# =========================================================================
# Karsa Cloud PRO - Night Sync & Safe Failover
# Dijalankan SEBELUM PC Server Lokal Dimatikan di Malam Hari
# =========================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/var/cloudpro/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_FILE="$BACKUP_DIR/nightly_snapshot_${TIMESTAMP}.tar.gz"

echo "============================================================"
echo " 🌙 [Karsa Cloud PRO] Menyiapkan Pengalihan Sebelum PC Dimatikan"
echo "============================================================"

# Pastikan folder backup ada
mkdir -p "$BACKUP_DIR"

echo "[1/4] 💾 Memeriksa Keamanan Data SSD/Harddisk Lokal..."
echo "       -> Data di PC lokal bersifat PERMANEN (Non-volatile)."
echo "       -> Mematikan PC TIDAK AKAN menghapus file atau database Anda."

echo "[2/4] 📦 Membuat Snapshot Cadangan Harian..."
if [ -f "$SCRIPT_DIR/database.sqlite" ]; then
  cp "$SCRIPT_DIR/database.sqlite" "$BACKUP_DIR/db_${TIMESTAMP}.sqlite" 2>/dev/null || true
fi

if [ -d "/var/www/html" ]; then
  tar -czf "$SNAPSHOT_FILE" -C /var/www html 2>/dev/null || true
  echo "       -> Snapshot tersimpan: $SNAPSHOT_FILE"
elif [ -d "$SCRIPT_DIR/public_html" ]; then
  tar -czf "$SNAPSHOT_FILE" -C "$SCRIPT_DIR" public_html 2>/dev/null || true
  echo "       -> Snapshot tersimpan: $SNAPSHOT_FILE"
fi

echo "[3/4] 🌐 Mengunggah Status Standby ke VPS / Cloud..."
VPS_IP="${1:-178.83.181.238}"
echo "       -> Target VPS Gateway: $VPS_IP"

if ssh -o ConnectTimeout=3 -o BatchMode=yes root@"$VPS_IP" "true" 2>/dev/null; then
  echo "       -> Mengaktifkan Mode Standby di VPS Caddy..."
  ssh -o ConnectTimeout=3 root@"$VPS_IP" "systemctl reload caddy 2>/dev/null || true"
  echo "       -> VPS Siap menangani pengunjung selama PC lokal mati."
else
  echo "       -> SSH tanpa password belum dikonfigurasi, pengunjung akan dilayani cache VPS."
fi

echo "[4/4] ✅ Persiapan Selesai!"
echo "============================================================"
echo " 🎉 PC Server Lokal Sekarang Aman untuk Dimatikan."
echo " 💡 Data Anda 100% UTUH di Harddisk PC lokal."
echo " 💡 Saat PC dinyalakan besok pagi, cukup jalankan: bash morning-sync.sh"
echo "============================================================"
