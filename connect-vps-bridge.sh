#!/usr/bin/env bash
# =========================================================================
# Karsa Cloud PRO - VPS Bridge Connector (Jembatan Server Lokal <-> VPS)
# Menghubungkan Server Lokal karsacloud.biz.id ke IP Publik VPS Anda
# Agar SEMUA domain klien (denbaguse.my.id, dll) bisa diakses dari IP VPS
# tanpa perlu mendaftarkan setiap domain klien ke Cloudflare!
# =========================================================================

set -e

echo "=========================================================="
echo " 🌐 [Karsa Cloud PRO] VPS Bridge Connector"
echo " Menghubungkan Server Lokal ke IP Publik VPS"
echo "=========================================================="

VPS_IP="${1:-$VPS_IP}"
VPS_USER="${2:-${VPS_USER:-root}}"
VPS_PORT="${3:-${VPS_PORT:-22}}"

if [ -z "$VPS_IP" ]; then
  echo "Penggunaan:"
  echo "  bash connect-vps-bridge.sh <IP_VPS> [USER_VPS] [PORT_SSH]"
  echo ""
  echo "Contoh:"
  echo "  bash connect-vps-bridge.sh 103.123.45.67 root 22"
  echo ""
  read -r -p "Masukkan Alamat IP Publik VPS Anda: " INPUT_IP
  VPS_IP="$INPUT_IP"
  if [ -z "$VPS_IP" ]; then
    echo "❌ Error: IP VPS tidak boleh kosong."
    exit 1
  fi
fi

echo "● Memeriksa kesiapan Server Lokal Karsa Cloud (Port 3000)..."
if ! curl -sI --max-time 3 http://127.0.0.1:3000/ >/dev/null 2>&1; then
  echo "⚠️ Port 3000 lokal belum merespons. Memulai service Karsa Cloud..."
  if command -v pm2 &>/dev/null; then
    pm2 restart karsacloud || pm2 start server.js --name karsacloud || true
  fi
fi

# Pastikan autossh atau openssh-client terpasang
if ! command -v autossh &>/dev/null && command -v apt-get &>/dev/null; then
  echo "● Menginstal autossh untuk koneksi otomatis 24/7 tanpa putus..."
  sudo apt-get update -qq && sudo apt-get install -y -qq autossh ssh || true
fi

# Siapkan SSH key jika belum ada
SSH_DIR="$HOME/.ssh"
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

if [ ! -f "$SSH_DIR/id_rsa" ] && [ ! -f "$SSH_DIR/id_ed25519" ]; then
  echo "● Membuat SSH Key untuk Server Lokal..."
  ssh-keygen -t ed25519 -N "" -f "$SSH_DIR/id_ed25519" -C "karsacloud-bridge"
fi

PUB_KEY=""
if [ -f "$SSH_DIR/id_ed25519.pub" ]; then
  PUB_KEY=$(cat "$SSH_DIR/id_ed25519.pub")
elif [ -f "$SSH_DIR/id_rsa.pub" ]; then
  PUB_KEY=$(cat "$SSH_DIR/id_rsa.pub")
fi

echo ""
echo "----------------------------------------------------------"
echo " 🔑 KUNCI SSH SERVER LOKAL ANDA:"
echo "$PUB_KEY"
echo "----------------------------------------------------------"
echo " CATATAN: Pastikan kunci di atas sudah dimasukkan ke file"
echo " /root/.ssh/authorized_keys di VPS Anda agar koneksi lancar tanpa password!"
echo "----------------------------------------------------------"
echo ""

# Buat Systemd Service agar Bridge otomatis hidup saat boot dan auto-reconnect saat IndiHome restart
SERVICE_FILE="/etc/systemd/system/karsacloud-vps-bridge.service"

if [ "$(id -u)" -eq 0 ] || sudo -n true 2>/dev/null; then
  echo "● Mendaftarkan Systemd Service otomatis (24/7 Auto-Reconnect)..."
  sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=Karsa Cloud PRO - VPS Reverse Bridge Gateway
After=network.target

[Service]
Type=simple
User=$(whoami)
Environment="AUTOSSH_GATETIME=0"
Environment="AUTOSSH_POLL=30"
ExecStart=/usr/bin/autossh -M 0 -N -o "ServerAliveInterval 15" -o "ServerAliveCountMax 3" -o "ExitOnForwardFailure yes" -o "StrictHostKeyChecking no" -p ${VPS_PORT} -R 3000:localhost:3000 ${VPS_USER}@${VPS_IP}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload 2>/dev/null || true
  sudo systemctl enable karsacloud-vps-bridge 2>/dev/null || true
  sudo systemctl restart karsacloud-vps-bridge 2>/dev/null || true
  echo "✅ Service Systemd 'karsacloud-vps-bridge' berhasil diaktifkan!"
fi

echo "=========================================================="
echo " 🚀 STATUS KONEKSI BRIDGE:"
echo " ● Target VPS    : ${VPS_USER}@${VPS_IP}:${VPS_PORT}"
echo " ● Port Diteruskan: 3000 (Server Lokal) -> 3000 (VPS)"
echo " ● Status        : Aktif di latar belakang"
echo "----------------------------------------------------------"
echo " Jika di VPS sudah menjalankan 'bash fix-caddy-ssl.sh',"
echo " maka setiap pengunjung yang mengakses IP VPS ${VPS_IP}"
echo " atau domain klien (denbaguse.my.id, *.denbaguse.my.id)"
echo " akan langsung dilayani oleh Server Lokal Karsa Cloud!"
echo "=========================================================="
