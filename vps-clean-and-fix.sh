#!/usr/bin/env bash
# =========================================================================
# Karsa Cloud PRO - VPS Deep Cleaner & Port Auto-Healer
# Membersihkan seluruh service bentrok, proses menggantung, & reset Caddy
# =========================================================================

echo "=========================================================="
echo " 🧹 [Karsa Cloud PRO] Membersihkan VPS & Memperbaiki Caddy"
echo "=========================================================="

# 1. Hentikan semua web server & tunnel yang mungkin bentrok
echo "● Menghentikan service web server lama..."
systemctl stop nginx apache2 httpd cloudflared 2>/dev/null || true
systemctl disable nginx apache2 httpd 2>/dev/null || true

# 2. Paksa matikan semua proses yang mengunci port 80, 443, dan 2019 (admin Caddy)
echo "● Membebaskan port 80, 443, dan 2019 dari proses menggantung..."
if command -v fuser &>/dev/null; then
  fuser -k 80/tcp 443/tcp 2019/tcp 2>/dev/null || true
fi
killall -9 nginx apache2 httpd 2>/dev/null || true
pkill -9 -f "caddy run" 2>/dev/null || true

# 3. Bersihkan file lock Caddy yang mungkin korup
echo "● Membersihkan cache lock Caddy..."
rm -f /var/lib/caddy/.local/share/caddy/locks/* 2>/dev/null || true
rm -rf /tmp/caddy* /tmp/cloudpro* 2>/dev/null || true

# 4. Tulis Caddyfile Baru yang Bersih & Valid
echo "● Menulis ulang /etc/caddy/Caddyfile..."
mkdir -p /etc/caddy
cat << 'EOF' > /etc/caddy/Caddyfile
{
    on_demand_tls {
        ask http://127.0.0.1:3000/api/vhost/check-domain
        interval 1m
        burst 10
    }
}

:443 {
    tls {
        on_demand
    }
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}

:80 {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
EOF

# 5. Uji Caddyfile langsung menggunakan biner caddy
echo "● Memvalidasi Caddyfile..."
caddy validate --config /etc/caddy/Caddyfile

# 6. Jalankan kembali Caddy Service
echo "● Menyalakan kembali Caddy..."
systemctl daemon-reload
systemctl unmask caddy 2>/dev/null || true
systemctl enable caddy 2>/dev/null || true
systemctl restart caddy

echo "----------------------------------------------------------"
systemctl status caddy --no-pager
echo "----------------------------------------------------------"

if systemctl is-active --quiet caddy; then
  echo "✅ SUKSES BESAR! Caddy telah aktif normal (Running)."
  echo "Port 80 dan 443 sekarang siap melayani seluruh domain klien."
else
  echo "⚠️ Caddy masih membutuhkan diagnosa. Menampilkan log detail:"
  journalctl -u caddy -n 20 --no-pager
fi
