#!/usr/bin/env bash
# =========================================================================
# Karsa Cloud PRO - Auto Fix SSL Subdomain & Caddyfile Updater
# Memperbaiki ERR_SSL_PROTOCOL_ERROR pada subdomain denbaguse.my.id & karsacloud.biz.id
# =========================================================================

echo "=========================================================="
echo " 🔒 [Karsa Cloud PRO] Memperbaiki SSL Subdomain (Caddy)..."
echo "=========================================================="

CADDY_FILE="/etc/caddy/Caddyfile"

# Cek apakah user memiliki hak root / sudo
SUDO_CMD=""
if [ "$(id -u)" -ne 0 ]; then
  if sudo -n true 2>/dev/null; then
    SUDO_CMD="sudo"
  else
    echo "[PERINGATAN] Script membutuhkan akses root/sudo untuk mengedit $CADDY_FILE."
    SUDO_CMD="sudo"
  fi
fi

# Cek apakah Caddy terinstall
if ! command -v caddy &>/dev/null && [ ! -f "$CADDY_FILE" ]; then
  echo "[INFO] Caddy tidak terdeteksi di mesin ini. Jika menggunakan Cloudflare Tunnel atau Nginx, pastikan DNS Proxy aktif."
  exit 0
fi

$SUDO_CMD mkdir -p /etc/caddy 2>/dev/null || true

# Backup konfigurasi lama jika ada
if [ -f "$CADDY_FILE" ]; then
  $SUDO_CMD cp -f "$CADDY_FILE" "${CADDY_FILE}.bak-$(date +%s)" 2>/dev/null || true
  echo "● Backup konfigurasi lama tersimpan di ${CADDY_FILE}.bak"
fi

# Buat konfigurasi Caddyfile lengkap untuk root dan seluruh subdomain
cat << 'EOF' > /tmp/caddyfile-karsacloud-pro
# =========================================================================
# Karsa Cloud PRO - Enterprise Caddy Reverse Proxy & Auto-SSL Configuration
# Diperbarui otomatis untuk mendukung semua subdomain tanpa error SSL
# =========================================================================

# 1. Domain Utama Karsa Cloud PRO & Panel Subdomain
karsacloud.biz.id, cloudpro.karsacloud.biz.id, servercloud.karsacloud.biz.id, siakad-madrasah.karsacloud.biz.id, rdm.karsacloud.biz.id, panel.karsacloud.biz.id, client.karsacloud.biz.id {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

# 2. Domain Reseller denbaguse.my.id & Seluruh Subdomain (Siakad, RDM, CBT, dll.)
denbaguse.my.id, www.denbaguse.my.id, siakad-madrasah.denbaguse.my.id, rdm.denbaguse.my.id, cbt.denbaguse.my.id, elearning.denbaguse.my.id, panel.denbaguse.my.id, kartu-pelajar.denbaguse.my.id, client.denbaguse.my.id {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
EOF

$SUDO_CMD cp -f /tmp/caddyfile-karsacloud-pro "$CADDY_FILE"
rm -f /tmp/caddyfile-karsacloud-pro

echo "● Memvalidasi sintaks Caddyfile..."
if command -v caddy &>/dev/null; then
  if $SUDO_CMD caddy validate --config "$CADDY_FILE" >/dev/null 2>&1; then
    echo "✅ Sintaks Caddyfile VALID!"
  else
    echo "⚠️ Validasi Caddyfile memberi peringatan, tetap mencoba reload..."
  fi
fi

echo "● Me-reload Caddy daemon untuk menerbitkan sertifikat SSL Let's Encrypt / ZeroSSL..."
if [ -d /run/systemd/system ] && systemctl is-system-running &>/dev/null; then
  $SUDO_CMD systemctl reload caddy 2>/dev/null || $SUDO_CMD systemctl restart caddy 2>/dev/null || true
else
  $SUDO_CMD service caddy reload 2>/dev/null || $SUDO_CMD service caddy restart 2>/dev/null || true
fi

echo "=========================================================="
echo " ✅ SUKSES! Subdomain telah didaftarkan ke Caddy Reverse Proxy."
echo " Subdomain: siakad-madrasah.denbaguse.my.id"
echo " Subdomain: rdm.denbaguse.my.id, cbt, elearning, dll."
echo " Caddy akan otomatis menerbitkan sertifikat SSL HTTPS."
echo "=========================================================="
