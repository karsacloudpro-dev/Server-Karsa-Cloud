import React, { useState } from 'react';
import {
  Server,
  Shield,
  Zap,
  Globe,
  Database,
  Lock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  Star,
  Users,
  Award,
  Clock,
  Sparkles,
  Menu,
  X,
  CreditCard,
  Headphones,
  Laptop,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { CloudProLogo } from '../common/CloudProLogo';

interface LandingPageProps {
  onGoToPanel: (targetPortal?: 'server_admin' | 'client_portal') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToPanel }) => {
  const [activePlanTab, setActivePlanTab] = useState<'hosting' | 'reseller' | 'vps'>('hosting');
  const [domainQuery, setDomainQuery] = useState('');
  const [domainTld, setDomainTld] = useState('.biz.id');
  const [domainResult, setDomainResult] = useState<{
    domain: string;
    available: boolean;
    price: string;
  } | null>(null);
  const [isSearchingDomain, setIsSearchingDomain] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const officialWaNumber = '6281226738883';
  const officialWaLink = `https://wa.me/${officialWaNumber}?text=${encodeURIComponent(
    'Halo Karsa Cloud PRO, saya ingin konsultasi seputar layanan cloud hosting, VPS, dan reseller.'
  )}`;

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
    }, 350);
  };

  const getWaOrderLink = (planName: string, price: string) => {
    const text = encodeURIComponent(
      `Halo Karsa Cloud PRO, saya ingin memesan paket layanan: ${planName} (${price}). Mohon panduan pendaftaran dan aktivasi server.`
    );
    return `https://wa.me/${officialWaNumber}?text=${text}`;
  };

  const hostingPlans = [
    {
      name: 'Cloud Starter',
      tagline: 'Ideal untuk portfolio pribadi, blog, & UMKM rintisan',
      price: 'Rp 29.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 290.000 / th (Hemat 2 Bulan)',
      popular: false,
      specs: [
        '5 GB 100% NVMe Gen4 Storage',
        'Unmetered Bandwidth Bulanan',
        '1 Akun Domain Utama Hosted',
        'Gratis SSL Let’s Encrypt Selamanya',
        '2 Database MariaDB / MySQL',
        '5 Akun Email Bisnis (@domain)',
        'Multi-PHP 7.2 s/d 8.3 Selector',
        'Otomatisasi Backup Mingguan',
        'Akses cPanel Mandiri (client.)',
      ],
    },
    {
      name: 'Cloud Business PRO',
      tagline: 'Performa terbaik untuk madrasah, toko online, & portal institusi',
      price: 'Rp 75.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 750.000 / th (Paling Diminati)',
      popular: true,
      specs: [
        '25 GB 100% NVMe Gen4 Storage',
        'Unmetered Bandwidth Bulanan',
        'Unlimited Subdomain & Addon Domain',
        'Gratis Wildcard SSL (*.domain)',
        'Unlimited MariaDB / MySQL Database',
        'Unlimited Akun Email Bisnis',
        'PHP 7.2 (RDM), 7.4 (CBT), 8.2 & 8.3',
        'Daily Snapshot & Remote Backup',
        'Bantuan Migrasi Website Gratis 100%',
      ],
    },
    {
      name: 'Cloud Enterprise VIP',
      tagline: 'Sumber daya komputasi tinggi untuk traffic besar & aplikasi web berat',
      price: 'Rp 149.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 1.490.000 / th',
      popular: false,
      specs: [
        '60 GB NVMe Gen4 Ultra Performance',
        'Alokasi CPU & RAM Khusus Terisolasi',
        'Unlimited Domain Hosted',
        'Priority Anycast Cloudflare DDoS Filter',
        'PHP Memory Limit Hingga 1024 MB',
        'Auto-Restore 1-Click via File Manager',
        'Support Prioritas VIP via WhatsApp 24/7',
        'Dedicated IP Address (Opsional)',
        'Garansi SLA Uptime 99.99%',
      ],
    },
  ];

  const resellerPlans = [
    {
      name: 'Reseller Silver',
      tagline: 'Mulai bisnis web hosting dengan brand dan harga Anda sendiri',
      price: 'Rp 99.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 990.000 / tahun',
      popular: false,
      specs: [
        'Kapasitas Alokasi 40 GB NVMe Gen4',
        'Maksimal 25 Akun cPanel Pelanggan',
        'WHM (Web Host Manager) Panel',
        '100% White-Label (Private Branding)',
        'Private Nameservers (ns1/ns2.domainanda)',
        'Otomatisasi SSL untuk Seluruh Klien',
        'Bebas Menentukan Paket & Harga Jual',
        '100% Profit Langsung ke Rekening Anda',
      ],
    },
    {
      name: 'Reseller Gold Master',
      tagline: 'Pilihan paling populer bagi agensi pembuatan website & software house',
      price: 'Rp 189.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 1.890.000 / tahun',
      popular: true,
      specs: [
        'Kapasitas Alokasi 90 GB NVMe Gen4',
        'Maksimal 60 Akun cPanel Pelanggan',
        'WHM Panel Akses Penuh Mandiri',
        '100% White-Label Tanpa Jejak Kami',
        'Private Nameservers Custom Domain',
        'Bantuan Pemindahan Klien dari Hosting Lain',
        'Otomatisasi Backup Seluruh Akun Klien',
        'Konsultasi Bisnis Hosting Terarah',
      ],
    },
    {
      name: 'Reseller Platinum Ultra',
      tagline: 'Ekspansi bisnis hosting skala besar tanpa batas jumlah akun klien',
      price: 'Rp 329.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 3.290.000 / tahun',
      popular: false,
      specs: [
        'Kapasitas Alokasi 180 GB NVMe Gen4',
        'Unlimited Pembuatan Akun cPanel',
        'Prioritas CPU & RAM Per Tenant',
        'WHM Master Kontrol & Kuota Dinamis',
        'White-Label Lengkap Surat Penawaran',
        'Dukungan VIP Teknis WhatsApp Dedicated',
        'Gratis Subdomain Reseller Siap Pakai',
        'Garansi Uptime 99.99% Enterprise',
      ],
    },
  ];

  const vpsPlans = [
    {
      name: 'Cloud VPS - Node 1C1G',
      tagline: 'Server privat fleksibel untuk microservice, VPN, bot, & development',
      price: 'Rp 99.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 990.000 / tahun',
      popular: false,
      specs: [
        '1 vCPU High-Clock Compute Core',
        '1 GB DDR5 RAM',
        '25 GB NVMe SSD Disk',
        '1 Dedicated IPv4 Publik + IPv6 Subnet',
        'Full Root Access via Web Terminal / SSH',
        'Datacenter Cyber 1 Jakarta / Singapore',
        'OS Ubuntu 22.04 / 24.04 LTS Ready',
      ],
    },
    {
      name: 'Cloud VPS - Node 2C4G',
      tagline: 'Kapasitas prima untuk REST API, database SQL, & portal sekolah',
      price: 'Rp 199.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 1.990.000 / tahun',
      popular: true,
      specs: [
        '2 vCPU High-Clock Compute Core',
        '4 GB DDR5 RAM',
        '60 GB NVMe SSD Disk',
        '1 Dedicated IPv4 Publik + IPv6 Subnet',
        'Full Root Access & Web Terminal SSH',
        'Reverse Proxy Caddy & Nginx Terpasang',
        'Bantuan Setup Awal Server Gratis',
      ],
    },
    {
      name: 'Cloud VPS - Node 4C8G',
      tagline: 'Kekuatan komputasi masif untuk CBT, ERP, & aplikasi traffic padat',
      price: 'Rp 399.000',
      period: '/ bulan',
      yearlyPrice: 'Rp 3.990.000 / tahun',
      popular: false,
      specs: [
        '4 vCPU High-Clock Compute Core',
        '8 GB DDR5 RAM',
        '120 GB NVMe SSD Disk',
        '1 Dedicated IPv4 Publik + IPv6 Subnet',
        'Full Root Access & Snapshot Manager',
        'Direct Peering IIX, OpenIXP & Global Tier-1',
        'Monitoring Proaktif 24/7 SLA 99.99%',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Apa perbedaan server.karsacloud.biz.id dan client.karsacloud.biz.id?',
      a: 'server.karsacloud.biz.id adalah Web Panel utama khusus Root Administrator Server untuk mengontrol hardware, daemon cluster, vHost, database sistem, dan Web Terminal SSH. Sedangkan client.karsacloud.biz.id adalah portal mandiri khusus Klien Hosting dan Mitra Reseller untuk mengelola website, database phpMyAdmin, file manager, dan kuota akun masing-masing.',
    },
    {
      q: 'Di mana lokasi data center server Karsa Cloud PRO?',
      a: 'Infrastruktur kami ditempatkan di Tier-3 Datacenter: Gedung Cyber 1 Mampang Jakarta dengan koneksi langsung ke IIX (Indonesia Internet Exchange) dan OpenIXP dengan latency super rendah di seluruh Indonesia, serta Equinix Datacenter Singapore untuk konektivitas global berkecepatan tinggi.',
    },
    {
      q: 'Apakah saya mendapatkan bantuan pemindahan (migrasi) website gratis?',
      a: 'Ya, 100% GRATIS! Tim teknis Karsa Cloud PRO siap memindahkan seluruh file website, basis data SQL, akun email bisnis, dan DNS dari hosting lama Anda tanpa downtime.',
    },
    {
      q: 'Bagaimana metode pembayaran yang tersedia?',
      a: 'Kami menerima transfer bank resmi: BCA (8420-9918-22), Bank Mandiri / BRI (139-00-8829104-5), serta QRIS Instant otomatis (BCA, Mandiri, BRI, GoPay, OVO, DANA, ShopeePay, LinkAja) atas nama Jaenal Maskun (Karsa Cloud PRO).',
    },
    {
      q: 'Apakah paket Reseller Hosting benar-benar 100% White-Label?',
      a: 'Benar. Anda menggunakan brand, logo, domain, dan private nameserver (ns1/ns2.domainanda.com) milik Anda sendiri. Pelanggan Anda tidak akan melihat nama Karsa Cloud PRO, sehingga Anda leluasa menentukan harga jual dan menikmati 100% keuntungan.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800 font-sans selection:bg-sky-500 selection:text-white overflow-x-clip relative">
      {/* ========================================================================= */}
      {/* 1. SEAMLESS UNIFIED STICKY CLOUD HEADER (MENYATU DENGAN BODY CANVAS)      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#f8fbff]/92 backdrop-blur-xl border-b border-sky-100/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Brand Identity (Official Logo with Live Status Beacon) */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <CloudProLogo
              variant="compact"
              size="md"
              cloudTextColor="text-slate-900"
              showSubtitle={true}
              subtitleText="karsacloud.biz.id"
            />
            <span className="hidden min-[400px]:inline-flex items-center gap-1 font-mono text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-full shrink-0 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE</span>
            </span>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs xl:text-sm font-semibold text-slate-600">
            <a href="#beranda" className="hover:text-sky-600 transition-colors">
              Beranda
            </a>
            <a href="#portal" className="hover:text-sky-600 transition-colors">
              Akses Portal
            </a>
            <a href="#paket" className="hover:text-sky-600 transition-colors">
              Paket &amp; Harga
            </a>
            <a href="#domain" className="hover:text-sky-600 transition-colors">
              Cek Domain
            </a>
            <a href="#fitur" className="hover:text-sky-600 transition-colors">
              Infrastruktur
            </a>
            <a href="#faq" className="hover:text-sky-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right: Functional Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Portal Klien Button (client.karsacloud.biz.id) */}
              <button
                type="button"
                onClick={() => onGoToPanel('client_portal')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/90 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Akses Portal Klien & Reseller (client.karsacloud.biz.id)"
              >
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Portal Klien</span>
              </button>

              {/* Panel Admin Button (server.karsacloud.biz.id) */}
              <button
                type="button"
                onClick={() => onGoToPanel('server_admin')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-95"
                title="Akses Panel Admin Server (server.karsacloud.biz.id)"
              >
                <Server className="w-3.5 h-3.5 text-amber-300" />
                <span>Panel Admin</span>
              </button>
            </div>

            {/* Mobile / Android Dedicated Compact Action */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => onGoToPanel('server_admin')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:from-amber-600 active:to-amber-700 text-slate-950 px-2.5 py-1.5 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                title="Akses Panel Admin Server (server.karsacloud.biz.id)"
              >
                <Server className="w-3.5 h-3.5 text-slate-950" />
                <span>Admin Server</span>
              </button>
              <button
                type="button"
                onClick={() => onGoToPanel('client_portal')}
                className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white active:bg-sky-50 text-slate-700 px-2.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Akses Portal Klien & Reseller (client.karsacloud.biz.id)"
              >
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Klien</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl border border-sky-200/80 bg-white text-slate-700 hover:bg-sky-50 transition-all cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px] active:scale-95"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-4.5 h-4.5 text-sky-600" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Drawer (Seamless Cloud Styling) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sky-100/60 bg-[#f8fbff]/98 backdrop-blur-2xl px-4 py-5 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-xl">
            {/* Header Status in Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Karsa Cloud PRO Infrastructure</span>
              </span>
              <span className="text-emerald-600 font-bold">SLA 99.99% Online</span>
            </div>

            {/* 2 Gateway Access Cards */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGoToPanel('client_portal');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/70 to-white border border-sky-200 hover:border-sky-300 transition-all cursor-pointer text-left shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-sky-100/80 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">Portal Klien &amp; Reseller</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-700">cPanel</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">client.karsacloud.biz.id</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGoToPanel('server_admin');
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 to-white border border-amber-200 hover:border-amber-300 transition-all cursor-pointer text-left shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Server className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">Web Panel Admin Server</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Root Node</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">server.karsacloud.biz.id</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 ml-2" />
              </button>
            </div>

            {/* Quick Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1 pt-2 border-t border-sky-100 text-sm font-semibold text-slate-700">
              <a
                href="#beranda"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span>Beranda</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#portal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span>Gerbang Akses Portal Terpadu</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#paket"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span>Paket Hosting, Reseller &amp; VPS</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#domain"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span>Cek Ketersediaan Domain</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#fitur"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span>Infrastruktur &amp; Spesifikasi Hardware</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span>Pertanyaan Umum (FAQ)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </nav>

            {/* Direct Official WhatsApp Support Button in Drawer */}
            <div className="pt-2 border-t border-sky-100">
              <a
                href={officialWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 shadow-md shadow-emerald-700/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bantuan VIP WhatsApp 24/7 (CS Resmi)</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (MODERN CLOUD ATMOSPHERE)                                 */}
      {/* ========================================================================= */}
      <section id="beranda" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-sky-100/80 overflow-hidden">
        {/* Soft Cloud Ambient Lighting & Cirrus Blooms */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[720px] h-[340px] bg-gradient-to-tr from-sky-200/50 via-blue-100/40 to-indigo-100/30 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-4 w-[220px] sm:w-[440px] h-[220px] bg-sky-200/35 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* ========================================================================= */}
        {/* GRAND OFFICIAL CLOUD LOGO WATERMARK (WATERMARK LOGO AWAN RESMI KARSA)    */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none select-none -z-10 flex flex-col items-center justify-center overflow-hidden">
          {/* Luminous Atmospheric Radial Clouds */}
          <div className="absolute w-[600px] sm:w-[900px] h-[360px] sm:h-[480px] bg-gradient-to-tr from-sky-200/45 via-blue-100/35 to-indigo-100/25 blur-[120px] rounded-full" />
          
          {/* Grand Watermark of Official Karsa Cloud Logo Emblem */}
          <div className="relative flex flex-col items-center justify-center opacity-90">
            <svg
              className="w-[380px] sm:w-[560px] lg:w-[760px] h-auto drop-shadow-xs transition-all"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="karsaHeroLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.24" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.08" />
                </linearGradient>
                <radialGradient id="karsaHaloGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient Circular Cloud Halo */}
              <circle cx="50" cy="50" r="48" fill="url(#karsaHaloGlow)" />
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#0284c7"
                strokeWidth="0.6"
                strokeOpacity="0.25"
                strokeDasharray="3 3"
              />

              {/* Official Cloud Silhouette */}
              <path
                d="M 28 82 C 16 82 8 73 8 62 C 8 52 15 44 24 42 C 26 28 38 18 52 18 C 65 18 75 25 79 36 C 89 37 98 46 98 57 C 98 69 89 79 78 81 C 75 82 32 82 28 82 Z"
                fill="url(#karsaHeroLogoGrad)"
                stroke="#0284c7"
                strokeWidth="1.6"
                strokeOpacity="0.35"
              />

              {/* Iconic Dynamic Ascending Swoosh / Rocket Trajectory */}
              <path
                d="M 18 82 C 22 71 28 62 36 59 C 40 57.5 44 57.5 47 59 C 51 61.5 52.5 66.5 51 71 C 49 76 43 78 38 75 C 34.5 73 33 68.5 34.5 64 C 36 57 43 51 52 48 L 74 37"
                stroke="#0284c7"
                strokeWidth="3.2"
                strokeOpacity="0.48"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Ascending Arrow Tip Pointer */}
              <polygon
                points="72,27 88,32 78,46 76,40 68,44"
                fill="#0284c7"
                fillOpacity="0.48"
              />

              {/* Secondary Speed Aerodynamic Lift Line */}
              <path
                d="M 24 82 C 28 73 34 66 41 63"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeOpacity="0.42"
                strokeLinecap="round"
                fill="none"
              />

              {/* Official Brand Watermark Subtitle Text */}
              <text
                x="50"
                y="94"
                textAnchor="middle"
                fill="#0369a1"
                fillOpacity="0.30"
                fontSize="4.2"
                fontWeight="900"
                letterSpacing="0.24em"
                fontFamily="sans-serif"
              >
                KARSA CLOUD PRO
              </text>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto space-y-5 sm:space-y-6">
            {/* Unboxed Metadata Kicker (Anti-Pill Rule) */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% NVMe Gen4 Storage
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>Tier-3 Singapore &amp; Cyber 1 Jakarta</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="text-sky-700 font-semibold">Caddy HTTP/3 Auto-SSL</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] sm:leading-tight">
              Infrastruktur Cloud Hosting, Reseller &amp; VPS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">
                Berkelas Enterprise
              </span>
            </h1>

            {/* Body Description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto px-1">
              Performa komputasi mutakhir dengan perlindungan DDoS Anycast, isolasi tenant anti-konflik, dan panel kontrol terpadu untuk bisnis, instansi, madrasah/sekolah, dan pengusaha reseller hosting.
            </p>

            {/* Dual CTAs + WhatsApp Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => onGoToPanel('client_portal')}
                className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 shadow-lg shadow-sky-600/25 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Users className="w-4.5 h-4.5 text-sky-100" />
                <span>Masuk Portal Klien</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onGoToPanel('server_admin')}
                className="flex items-center justify-center gap-2 rounded-xl border border-sky-200/90 bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-700 font-bold text-sm sm:text-base py-3.5 px-5 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <Server className="w-4 h-4 text-amber-500" />
                <span>Web Panel Admin</span>
              </button>

              <a
                href={officialWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base py-3.5 px-5 shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4.5 h-4.5 text-white" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Live Infrastructure Matrix (Pristine Cloud Cards) */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-xs shadow-sky-950/5">
                <div className="text-[11px] text-slate-500 font-medium">Garansi Uptime SLA</div>
                <div className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">99.99% Online</div>
                <div className="text-[10px] text-slate-400">Tier-3 Architecture</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-xs shadow-sky-950/5">
                <div className="text-[11px] text-slate-500 font-medium">Media Penyimpanan</div>
                <div className="text-base sm:text-lg font-black text-sky-600 mt-0.5">100% NVMe Gen4</div>
                <div className="text-[10px] text-slate-400">Superfast I/O Speed</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-xs shadow-sky-950/5">
                <div className="text-[11px] text-slate-500 font-medium">Koneksi Jaringan</div>
                <div className="text-base sm:text-lg font-black text-blue-700 mt-0.5">Direct IIX &amp; Global</div>
                <div className="text-[10px] text-slate-400">Latency &lt; 5ms Nasional</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-xs shadow-sky-950/5">
                <div className="text-[11px] text-slate-500 font-medium">Sertifikasi Keamanan</div>
                <div className="text-base sm:text-lg font-black text-indigo-600 mt-0.5">TLS 1.3 / HTTP/3</div>
                <div className="text-[10px] text-slate-400">Let&apos;s Encrypt &amp; ZeroSSL</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DEDICATED SECTION: PEMISAHAN DUA PINTU SERVER VS KLIEN                */}
      {/* ========================================================================= */}
      <section id="portal" className="py-14 sm:py-20 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">
              ARSITEKTUR MULTI-TENANT TERISOLASI
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight">
              Gerbang Akses Portal Terpadu
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Untuk menjamin keamanan cluster dan kestabilan performa, Karsa Cloud PRO menghadirkan gerbang akses terisolasi untuk Administrator Server serta Portal Klien &amp; Reseller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Card 1: server.karsacloud.biz.id (Khusus Admin) */}
            <div className="rounded-2xl border border-amber-200/90 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-amber-950/5 relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                    KHUSUS ROOT ADMIN
                  </span>
                  <span className="text-xs font-mono text-slate-400">Port 3000 Node</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-950 font-mono break-all">
                      server.karsacloud.biz.id
                    </h3>
                    <p className="text-xs text-amber-700 font-semibold">Web Panel Admin Server</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Gerbang sentral untuk Administrator Server. Mengelola telemetri node hardware, restart daemon layanan (Caddy, PHP-FPM, MariaDB), manajemen akun hosting vHost, dan Web Terminal SSH root.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Hanya akun dengan hak akses <strong>Root Administrator</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Terhubung ke repo GitHub default untuk auto-update</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Akses Web Terminal SSH root &amp; audit log</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onGoToPanel('server_admin')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  <Server className="w-4 h-4" />
                  <span>Masuk Web Panel Admin (server.)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 2: client.karsacloud.biz.id (Khusus Klien & Reseller) */}
            <div className="rounded-2xl border border-sky-200/90 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-sky-950/5 relative overflow-hidden group hover:border-sky-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 uppercase tracking-wider">
                    KHUSUS KLIEN &amp; RESELLER
                  </span>
                  <span className="text-xs font-mono text-slate-400">cPanel SSO</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-950 font-mono break-all">
                      client.karsacloud.biz.id
                    </h3>
                    <p className="text-xs text-sky-700 font-semibold">Portal Layanan Klien &amp; WHM Reseller</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Gerbang masuk pelanggan dan mitra reseller. Mengelola file website di File Manager, database phpMyAdmin, pembuatan subdomain aplikasi, email bisnis, dan kuota klien reseller.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>Login untuk <strong>Mitra Reseller</strong> &amp; <strong>Pelanggan cPanel</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>Otomatis diarahkan ke dashboard sesuai hak akses akun</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>Terisolasi total tanpa akses ke konfigurasi sistem server</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onGoToPanel('client_portal')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Masuk Portal Klien (client.)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DOMAIN LOOKUP SEARCH ENGINE                                            */}
      {/* ========================================================================= */}
      <section id="domain" className="py-14 sm:py-20 bg-white border-b border-sky-100/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">
              REGISTRASI NAMA DOMAIN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1.5">
              Cari &amp; Daftarkan Domain Impian Anda
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Temukan nama domain resmi untuk bisnis, madrasah/sekolah, toko online, atau brand personal Anda.
            </p>
          </div>

          <form onSubmit={handleDomainCheck} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl border border-sky-200/90 shadow-xl shadow-sky-100/60">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-sky-500 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Ketik nama domain (contoh: bisnisku)"
                  value={domainQuery}
                  onChange={e => setDomainQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-900 text-xs sm:text-sm focus:outline-none placeholder-slate-400 py-2.5"
                />
              </div>

              <select
                value={domainTld}
                onChange={e => setDomainTld(e.target.value)}
                className="bg-sky-50/80 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-sky-200 focus:outline-none cursor-pointer"
              >
                <option value=".biz.id">.biz.id (Rp 25.000 / th)</option>
                <option value=".my.id">.my.id (Rp 15.000 / th)</option>
                <option value=".com">.com (Rp 160.000 / th)</option>
                <option value=".id">.id (Rp 225.000 / th)</option>
                <option value=".sch.id">.sch.id (Rp 65.000 / th)</option>
              </select>

              <button
                type="submit"
                disabled={isSearchingDomain}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-sky-600/20 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Search Result Banner */}
          {domainResult && (
            <div className="mt-5 max-w-2xl mx-auto animate-in fade-in duration-200">
              {domainResult.available ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="font-extrabold text-slate-950 text-sm sm:text-base font-mono">
                        {domainResult.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-800 font-bold text-[10px]">
                        TERSEDIA
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600 text-xs">
                      Harga Registrasi Resmi: <strong className="text-emerald-700 font-bold">{domainResult.price}</strong>
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${officialWaNumber}?text=${encodeURIComponent(
                      `Halo Karsa Cloud PRO, saya ingin mendaftarkan domain: ${domainResult.domain} (${domainResult.price}). Mohon bantuan setup DNS dan hostingnya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 font-bold text-xs shadow-md shadow-emerald-700/20 transition-colors"
                  >
                    <span>Daftarkan via WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 sm:p-5 text-center text-xs text-rose-800 shadow-xs">
                  Nama domain <strong>{domainResult.domain}</strong> tidak tersedia atau sudah dimiliki orang lain. Coba kombinasi nama atau TLD lain!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE PRICING PLANS (HOSTING, RESELLER, VPS)                     */}
      {/* ========================================================================= */}
      <section id="paket" className="py-14 sm:py-24 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/30 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">
              PILIHAN PAKET LAYANAN
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-1.5 tracking-tight">
              Investasi Terjangkau dengan Performa Maksimal
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-500">
              Pilih spesifikasi yang tepat untuk kebutuhan website Anda. Seluruh paket didukung storage 100% NVMe Gen4 dan garansi migrasi gratis.
            </p>

            {/* Segmented Category Buttons */}
            <div className="mt-6 inline-flex p-1 rounded-xl bg-white border border-sky-200/90 text-xs font-bold shadow-xs">
              <button
                type="button"
                onClick={() => setActivePlanTab('hosting')}
                className={`py-2 px-3.5 sm:px-5 rounded-lg transition-all cursor-pointer ${
                  activePlanTab === 'hosting'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60'
                }`}
              >
                Cloud Hosting cPanel
              </button>
              <button
                type="button"
                onClick={() => setActivePlanTab('reseller')}
                className={`py-2 px-3.5 sm:px-5 rounded-lg transition-all cursor-pointer ${
                  activePlanTab === 'reseller'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60'
                }`}
              >
                WHM Reseller Partner
              </button>
              <button
                type="button"
                onClick={() => setActivePlanTab('vps')}
                className={`py-2 px-3.5 sm:px-5 rounded-lg transition-all cursor-pointer ${
                  activePlanTab === 'vps'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60'
                }`}
              >
                Cloud VPS KVM
              </button>
            </div>
          </div>

          {/* Pricing Grid (Pristine Elevated Cloud Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {(activePlanTab === 'hosting'
              ? hostingPlans
              : activePlanTab === 'reseller'
              ? resellerPlans
              : vpsPlans
            ).map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'border-2 border-sky-500 bg-white shadow-xl shadow-sky-600/12 ring-4 ring-sky-100/80'
                    : 'border border-sky-100/90 bg-white shadow-sm shadow-sky-950/5 hover:border-sky-300 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-sky-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    PALING POPULER
                  </div>
                )}

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-950">{plan.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-950">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-semibold">{plan.period}</span>
                    </div>
                    <div className="text-[11px] text-sky-700 font-semibold mt-0.5">
                      {plan.yearlyPrice}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                    {plan.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-slate-700">
                        <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => onGoToPanel('client_portal')}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                      plan.popular
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25'
                        : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/20'
                    }`}
                  >
                    <span>Pesan Layanan Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href={getWaOrderLink(plan.name, plan.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                  >
                    <span>Konsultasi via WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INFRASTRUKTUR & FITUR UNGGULAN (MODERN CLOUD BENTO)                    */}
      {/* ========================================================================= */}
      <section id="fitur" className="py-14 sm:py-20 bg-white border-b border-sky-100/80 relative overflow-hidden">
        {/* Subtle Background Cloud Logo Watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-50 translate-x-1/4 -z-0">
          <svg
            className="w-[440px] lg:w-[600px] h-auto text-sky-500"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 28 82 C 16 82 8 73 8 62 C 8 52 15 44 24 42 C 26 28 38 18 52 18 C 65 18 75 25 79 36 C 89 37 98 46 98 57 C 98 69 89 79 78 81 C 75 82 32 82 28 82 Z"
              fill="#0284c7"
              fillOpacity="0.10"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeOpacity="0.22"
            />
            <path
              d="M 18 82 C 22 71 28 62 36 59 C 40 57.5 44 57.5 47 59 C 51 61.5 52.5 66.5 51 71 C 49 76 43 78 38 75 C 34.5 73 33 68.5 34.5 64 C 36 57 43 51 52 48 L 74 37"
              stroke="#0284c7"
              strokeWidth="2.4"
              strokeOpacity="0.30"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <polygon points="72,27 88,32 78,46 76,40 68,44" fill="#0284c7" fillOpacity="0.30" />
            <path
              d="M 24 82 C 28 73 34 66 41 63"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeOpacity="0.25"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">
              KEUNGGULAN SISTEM
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-1.5 tracking-tight">
              Standar Komputasi Cloud Tanpa Kompromi
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-500">
              Dirancang untuk ketahanan beban tinggi dan keamanan maksimal dari level kernel hingga reverse-proxy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-50/60 to-white border border-sky-100/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100/80 border border-sky-200/90 flex items-center justify-center text-sky-600">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">100% NVMe Gen4 Enterprise Storage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kecepatan baca-tulis hingga 7.000 MB/s membuat query database SQL, pembukaan halaman web, dan CMS memuat secara instan tanpa lag.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-white border border-sky-100/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100/80 border border-emerald-200/90 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Proteksi DDoS Anycast &amp; Web Firewall</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penyaringan serangan lalu lintas berbahaya secara otomatis sebelum mencapai node server Anda dengan filtrasi terdistribusi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50/40 to-white border border-sky-100/90 shadow-xs hover:border-amber-300 hover:shadow-md transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100/80 border border-amber-200/90 flex items-center justify-center text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Reverse Proxy Caddy &amp; TLS 1.3 HTTP/3</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sertifikat SSL Let&apos;s Encrypt &amp; ZeroSSL terbit dan diperpanjang otomatis. Dukungan protokol HTTP/3 modern untuk kecepatan transfer optimal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-sky-100/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100/80 border border-blue-200/90 flex items-center justify-center text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Multi-PHP Selector 7.2 s/d 8.3</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Atur versi runtime PHP yang berbeda untuk masing-masing domain dan subdomain Anda dengan satu klik di Web Panel.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-sky-100/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100/80 border border-indigo-200/90 flex items-center justify-center text-indigo-600">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Web Terminal SSH &amp; Git Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kelola file dan deployment repository GitHub langsung dari browser tanpa perlu menginstal aplikasi terminal tambahan di perangkat Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-50/50 to-white border border-sky-100/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100/80 border border-sky-200/90 flex items-center justify-center text-sky-600">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Bantuan Migrasi Gratis &amp; Support 24/7</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tim teknis kami memindahkan seluruh data Anda dari hosting sebelumnya tanpa downtime, didukung konsultasi langsung via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRESET APLIKASI MADRASAH, SEKOLAH & BISNIS                            */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/20 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">
              PRESET OPTIMAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1.5">
              Dukungan Penuh Aplikasi Madrasah, Sekolah &amp; Bisnis
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Server telah diuji dan dikonfigurasi khusus agar kompatibel penuh dengan aplikasi penting tanpa error versi PHP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4.5 rounded-xl bg-white border border-sky-100/90 shadow-xs space-y-2 hover:border-sky-200 transition-all">
              <div className="text-emerald-700 font-bold text-xs font-mono">PHP 7.2 OPTIMIZED</div>
              <h4 className="text-sm font-extrabold text-slate-950">Rapor Digital Madrasah (RDM)</h4>
              <p className="text-[11px] text-slate-500">
                Ekstensi ionCube, GD, dan php-zip siap pakai untuk penilaian rapor semester madrasah lancar.
              </p>
            </div>
            <div className="p-4.5 rounded-xl bg-white border border-sky-100/90 shadow-xs space-y-2 hover:border-sky-200 transition-all">
              <div className="text-indigo-700 font-bold text-xs font-mono">PHP 7.4 READY</div>
              <h4 className="text-sm font-extrabold text-slate-950">CBT / Ujian Berbasis Komputer</h4>
              <p className="text-[11px] text-slate-500">
                Kapasitas concurrent connection tinggi untuk ribuan siswa saat ujian serentak.
              </p>
            </div>
            <div className="p-4.5 rounded-xl bg-white border border-sky-100/90 shadow-xs space-y-2 hover:border-sky-200 transition-all">
              <div className="text-sky-700 font-bold text-xs font-mono">PHP 8.2 LTS</div>
              <h4 className="text-sm font-extrabold text-slate-950">E-Learning &amp; Moodle</h4>
              <p className="text-[11px] text-slate-500">
                OPcache aktif dan alokasi memori besar untuk materi pembelajaran video &amp; PDF.
              </p>
            </div>
            <div className="p-4.5 rounded-xl bg-white border border-sky-100/90 shadow-xs space-y-2 hover:border-sky-200 transition-all">
              <div className="text-amber-700 font-bold text-xs font-mono">PHP 8.3 LATEST</div>
              <h4 className="text-sm font-extrabold text-slate-950">WordPress &amp; Toko Online</h4>
              <p className="text-[11px] text-slate-500">
                Kecepatan eksekusi script maksimum untuk katalog produk, checkout, dan blog dinamis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION                                                          */}
      {/* ========================================================================= */}
      <section id="faq" className="py-14 sm:py-20 bg-white border-b border-sky-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">
              INFORMASI &amp; JAWABAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1.5">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="rounded-xl border border-sky-100/90 bg-sky-50/30 overflow-hidden transition-colors hover:border-sky-200"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === fIdx ? null : fIdx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedFaq === fIdx ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {expandedFaq === fIdx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-sky-100 bg-white/70 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. REKENING RESMI & LEGALITAS TRANSAKSI                                    */}
      {/* ========================================================================= */}
      <section className="py-12 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/30 border-b border-sky-100/80 text-xs text-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-sky-200/90 bg-white p-6 sm:p-7 space-y-4 shadow-sm shadow-sky-950/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm sm:text-base font-bold text-slate-950">
                  Informasi Rekening Resmi Pembayaran Karsa Cloud PRO
                </h4>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                Semua Atas Nama: <strong>Jaenal Maskun</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11.5px]">
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="text-slate-500 text-[10px]">BANK CENTRAL ASIA (BCA)</div>
                <div className="text-slate-950 font-bold text-sm mt-0.5">8420-9918-22</div>
                <div className="text-slate-500 text-[10px]">a.n. Jaenal Maskun</div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="text-slate-500 text-[10px]">BANK MANDIRI / BRI</div>
                <div className="text-slate-950 font-bold text-sm mt-0.5">139-00-8829104-5</div>
                <div className="text-slate-500 text-[10px]">a.n. Jaenal Maskun</div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="text-slate-500 text-[10px]">QRIS INSTANT OTOMATIS</div>
                <div className="text-emerald-700 font-bold text-sm mt-0.5">BCA, Mandiri, GoPay, DANA</div>
                <div className="text-slate-500 text-[10px]">Karsa Cloud PRO</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Setelah melakukan transfer, silakan kirimkan bukti pembayaran ke WhatsApp resmi <strong>0812-2673-8883</strong> untuk aktivasi instan akun dan setup domain Anda.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CLEAN EXECUTIVE FOOTER (NO CLUTTER)                                   */}
      {/* ========================================================================= */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <CloudProLogo className="h-8 w-auto" cloudTextColor="text-white" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penyedia infrastruktur cloud hosting, WHM reseller, dan VPS enterprise dengan storage 100% NVMe Gen4 dan jaringan Tier-3 berkecepatan tinggi.
              </p>
            </div>

            <div>
              <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Gerbang Portal
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => onGoToPanel('server_admin')}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-mono"
                  >
                    server.karsacloud.biz.id (Admin)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onGoToPanel('client_portal')}
                    className="hover:text-sky-300 transition-colors cursor-pointer text-left font-mono"
                  >
                    client.karsacloud.biz.id (Klien)
                  </button>
                </li>
                <li>
                  <a href="#beranda" className="hover:text-white transition-colors">
                    karsacloud.biz.id (Portal Utama)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Layanan Utama
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="#paket" className="hover:text-white transition-colors">
                    Cloud Hosting cPanel
                  </a>
                </li>
                <li>
                  <a href="#paket" className="hover:text-white transition-colors">
                    WHM Reseller 100% White-Label
                  </a>
                </li>
                <li>
                  <a href="#paket" className="hover:text-white transition-colors">
                    Cloud VPS KVM Dedicated
                  </a>
                </li>
                <li>
                  <a href="#domain" className="hover:text-white transition-colors">
                    Registrasi Domain Murah
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Kontak &amp; Bantuan
              </div>
              <ul className="space-y-2">
                <li>
                  <a
                    href={officialWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp: 0812-2673-8883</span>
                  </a>
                </li>
                <li>
                  <span>Email: cloudpro.enterprise@gmail.com</span>
                </li>
                <li>
                  <span>Lokasi: Gedung Cyber 1 Jakarta &amp; Equinix Singapore</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} <strong>Karsa Cloud PRO</strong>. Hak cipta dilindungi undang-undang.
            </div>
            <div className="flex items-center gap-4">
              <span>Apex: karsacloud.biz.id</span>
              <span>•</span>
              <span>Admin: server.karsacloud.biz.id</span>
              <span>•</span>
              <span>Client: client.karsacloud.biz.id</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
