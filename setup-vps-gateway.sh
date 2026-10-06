#!/usr/bin/env bash
# =========================================================================
# Karsa Cloud PRO - Enterprise Universal Caddy Gateway Configuration
# Domain Utama Server: karsacloud.biz.id
# Domain Klien: denbaguse.my.id & Subdomain (siakad-madrasah, rdm, dll)
# =========================================================================

echo "=========================================================="
echo " 🔒 [Karsa Cloud PRO] Konfigurasi Caddy Gateway & Auto-SSL"
echo "=========================================================="

cat << 'EOF' > /etc/caddy/Caddyfile
{
    email mimaarifnu2sanggreman@gmail.com
    on_demand_tls {
        ask http://127.0.0.1:3000/api/vhost/check-domain
    }
}

# 1. Domain Utama Server Lokal Karsa Cloud & Subdomain Panel
karsacloud.biz.id, www.karsacloud.biz.id, cloudpro.karsacloud.biz.id, servercloud.karsacloud.biz.id {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto https
    }
}

# 2. Domain Klien denbaguse.my.id & Seluruh Subdomain Madrasah (HTTP-01 SSL Otomatis)
denbaguse.my.id, www.denbaguse.my.id, siakad-madrasah.denbaguse.my.id, rdm.denbaguse.my.id, adm-madrasah.denbaguse.my.id, cbt.denbaguse.my.id, elearning.denbaguse.my.id, ppdb.denbaguse.my.id {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto https
    }
}

# 3. Universal On-Demand TLS untuk SEMUA Domain & Subdomain Klien Lainnya
:443 {
    tls {
        on_demand
    }
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto https
    }
}

# 4. Port 80 HTTP (Redirect ke HTTPS & Tangani ACME Challenge)
:80 {
    @not_acme {
        not path /.well-known/acme-challenge/*
    }
    reverse_proxy @not_acme 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto http
    }
}
EOF

caddy validate --config /etc/caddy/Caddyfile
systemctl restart caddy
systemctl status caddy --no-pager
