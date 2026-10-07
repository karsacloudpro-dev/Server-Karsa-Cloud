import React, { useState } from 'react';
import {
  Server,
  Globe,
  Layers,
  Cpu,
  Shield,
  CheckCircle2,
  Zap,
  ArrowRight,
  CreditCard,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Clock,
  HardDrive,
  Users,
  Search,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import { db } from '../../services/storage';
import { HostingAccount, Invoice, HostingPlan } from '../../types';

interface ClientProductCatalogProps {
  onNavigate?: (tab: string) => void;
  preSelectedPlanId?: string;
}

export const ClientProductCatalog: React.FC<ClientProductCatalogProps> = ({
  onNavigate,
  preSelectedPlanId,
}) => {
  const { currentUser } = useAuth();
  const { refreshAll } = useServer();

  const [activeCategory, setActiveCategory] = useState<'hosting' | 'reseller' | 'vps' | 'domain'>('hosting');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Order modal state
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [domainName, setDomainName] = useState('');
  const [domainAction, setDomainAction] = useState<'new' | 'existing'>('new');
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  const [domainCheckStatus, setDomainCheckStatus] = useState<{ available?: boolean; message?: string } | null>(null);

  // Checkout status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    domain: string;
    planName: string;
  } | null>(null);

  const officialWaNumber = '6281226738883';

  // Product Data
  const hostingPlans = [
    {
      id: 'plan-starter',
      name: 'Cloud Starter NVMe',
      tagline: 'Ideal untuk portfolio, blog pribadi, & UMKM rintisan',
      priceMonthly: 29000,
      priceYearly: 290000,
      specs: {
        disk: '5 GB NVMe Gen4 Storage',
        bandwidth: 'Unmetered Bandwidth Bulanan',
        domains: '1 Domain Utama Hosted',
        databases: '2 Basis Data MySQL / MariaDB',
        emails: '5 Akun Email Bisnis (@domain)',
        ssl: "AutoSSL Let's Encrypt Gratis Selamanya",
        php: 'Multi-PHP 7.4 s/d 8.3 Selector',
        backup: 'Snapshot Backup Mingguan Otomatis',
      },
      popular: false,
    },
    {
      id: 'plan-pro',
      name: 'Cloud Business PRO',
      tagline: 'Performa terbaik untuk madrasah, toko online, & portal institusi',
      priceMonthly: 75000,
      priceYearly: 750000,
      specs: {
        disk: '25 GB Superfast NVMe Gen4 Storage',
        bandwidth: 'Unmetered Bandwidth Bulanan',
        domains: 'Hingga 10 Domain / Website Hosted',
        databases: '20 Basis Data MySQL / MariaDB',
        emails: '50 Akun Email Bisnis (@domain)',
        ssl: 'Gratis SSL Otomatis per Setiap Domain',
        php: 'Multi-PHP 7.4 s/d 8.3 Selector + OPcache',
        backup: 'Otomatisasi Backup Harian & Mingguan',
      },
      popular: true,
      badge: 'Paling Diminati',
    },
    {
      id: 'plan-enterprise',
      name: 'Cloud Enterprise Ultra',
      tagline: 'Dedicated Resource untuk traffic tinggi, instansi, & portal ujian',
      priceMonthly: 150000,
      priceYearly: 1500000,
      specs: {
        disk: '100 GB NVMe Gen4 High-IOPS',
        bandwidth: 'Unmetered Bandwidth Dedicated 1Gbps',
        domains: 'Unlimited Multi-Domain Hosted',
        databases: 'Unlimited Basis Data MySQL',
        emails: 'Unlimited Email Bisnis & Webmail',
        ssl: 'Wildcard & Subdomain AutoSSL Otomatis',
        php: 'Multi-PHP & Custom php.ini Extension',
        backup: 'Realtime Replikasi & Snapshot Backup',
      },
      popular: false,
    },
  ];

  const resellerPlans = [
    {
      id: 'reseller-starter',
      name: 'Reseller Lite Partner',
      tagline: 'Mulai bisnis web hosting dengan brand Anda sendiri',
      priceMonthly: 150000,
      priceYearly: 1500000,
      specs: {
        disk: '50 GB NVMe Gen4 Alokasi Reseller',
        bandwidth: 'Unmetered Bandwidth Bulanan',
        accounts: 'Hingga 15 Akun cPanel Terisolasi',
        whitelabel: '100% White-Label (Logo & Brand Anda)',
        nameserver: 'Private Nameserver (ns1/ns2.domainanda)',
        overselling: 'Fitur Overselling Diizinkan',
      },
      popular: false,
    },
    {
      id: 'reseller-pro',
      name: 'Reseller PRO Whitelabel',
      tagline: 'Pilihan utama agensi digital & pengembang software',
      priceMonthly: 350000,
      priceYearly: 3500000,
      specs: {
        disk: '150 GB NVMe Gen4 Alokasi Reseller',
        bandwidth: 'Unmetered Bandwidth Bulanan',
        accounts: 'Hingga 50 Akun cPanel Terisolasi',
        whitelabel: '100% Full White-Label & Panel Klien Pribadi',
        nameserver: 'Private Nameserver Kustom Bebas',
        overselling: 'Fitur Overselling Penuh Aktif',
      },
      popular: true,
      badge: 'Rekomendasi Agensi',
    },
    {
      id: 'reseller-platinum',
      name: 'Reseller Platinum Master',
      tagline: 'Kapasitas maksimal untuk provider hosting lokal',
      priceMonthly: 750000,
      priceYearly: 7500000,
      specs: {
        disk: '500 GB NVMe Gen4 Enterprise Storage',
        bandwidth: 'Unmetered Bandwidth Dedicated',
        accounts: 'Unlimited Akun cPanel Terisolasi',
        whitelabel: 'Custom Invoice Header, Logo, & Tema',
        nameserver: 'Dedicated Cluster Private Nameserver',
        overselling: 'Prioritas Resource Tier 1',
      },
      popular: false,
    },
  ];

  const vpsPlans = [
    {
      id: 'vps-kvm-starter',
      name: 'Cloud VPS KVM 2 Core',
      tagline: 'Dedicated root access untuk aplikasi web & database',
      priceMonthly: 120000,
      priceYearly: 1200000,
      specs: {
        cpu: '2 vCPU KVM High Performance',
        ram: '4 GB ECC RAM Dedicated',
        disk: '60 GB Pure NVMe Storage',
        bandwidth: '2 TB Bandwidth Transfer Bulanan',
        ip: '1 Dedicated IPv4 Publik + IPv6 Subnet',
        os: 'Ubuntu 22.04 / 24.04 / Debian 12 / AlmaLinux',
      },
      popular: false,
    },
    {
      id: 'vps-kvm-pro',
      name: 'Cloud VPS KVM 4 Core',
      tagline: 'Kinerja maksimal untuk production server & multi-app',
      priceMonthly: 240000,
      priceYearly: 2400000,
      specs: {
        cpu: '4 vCPU KVM High Performance',
        ram: '8 GB ECC RAM Dedicated',
        disk: '120 GB Pure NVMe Storage',
        bandwidth: '5 TB Bandwidth Transfer Bulanan',
        ip: '1 Dedicated IPv4 Publik + IPv6 Subnet',
        os: 'Pilihan Bebas OS Linux + Web Panel Pre-installed',
      },
      popular: true,
      badge: 'Spek Terbaik',
    },
  ];

  const domainTlds = [
    { tld: '.biz.id', price: 15000, period: '/ tahun', desc: 'Domain resmi bisnis & UMKM Indonesia (Terlaris)' },
    { tld: '.my.id', price: 15000, period: '/ tahun', desc: 'Domain personal & portfolio Indonesia' },
    { tld: '.com', price: 145000, period: '/ tahun', desc: 'Domain komersial global terpopuler di dunia' },
    { tld: '.id', price: 225000, period: '/ tahun', desc: 'Identitas resmi Republik Indonesia tingkat tertinggi' },
    { tld: '.sch.id', price: 55000, period: '/ tahun', desc: 'Domain khusus sekolah & madrasah resmi' },
    { tld: '.org', price: 165000, period: '/ tahun', desc: 'Domain organisasi dan komunitas nirlaba' },
  ];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCheckDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim()) return;
    setIsDomainChecking(true);
    setDomainCheckStatus(null);

    setTimeout(() => {
      setIsDomainChecking(false);
      const clean = domainName.trim().toLowerCase().replace(/^(https?:\/\/)/, '');
      setDomainCheckStatus({
        available: true,
        message: `Domain ${clean} tersedia untuk didaftarkan dan dihubungkan ke server!`,
      });
    }, 400);
  };

  const handleStartOrder = (plan: any) => {
    setSelectedPlan(plan);
    setDomainName('');
    setDomainCheckStatus(null);
    setOrderSuccess(null);
  };

  const handleProcessOrder = () => {
    if (!selectedPlan || !currentUser) return;

    const finalDomain =
      domainName.trim().toLowerCase().replace(/^(https?:\/\/)/, '') ||
      `cloud-${Math.floor(1000 + Math.random() * 9000)}.karsacloud.biz.id`;

    setIsSubmitting(true);

    setTimeout(() => {
      const price = billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
      const cycleLabel = billingCycle === 'yearly' ? '1 Tahun' : '1 Bulan';

      // 1. Create Invoice
      const invId = `inv-ord-${Date.now()}`;
      const invNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newInvoice: Invoice = {
        id: invId,
        invoiceNumber: invNumber,
        userId: currentUser.id,
        userName: currentUser.name || 'Pelanggan Karsa Cloud',
        userEmail: currentUser.email || 'pelanggan@karsacloud.biz.id',
        userPhone: currentUser.phone || '+62 812-2673-8883',
        amount: price,
        currency: 'IDR',
        status: 'unpaid',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Order Layanan: ${selectedPlan.name} (${cycleLabel}) - Domain: ${finalDomain}`,
        items: [
          {
            description: `Paket ${selectedPlan.name} (${cycleLabel})`,
            qty: 1,
            unitPrice: price,
            amount: price,
          },
          {
            description: `Setup Domain: ${finalDomain} + AutoSSL HTTPS`,
            qty: 1,
            unitPrice: 0,
            amount: 0,
          },
        ],
      };

      db.saveInvoice(newInvoice);

      // 2. Create Hosting Account under this customer
      const usernameClean =
        currentUser.username ||
        finalDomain.split('.')[0].replace(/[^a-z0-9]/g, '').slice(0, 12) ||
        `usr${Math.floor(100 + Math.random() * 899)}`;

      const newAcc: HostingAccount = {
        id: `acc-ord-${Date.now()}`,
        primaryDomain: finalDomain,
        domain: finalDomain,
        username: usernameClean,
        customerId: currentUser.id,
        customerName: currentUser.name || 'Pelanggan Hosting',
        customerEmail: currentUser.email || 'pelanggan@karsacloud.biz.id',
        serverId: 'srv-id-01',
        serverName: 'ID-Cyber-01 (Jakarta)',
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        diskUsedMb: 1,
        diskLimitMb: selectedPlan.specs?.disk ? parseInt(selectedPlan.specs.disk) * 1024 : 10240,
        bandwidthUsedMb: 10,
        bandwidthLimitMb: 102400,
        phpVersion: '8.2',
        phpExtensions: ['mysqli', 'pdo', 'curl', 'opcache', 'gd', 'mbstring', 'zip'],
        status: 'active',
        sslStatus: 'active',
        sslProvider: "Let's Encrypt",
        sslExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        forceHttps: true,
        documentRoot: `/home/${usernameClean}/public_html`,
        ipAddress: '172.67.223.133',
        databaseCount: 0,
        emailCount: 0,
        ftpCount: 1,
        nameservers: ['ns1.karsacloud.biz.id', 'ns2.karsacloud.biz.id'],
        createdAt: new Date().toISOString(),
      };

      db.saveHostingAccount(newAcc);
      refreshAll();

      setIsSubmitting(false);
      setOrderSuccess({
        invoiceId: invId,
        invoiceNumber: invNumber,
        amount: price,
        domain: finalDomain,
        planName: selectedPlan.name,
      });
    }, 600);
  };

  const getWaPaymentConfirmLink = (invNumber: string, amount: number, domain: string, plan: string) => {
    const text = encodeURIComponent(
      `Halo Admin Karsa Cloud PRO, saya pelanggan ${currentUser?.name || ''} (${currentUser?.email || ''}) telah melakukan order paket ${plan} untuk domain ${domain} dengan nomor tagihan *${invNumber}* sebesar *${formatRupiah(amount)}*. Mohon verifikasi pembayaran dan aktivasi instan akun saya.`
    );
    return `https://wa.me/${officialWaNumber}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>KATALOG PRODUK &amp; LAYANAN ENTERPRISE</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Pilihan Paket Hosting, Reseller, VPS &amp; Domain
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pilih paket spesifikasi yang sesuai untuk kebutuhan website Anda. Sistem otomatis menerbitkan akun hosting,
              konfigurasi DNS, serta tagihan invoice resmi dengan integrasi pembayaran instan.
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 shrink-0">
            <span className="text-xs font-semibold text-slate-300 px-2">Siklus Tagihan:</span>
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Tahunan</span>
                <span className="rounded-full bg-slate-950/80 text-amber-300 text-[9px] px-1.5 py-0.2">
                  Hemat 2 Bln
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveCategory('hosting')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'hosting'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Cloud Hosting NVMe</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('reseller')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'reseller'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Mitra Reseller Hosting</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('vps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'vps'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Dedicated Cloud VPS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('domain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'domain'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Daftar / Sewa Domain</span>
        </button>
      </div>

      {/* Tab 1: Cloud Hosting Plans */}
      {activeCategory === 'hosting' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hostingPlans.map(plan => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const period = billingCycle === 'yearly' ? '/ tahun' : '/ bulan';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? 'border-sky-500 bg-white shadow-xl ring-2 ring-sky-500/20 dark:bg-slate-900'
                    : 'border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-600 to-amber-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <Server className="h-5 w-5 text-sky-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatRupiah(price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{period}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                        Hemat 2 bulan dibanding bayar bulanan!
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {Object.values(plan.specs).map((spec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleStartOrder(plan)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      plan.popular
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25 active:scale-95'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Pilih Paket Cloud</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Reseller Plans */}
      {activeCategory === 'reseller' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resellerPlans.map(plan => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const period = billingCycle === 'yearly' ? '/ tahun' : '/ bulan';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? 'border-amber-500 bg-white shadow-xl ring-2 ring-amber-500/20 dark:bg-slate-900'
                    : 'border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatRupiah(price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{period}</span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {Object.values(plan.specs).map((spec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleStartOrder(plan)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md"
                  >
                    <span>Pilih Paket Reseller</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Cloud VPS */}
      {activeCategory === 'vps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {vpsPlans.map(plan => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const period = billingCycle === 'yearly' ? '/ tahun' : '/ bulan';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? 'border-sky-500 bg-white shadow-xl ring-2 ring-sky-500/20 dark:bg-slate-900'
                    : 'border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <Cpu className="h-5 w-5 text-sky-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatRupiah(price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{period}</span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {Object.values(plan.specs).map((spec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleStartOrder(plan)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20"
                  >
                    <span>Deploy Cloud VPS</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Domain Registration */}
      {activeCategory === 'domain' && (
        <div className="space-y-6">
          {/* Domain Search Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Cek Ketersediaan &amp; Sewa Nama Domain
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan nama domain yang Anda inginkan (misal: <code>bisnissaya.biz.id</code> atau <code>tokobaru.com</code>)
            </p>

            <form onSubmit={handleCheckDomain} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ketik nama domain impian Anda..."
                  value={domainName}
                  onChange={e => setDomainName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isDomainChecking}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDomainChecking ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>Mengecek...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Cek Domain</span>
                  </>
                )}
              </button>
            </form>

            {domainCheckStatus && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    {domainCheckStatus.message}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleStartOrder({
                      id: 'domain-only',
                      name: `Domain Registrasi (${domainName.trim()})`,
                      priceMonthly: 15000,
                      priceYearly: 15000,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Pilih Domain Ini
                </button>
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domainTlds.map(tld => (
              <div
                key={tld.tld}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-sky-300 transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {tld.tld}
                    </span>
                    <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                      Resmi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{tld.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatRupiah(tld.price)}
                    <span className="text-[10px] text-slate-400 font-normal">{tld.period}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDomainName(`namadomain${tld.tld}`);
                      setActiveCategory('domain');
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-500 cursor-pointer"
                  >
                    Pilih
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ORDER CHECKOUT MODAL ================= */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {orderSuccess ? (
              /* Success View */
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Layanan Berhasil Dipesan!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Akun hosting untuk domain <strong className="text-sky-600 font-mono">{orderSuccess.domain}</strong> telah dibuat.
                  Invoice tagihan resmi telah diterbitkan ke profil akun Anda.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 dark:border-slate-800 dark:bg-slate-950 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Invoice:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {orderSuccess.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Layanan:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {orderSuccess.planName}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Total Tagihan:</span>
                    <span className="font-mono text-base font-black text-sky-600">
                      {formatRupiah(orderSuccess.amount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={getWaPaymentConfirmLink(
                      orderSuccess.invoiceNumber,
                      orderSuccess.amount,
                      orderSuccess.domain,
                      orderSuccess.planName
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Konfirmasi Pembayaran via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      setOrderSuccess(null);
                      onNavigate?.('billing');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Lihat Faktur &amp; Pembayaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      setOrderSuccess(null);
                      onNavigate?.('cpanel-dashboard');
                    }}
                    className="w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Dashboard Pelanggan
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form View */
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-sky-600" />
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Konfirmasi Pemesanan Layanan
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Plan Summary Badge */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 dark:border-sky-900/50 dark:bg-sky-950/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-sky-950 dark:text-sky-200">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-xs text-sky-700 dark:text-sky-400">
                      Siklus:{' '}
                      <strong className="uppercase">
                        {billingCycle === 'yearly' ? 'Tahunan (Hemat 2 Bln)' : 'Bulanan'}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-sky-600">
                      {formatRupiah(
                        billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly
                      )}
                    </span>
                  </div>
                </div>

                {/* Domain Input Field */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Domain yang Ingin Digunakan:
                  </label>
                  <div className="flex items-center gap-3 text-xs mb-1">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={domainAction === 'new'}
                        onChange={() => setDomainAction('new')}
                        className="text-sky-600"
                      />
                      <span>Domain Baru</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={domainAction === 'existing'}
                        onChange={() => setDomainAction('existing')}
                        className="text-sky-600"
                      />
                      <span>Gunakan Domain Sendiri</span>
                    </label>
                  </div>

                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="contoh: websitebaru.biz.id"
                      value={domainName}
                      onChange={e => setDomainName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Jika belum memiliki domain, sistem akan membuatkan subdomain sementara otomatis.
                  </p>
                </div>

                {/* Customer Account Identity */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Diterbitkan Atas Nama Akun:
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {currentUser?.name} ({currentUser?.email})
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    No. WhatsApp: {currentUser?.phone || '+62 812-2673-8883'}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleProcessOrder}
                    className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-600/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="h-4 w-4 animate-spin" />
                        <span>Memproses Pesanan &amp; Faktur...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span>Konfirmasi &amp; Proses Pemesanan</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
