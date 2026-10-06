import React, { useState } from 'react';
import {
  Server,
  Shield,
  Zap,
  Globe,
  Database,
  Lock,
  Headphones,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Star,
  Users,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CloudProLogo } from '../common/CloudProLogo';

interface LandingPageProps {
  onGoToPanel: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToPanel }) => {
  const [activePlanTab, setActivePlanTab] = useState<'hosting' | 'reseller' | 'vps'>('hosting');
  const [domainQuery, setDomainQuery] = useState('');
  const [domainTld, setDomainTld] = useState('.biz.id');
  const [domainResult, setDomainResult] = useState<{ domain: string; available: boolean; price: string } | null>(null);
  const [isSearchingDomain, setIsSearchingDomain] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const officialWaNumber = '6281226738883';
  const officialWaLink = `https://wa.me/${officialWaNumber}?text=Halo%20Karsa%20Cloud%20PRO,%20saya%20tertarik%20dengan%20layanan%20cloud%20hosting%20dan%20server.`;

  const handleDomainCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;
    setIsSearchingDomain(true);
    setDomainResult(null);

    setTimeout(() => {
      const cleanName = domainQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      const full = `${cleanName}${domainTld}`;
      const isAvailable = cleanName.length > 2 && cleanName !== 'google' && cleanName !== 'server';
      let price = 'Rp 25.000 / tahun';
      if (domainTld === '.my.id') price = 'Rp 15.000 / tahun';
      if (domainTld === '.id') price = 'Rp 225.000 / tahun';
      if (domainTld === '.com') price = 'Rp 160.000 / tahun';
      if (domainTld === '.sch.id') price = 'Rp 65.000 / tahun';

      setDomainResult({
        domain: full,
        available: isAvailable,
        price,
      });
      setIsSearchingDomain(false);
    }, 400);
  };

  const getWaOrderLink = (planName: string, price: string) => {
    const text = encodeURIComponent(
      `Halo Karsa Cloud PRO, saya ingin memesan layanan: ${planName} (${price}). Mohon bantuan informasi pendaftaran dan setupnya.`
    );
    return `https://wa.me/${officialWaNumber}?text=${text}`;
  };

  const hostingPlans = [
    {
      name: 'Cloud Starter',
      tagline: 'Cocok untuk blog pribadi, portfolio, & UMKM rintisan',
      price: 'Rp 29.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 290.000 / tahun (Hemat 2 Bulan)',
      popular: false,
      specs: [
        '5 GB Superfast NVMe Gen4',
        'Unmetered Bandwidth',
        '1 Domain Utama Hosted',
        'Gratis SSL Let’s Encrypt Selamanya',
        '2 Database MariaDB / MySQL',
        '5 Akun Email Bisnis (@domain)',
        'PHP 8.1 / 8.2 / 8.3 Selector',
        'Otomatisasi Backup Mingguan',
        'Control Panel server.karsacloud.biz.id',
      ],
    },
    {
      name: 'Cloud Business PRO',
      tagline: 'Performa optimal untuk instansi, madrasah, & toko online',
      price: 'Rp 75.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 750.000 / tahun (Rekomendasi Utama)',
      popular: true,
      specs: [
        '25 GB Superfast NVMe Gen4',
        'Unmetered Bandwidth',
        'Hingga 10 Domain / Website',
        'Gratis SSL Otomatis per Domain',
        '20 Database MariaDB High-Concurrency',
        '50 Akun Email Bisnis',
        'LiteSpeed / Nginx Cache Accelerator',
        'Pencadangan Data Harian Otomatis',
        'Proteksi DDoS Cloudflare Anycast',
        'Prioritas NOC Support via WhatsApp',
      ],
    },
    {
      name: 'Cloud Enterprise',
      tagline: 'Kapasitas maksimal untuk aplikasi web & portal berita trafik tinggi',
      price: 'Rp 150.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 1.500.000 / tahun (Dedicated Allocation)',
      popular: false,
      specs: [
        '100 GB Dedicated NVMe Gen4 Storage',
        'Unmetered Bandwidth High-Speed Peering',
        'Unlimited Addon Domain & Subdomain',
        'Unlimited Database & Email Akun',
        'Alokasi 4 vCPU & 8 GB RAM Limit',
        'Auto SSL Wildcard & DNS Zone Editor',
        'Remote Snapshot Backup Harian',
        'Node Telemetry & SLA 99.99%',
        'VIP Direct WhatsApp Assistance',
      ],
    },
  ];

  const resellerPlans = [
    {
      name: 'Reseller Silver',
      tagline: 'Mulai bisnis hosting sendiri dengan modal terjangkau',
      price: 'Rp 199.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 1.990.000 / tahun',
      popular: false,
      specs: [
        '50 GB NVMe Storage Pool',
        '25 Akun Hosting Pelanggan',
        '100% White-Label Branding Anda',
        'Private Nameservers (ns1/ns2.domainanda.com)',
        'Panel Pengelolaan Reseller Mandiri',
        'Otomatisasi Penerbitan SSL Gratis',
        'Unmetered Bandwidth',
        'Keuntungan Penjualan 100% Milik Anda',
      ],
    },
    {
      name: 'Reseller Gold PRO',
      tagline: 'Pilihan terfavorit para developer, agency & penyedia jasa web',
      price: 'Rp 349.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 3.490.000 / tahun (Best Value)',
      popular: true,
      specs: [
        '150 GB NVMe Storage Pool',
        '60 Akun Hosting Pelanggan',
        '100% White-Label (Bebas Upstream Branding)',
        'Private Nameservers & Custom DNS Zone',
        'Modul Manajemen Invoice & Billing Terintegrasi',
        'Auto-Provisioning Akun Klien Seketika',
        'Koneksi Cloudflare Tunnel & CDN Terpasang',
        'Dukungan Teknis Prioritas untuk Reseller',
      ],
    },
    {
      name: 'Reseller Platinum',
      tagline: 'Kapasitas raksasa untuk korporasi agency & multi-sekolah',
      price: 'Rp 599.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 5.990.000 / tahun',
      popular: false,
      specs: [
        '300 GB NVMe Storage Pool',
        'Unlimited Akun Hosting Pelanggan',
        '100% White-Label Enterprise',
        'Alokasi Dedicated IP Address Khusus',
        'Fitur Web Terminal & Server Migrator Hub',
        'Akses Penuh API & Backup Vault Remote',
        'Konsultasi Arsitektur Server Khusus',
        'Dedicated VIP Account Manager',
      ],
    },
  ];

  const vpsPlans = [
    {
      name: 'Cloud VPS - Node 1C',
      tagline: 'Cocok untuk microservices, bot, proxy & web staging',
      price: 'Rp 99.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 990.000 / tahun',
      popular: false,
      specs: [
        '1 vCPU High-Clock Core',
        '1 GB DDR5 RAM',
        '25 GB NVMe SSD',
        '1 Dedicated IPv4 + IPv6 Subnet',
        'Full Root Access via Web Terminal / SSH',
        'Tier-3 DC Singapore / Jakarta Cyber 1',
        'Uptime 99.99% SLA Guarantee',
      ],
    },
    {
      name: 'Cloud VPS - Node 2C4G',
      tagline: 'Performa tinggi untuk database, REST API, & portal institusi',
      price: 'Rp 199.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 1.990.000 / tahun',
      popular: true,
      specs: [
        '2 vCPU High-Clock Core',
        '4 GB DDR5 RAM',
        '60 GB NVMe SSD',
        '1 Dedicated IPv4 + IPv6 Subnet',
        'Full Root Access via Web Terminal / SSH',
        'Reverse Proxy Caddy & Nginx Siap Pakai',
        'Bantuan Konfigurasi Awal Gratis',
      ],
    },
    {
      name: 'Cloud VPS - Node 4C8G',
      tagline: 'Tenaga komputasi masif untuk CBT, ERP, & aplikasi skala berat',
      price: 'Rp 399.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 3.990.000 / tahun',
      popular: false,
      specs: [
        '4 vCPU High-Clock Core',
        '8 GB DDR5 RAM',
        '120 GB NVMe SSD',
        '1 Dedicated IPv4 + IPv6 Subnet',
        'Full Root Access & Snapshot Manager',
        'High Bandwidth Direct Peering IIX & Global',
        'Monitoring Proaktif 24/7',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Bagaimana cara mengakses dashboard Web Panel Karsa Cloud?',
      a: 'Web Panel Karsa Cloud diakses secara resmi melalui subdomain server.karsacloud.biz.id. Anda cukup mengklik tombol "Akses Web Panel" di menu atas untuk masuk ke dashboard manajemen hosting, akun reseller, database, file manager, dan DNS.',
    },
    {
      q: 'Di mana lokasi data center server Karsa Cloud PRO?',
      a: 'Server kami ditempatkan di fasilitas Tier-3 berstandar internasional: Singapore (Equinix Edge Datacenter) untuk konektivitas global latency rendah, serta Gedung Cyber 1 Mampang Jakarta dengan peering langsung ke IIX (Indonesia Internet Exchange), OpenIXP, dan seluruh ISP nasional (Telkom, Indosat, XL, Biznet).',
    },
    {
      q: 'Apakah saya mendapatkan bantuan migrasi website dari hosting lama?',
      a: 'Ya, 100% GRATIS! Tim teknis Karsa Cloud PRO siap membantu memindahkan seluruh file, database SQL, akun email, dan konfigurasi DNS dari hosting lama Anda tanpa downtime.',
    },
    {
      q: 'Metode pembayaran apa saja yang didukung?',
      a: 'Kami menerima pembayaran otomatis via Transfer Bank BCA (8420-9918-22), Bank Mandiri/BRI (139-00-8829104-5), serta QRIS Instant (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay, LinkAja) atas nama Jaenal Maskun (Karsa Cloud PRO).',
    },
    {
      q: 'Apa kelebihan paket Reseller Hosting di Karsa Cloud PRO?',
      a: 'Paket Reseller kami 100% White-Label. Anda dapat menggunakan domain dan private nameserver (ns1/ns2.domainanda.com) milik Anda sendiri. Pelanggan Anda tidak akan melihat nama Karsa Cloud PRO, sehingga Anda leluasa menentukan harga jual dan menikmati keuntungan penuh.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-sky-950 border-b border-sky-800/40 text-xs py-2 px-4 text-center flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          Karsa Cloud PRO Portal Resmi
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-slate-200">
          Website Utama: <strong className="text-white">karsacloud.biz.id</strong> &bull; Web Panel Admin: <strong className="text-amber-300">server.karsacloud.biz.id</strong>
        </span>
        <button
          type="button"
          onClick={onGoToPanel}
          className="ml-2 inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[11px] transition-colors cursor-pointer"
        >
          Masuk ke Panel <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudProLogo className="h-10 w-auto" />
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                KARSA CLOUD <span className="text-amber-400 text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">PRO</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Enterprise Cloud & Reseller Infrastructure</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#beranda" className="hover:text-amber-400 transition-colors">Beranda</a>
            <a href="#layanan" className="hover:text-amber-400 transition-colors">Layanan</a>
            <a href="#paket" className="hover:text-amber-400 transition-colors">Paket &amp; Harga</a>
            <a href="#domain" className="hover:text-amber-400 transition-colors">Cek Domain</a>
            <a href="#infrastruktur" className="hover:text-amber-400 transition-colors">Infrastruktur</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
            <a href={officialWaLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToPanel}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 border border-sky-400/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Server className="w-4 h-4 text-amber-300" />
              <span>Akses Web Panel</span>
              <ExternalLink className="w-3.5 h-3.5 text-sky-200 hidden sm:inline" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-12 pb-24 overflow-hidden border-b border-slate-800/60">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-sky-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-6 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tier-3 Singapore &amp; Cyber 1 Jakarta Datacenter</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">100% NVMe Storage</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Infrastruktur Cloud Hosting &amp; Reseller{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
                Berkualitas Enterprise
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Solusi web hosting berkecepatan tinggi dengan 100% NVMe Gen4 Storage, Caddy reverse-proxy auto-SSL, mitigasi DDoS Anycast, dan Web Panel terpadu di <strong>server.karsacloud.biz.id</strong> untuk bisnis, developer, sekolah/madrasah, dan pengusaha reseller hosting.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onGoToPanel}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-xl shadow-sky-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Server className="w-5 h-5 text-amber-300" />
                <span>Masuk ke Web Panel Server</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={officialWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-700/30 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>Konsultasi WhatsApp</span>
              </a>

              <a
                href="#paket"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-slate-700/80 transition-colors"
              >
                <span>Lihat Paket &amp; Harga</span>
              </a>
            </div>

            {/* Live Infrastructure Status Capsule */}
            <div className="mt-12 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 backdrop-blur-sm">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Node Gateway: Online
              </span>
              <span className="text-slate-600">|</span>
              <span>Uptime SLA: <strong className="text-white">99.99%</strong></span>
              <span className="text-slate-600">|</span>
              <span>Dual Network: <strong className="text-sky-400">IPv4 + IPv6 Anycast</strong></span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">SSL: <strong className="text-amber-400">ZeroSSL &amp; Let’s Encrypt</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Lookup Section */}
      <section id="domain" className="py-16 bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Cari &amp; Daftarkan Domain Impian Anda</h2>
            <p className="mt-2 text-sm text-slate-400">
              Temukan nama domain terbaik untuk bisnis, madrasah, toko online, atau brand personal Anda.
            </p>
          </div>

          <form onSubmit={handleDomainCheck} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-xl shadow-black/40">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-500 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ketik nama domain (contoh: bisnisku)"
                  value={domainQuery}
                  onChange={(e) => setDomainQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-white text-sm sm:text-base focus:outline-none placeholder-slate-500 py-2.5"
                />
              </div>

              <select
                value={domainTld}
                onChange={(e) => setDomainTld(e.target.value)}
                className="bg-slate-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none cursor-pointer"
              >
                <option value=".biz.id">.biz.id (Rp 25k/th)</option>
                <option value=".my.id">.my.id (Rp 15k/th)</option>
                <option value=".com">.com (Rp 160k/th)</option>
                <option value=".id">.id (Rp 225k/th)</option>
                <option value=".sch.id">.sch.id (Rp 65k/th)</option>
              </select>

              <button
                type="submit"
                disabled={isSearchingDomain}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSearchingDomain ? (
                  <span>Memeriksa...</span>
                ) : (
                  <>
                    <span>Cek Domain</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {domainResult && (
            <div className="mt-6 max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${domainResult.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {domainResult.available ? <Check className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{domainResult.domain}</div>
                  <div className="text-xs text-slate-400">
                    {domainResult.available ? (
                      <span className="text-emerald-400 font-semibold">Tersedia untuk didaftarkan! • {domainResult.price}</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Domain sudah terdaftar. Silakan pilih ekstensi lain.</span>
                    )}
                  </div>
                </div>
              </div>

              {domainResult.available && (
                <a
                  href={`https://wa.me/${officialWaNumber}?text=${encodeURIComponent(`Halo Karsa Cloud PRO, saya ingin mendaftarkan domain ${domainResult.domain} seharga ${domainResult.price}. Mohon diproses.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
                >
                  Pesan Domain via WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Services / Layanan Section */}
      <section id="layanan" className="py-24 bg-slate-950 border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-sky-400 mb-2">Layanan Komprehensif</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Ekosistem Hosting &amp; Server Terpadu</h3>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Karsa Cloud PRO menghadirkan infrastruktur awan terlengkap mulai dari shared web hosting, white-label reseller, hingga cloud VPS mandiri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Cloud Web Hosting</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Hosting cPanel/Karsa Panel bertenaga NVMe dengan PHP version selector (8.1 - 8.3), phpMyAdmin, Auto-SSL, dan web server berakselerasi tinggi.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Auto-SSL Gratis seumur hidup</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click File &amp; Database Manager</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Modul Backup &amp; Restore Terpadu</li>
              </ul>
              <a href="#paket" onClick={() => setActivePlanTab('hosting')} className="text-xs font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
                Pilih Paket Hosting <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">White-Label Reseller Hosting</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Jadilah penyedia hosting mandiri dengan brand dan nameserver pribadi Anda. Bebas tentukan kuota paket dan harga tanpa menyebut Karsa Cloud PRO.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> 100% White-Label (Brand Anda Sendiri)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Private Nameservers (ns1/ns2)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Alokasi Multi-Tenant Instan</li>
              </ul>
              <a href="#paket" onClick={() => setActivePlanTab('reseller')} className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                Pilih Paket Reseller <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Server className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Cloud VPS &amp; Node Server</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Virtual server dengan dedicated resource, full root access, dedicated IPv4/IPv6, serta koneksi terenkripsi SSH dan Web Terminal dari browser.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Dedicated IP &amp; Reverse DNS</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Web Terminal Terintegrasi</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Caddy Reverse Proxy &amp; Zero Trust</li>
              </ul>
              <a href="#paket" onClick={() => setActivePlanTab('vps')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                Pilih Paket Cloud VPS <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Paket & Harga Section */}
      <section id="paket" className="py-24 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-2">Pilihan Paket Transparan</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Investasi Terbaik untuk Masa Depan Digital Anda</h3>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Tanpa biaya tersembunyi. Semua paket sudah termasuk sertifikat SSL gratis, proteksi DDoS, dan akses Web Panel di server.karsacloud.biz.id.
            </p>

            {/* Plan Category Tabs */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
              <button
                type="button"
                onClick={() => setActivePlanTab('hosting')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activePlanTab === 'hosting' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Web Hosting
              </button>
              <button
                type="button"
                onClick={() => setActivePlanTab('reseller')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activePlanTab === 'reseller' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Reseller Hosting (White-Label)
              </button>
              <button
                type="button"
                onClick={() => setActivePlanTab('vps')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activePlanTab === 'vps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Cloud VPS
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {(activePlanTab === 'hosting' ? hostingPlans : activePlanTab === 'reseller' ? resellerPlans : vpsPlans).map((p, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  p.popular
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/10 transform lg:-translate-y-2'
                    : 'bg-slate-950 border border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                    Rekomendasi Terbaik
                  </div>
                )}

                <div>
                  <div className="text-xl font-bold text-white">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.tagline}</div>

                  <div className="mt-6 mb-2 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                    <span className="text-xs font-semibold text-slate-400">{p.period}</span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-medium mb-6">{p.yearlyPrice}</div>

                  <div className="border-t border-slate-800/80 pt-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Fitur Termasuk:</div>
                    <ul className="space-y-3 text-xs text-slate-300">
                      {p.specs.map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${p.popular ? 'text-amber-400' : 'text-sky-400'}`} />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col gap-2.5">
                  <a
                    href={getWaOrderLink(p.name, p.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl text-center font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      p.popular
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Pesan via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={onGoToPanel}
                    className="w-full py-2.5 rounded-xl text-center font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                  >
                    Akses Dashboard Panel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastruktur" className="py-24 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-sky-400 mb-2">Infrastruktur Kelas Dunia</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Dirancang untuk Kecepatan &amp; Reliabilitas Tanpa Kompromi</h3>
            <p className="mt-3 text-sm text-slate-400">
              Dibangun di atas arsitektur server modern dengan proteksi bertingkat dan koneksi langsung ke tulang punggung internet Indonesia dan global.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Zap className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-1">100% NVMe Gen4 Storage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kecepatan baca dan tulis disk hingga 7.000 MB/s, memangkas waktu loading website Anda hingga 300% lebih cepat dibanding SSD konvensional.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Shield className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-1">Auto-SSL &amp; Anti-DDoS</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Setiap domain dan subdomain otomatis dipasangi sertifikat SSL ZeroSSL/Let’s Encrypt. Dilengkapi mitigasi DDoS Cloudflare Anycast terpadu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Server className="w-8 h-8 text-sky-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-1">Dual Tier-3 Datacenter</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penempatan node di Gedung Cyber 1 Jakarta (peering langsung IIX &amp; OpenIXP) serta Singapore Edge Datacenter untuk jangkauan global.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <Headphones className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-1">Dukungan NOC 24/7</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bantuan teknis langsung dari pemilik dan tim administrator server melalui WhatsApp +62 812-2673-8883 tanpa antrean bot rumit.
              </p>
            </div>
          </div>

          {/* Interactive Server Node Showcase */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Node Server Aktif &bull; server.karsacloud.biz.id
                </div>
                <h4 className="text-2xl font-black text-white">Pusat Kendali Web Panel Karsa Cloud</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Seluruh akun hosting, reseller, file manager, dan database terkelola secara realtime melalui gateway panel terpusat di server.karsacloud.biz.id.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onGoToPanel}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Server className="w-4 h-4 text-amber-300" />
                  <span>Buka Web Panel Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-2">Pertanyaan Umum (FAQ)</h2>
            <h3 className="text-3xl font-black text-white">Hal yang Sering Ditanyakan</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full text-left p-5 font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer hover:text-amber-400 transition-colors"
                >
                  <span>{f.q}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 border-t border-slate-800/60 leading-relaxed bg-slate-900/30">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <CloudProLogo className="h-9 w-auto" />
                <span className="text-lg font-black text-white">KARSA CLOUD PRO</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm mb-4">
                Penyedia infrastruktur cloud hosting, white-label reseller, registrasi domain, dan server VPS performa tinggi untuk Indonesia dan dunia.
              </p>
              <div className="text-slate-300 space-y-1">
                <div>Pemilik &amp; Administrator: <strong className="text-white">Jaenal Maskun</strong></div>
                <div>WhatsApp Resmi: <strong className="text-emerald-400">+62 812-2673-8883</strong></div>
                <div>Email Resmi: <strong className="text-sky-400">admin@karsacloud.biz.id</strong></div>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-white mb-4">Akses &amp; Layanan</div>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={onGoToPanel} className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>Web Panel (server.karsacloud.biz.id)</span>
                  </button>
                </li>
                <li><a href="#paket" onClick={() => setActivePlanTab('hosting')} className="hover:text-white transition-colors">Shared Cloud Hosting</a></li>
                <li><a href="#paket" onClick={() => setActivePlanTab('reseller')} className="hover:text-white transition-colors">Reseller Hosting White-Label</a></li>
                <li><a href="#paket" onClick={() => setActivePlanTab('vps')} className="hover:text-white transition-colors">Cloud VPS &amp; Node Server</a></li>
                <li><a href="#domain" className="hover:text-white transition-colors">Registrasi Nama Domain</a></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-bold text-white mb-4">Metode Pembayaran</div>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">Bank BCA: 8420-9918-22</div>
                  <div className="text-slate-400">a/n Jaenal Maskun (Karsa Cloud)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">Bank Mandiri/BRI: 139-00-8829104-5</div>
                  <div className="text-slate-400">a/n Jaenal Maskun (Karsa Cloud)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-emerald-400">QRIS All Payment Instant</div>
                  <div className="text-slate-400">BCA, Mandiri, BRI, GoPay, OVO, Dana</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} <strong>Karsa Cloud PRO</strong> (karsacloud.biz.id). All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Main Site: <strong>karsacloud.biz.id</strong></span>
              <span>•</span>
              <span>Web Panel: <strong>server.karsacloud.biz.id</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
