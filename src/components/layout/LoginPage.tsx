import React, { useState, useEffect, useRef } from 'react';
import { CloudProLogo } from '../common/CloudProLogo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/storage';
import { verifyTotpCode, EMERGENCY_RESCUE_CODE } from '../../services/totp';
import {
  ArrowRight,
  CheckCircle2,
  User as UserIcon,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Server,
  Network,
  Layers,
  Sparkles,
  RotateCcw,
  Smartphone,
  KeyRound,
  ChevronLeft,
  Timer,
  HelpCircle,
  Globe,
  Phone,
  Mail,
  Check,
  Zap,
  Users,
} from 'lucide-react';
import { User, HostingAccount, Invoice } from '../../types';

type PortalRole = 'admin' | 'reseller' | 'customer';

interface SavedRoleCredential {
  user: string;
  pass: string;
  updatedAt: string;
}

type DeviceSavedCredentialsMap = Partial<Record<PortalRole, SavedRoleCredential>>;

const DEVICE_CREDS_STORAGE_KEY = 'cloudpro_device_saved_creds_v1';
const DEVICE_LAST_ROLE_KEY = 'cloudpro_device_last_role_v1';

const readDeviceCredentials = (): DeviceSavedCredentialsMap => {
  try {
    const raw = localStorage.getItem(DEVICE_CREDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export type PortalLoginMode = 'server_admin' | 'client_portal';

interface LoginPageProps {
  onBackToLanding?: () => void;
  initialPortalMode?: PortalLoginMode;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToLanding,
  initialPortalMode,
}) => {
  const { login, check2FARequired } = useAuth();

  const [portalMode, setPortalMode] = useState<PortalLoginMode>(() => {
    if (initialPortalMode) return initialPortalMode;
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const sp = new URLSearchParams(window.location.search);
      const portalParam = sp.get('portal') || sp.get('mode');
      if (portalParam === 'client' || portalParam === 'reseller' || portalParam === 'customer') {
        return 'client_portal';
      }
      if (portalParam === 'admin' || portalParam === 'server') {
        return 'server_admin';
      }
      if (host === 'client.karsacloud.biz.id' || host.startsWith('client.')) {
        return 'client_portal';
      }
      if (host === 'server.karsacloud.biz.id' || host.startsWith('server.')) {
        return 'server_admin';
      }
    }
    return 'server_admin';
  });

  // Empty by default on a new device; auto-filled only if this device has logged in before
  const [username, setUsername] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cloudpro_saved_login_user');
      if (saved) return saved;
      const map = readDeviceCredentials();
      const anyUser = map.admin?.user || map.reseller?.user || map.customer?.user;
      return anyUser || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState<string>(() => {
    try {
      const savedPass = localStorage.getItem('cloudpro_saved_login_pass');
      if (savedPass) return savedPass;
      const map = readDeviceCredentials();
      const anyPass = map.admin?.pass || map.reseller?.pass || map.customer?.pass;
      return anyPass || '';
    } catch {
      return '';
    }
  });
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [isAutoFilledFromDevice, setIsAutoFilledFromDevice] = useState<boolean>(() => {
    try {
      return Boolean(
        localStorage.getItem('cloudpro_saved_login_user') ||
        localStorage.getItem(DEVICE_CREDS_STORAGE_KEY)
      );
    } catch {
      return false;
    }
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Self-Service Registration State for Clients
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPlanId, setRegPlanId] = useState<string>('plan-starter');
  const [regDomain, setRegDomain] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // 2FA TOTP Challenge State
  const [is2FAPending, setIs2FAPending] = useState<boolean>(false);
  const [totpCode, setTotpCode] = useState<string>('');
  const [pendingUser, setPendingUser] = useState<string>('');
  const [pendingRole, setPendingRole] = useState<PortalRole>('admin');
  const [pendingSecret, setPendingSecret] = useState<string>('KARSACLOUDSECRET23');
  const [pendingEmail, setPendingEmail] = useState<string>('admin@karsacloud.biz.id');
  const [totpError, setTotpError] = useState<string>('');
  const [showEmergencyHelp, setShowEmergencyHelp] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const totpInputRef = useRef<HTMLInputElement>(null);

  // Live countdown for TOTP 30-second window
  useEffect(() => {
    if (!is2FAPending) return;
    const updateCountdown = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      setSecondsRemaining(30 - (nowSec % 30));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    if (totpInputRef.current) {
      totpInputRef.current.focus();
    }
    return () => clearInterval(timer);
  }, [is2FAPending]);

  const handleClearDeviceMemory = () => {
    try {
      localStorage.removeItem('cloudpro_saved_login_user');
      localStorage.removeItem('cloudpro_saved_login_pass');
      localStorage.removeItem(DEVICE_CREDS_STORAGE_KEY);
      localStorage.removeItem(DEVICE_LAST_ROLE_KEY);
    } catch {}
    setUsername('');
    setPassword('');
    setIsAutoFilledFromDevice(false);
    setErrorMessage('');
    setIs2FAPending(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Silakan masukkan Username / Email dan Kata Sandi akun Anda terlebih dahulu.');
      return;
    }

    setErrorMessage('');

    // Auto-detect role directly from user data or username heuristics
    const lowerUser = cleanUser.toLowerCase();
    const allUsers = db.getUsers();
    const matchedUser = allUsers.find(
      u =>
        u.email.toLowerCase() === lowerUser ||
        u.name.toLowerCase() === lowerUser ||
        (u.username ? u.username.toLowerCase() === lowerUser : false) ||
        (['karsacloud', 'gridmaster', 'admin', 'root'].includes(lowerUser) && u.role === 'admin')
    );

    let detectedRole: PortalRole = 'customer';
    if (matchedUser) {
      detectedRole = matchedUser.role;
    } else if (
      lowerUser.includes('admin') ||
      lowerUser === 'karsacloud' ||
      lowerUser === 'root' ||
      lowerUser === 'gridmaster' ||
      lowerUser.endsWith('@karsacloud.biz.id')
    ) {
      detectedRole = 'admin';
    } else if (lowerUser.includes('reseller') || lowerUser.includes('mitra')) {
      detectedRole = 'reseller';
    } else {
      const allAccs = db.getHostingAccounts();
      const matchedAcc = allAccs.find(
        a =>
          a.username.toLowerCase() === lowerUser ||
          (a.customerEmail && a.customerEmail.toLowerCase() === lowerUser)
      );
      if (matchedAcc) {
        detectedRole = 'customer';
      }
    }

    // Strict isolation between server.karsacloud.biz.id (admin only) and client.karsacloud.biz.id (reseller/client only)
    if (portalMode === 'server_admin') {
      if (detectedRole !== 'admin') {
        setErrorMessage(
          'Akses Ditolak: Portal server.karsacloud.biz.id khusus untuk Root Administrator Server. Akun Anda terdeteksi sebagai Mitra Reseller / Klien cPanel. Silakan masuk melalui portal client.karsacloud.biz.id.'
        );
        return;
      }
    } else if (portalMode === 'client_portal') {
      if (detectedRole === 'admin') {
        setErrorMessage(
          'Akses Ditolak: Akun Anda adalah Root Administrator Server. Portal client.karsacloud.biz.id khusus untuk Mitra Reseller & Pelanggan cPanel. Silakan masuk melalui server.karsacloud.biz.id.'
        );
        return;
      }
    }

    // Save credentials on this device if requested
    try {
      if (rememberDevice) {
        localStorage.setItem('cloudpro_saved_login_user', cleanUser);
        localStorage.setItem('cloudpro_saved_login_pass', cleanPass);
        localStorage.setItem(DEVICE_LAST_ROLE_KEY, detectedRole);
        const map = readDeviceCredentials();
        map[detectedRole] = {
          user: cleanUser,
          pass: cleanPass,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(DEVICE_CREDS_STORAGE_KEY, JSON.stringify(map));
      } else {
        localStorage.removeItem('cloudpro_saved_login_user');
        localStorage.removeItem('cloudpro_saved_login_pass');
      }
    } catch {}

    // Check if 2FA is required for this role/account
    const twoFaCheck = check2FARequired(cleanUser, detectedRole);
    if (twoFaCheck.required) {
      setPendingUser(cleanUser);
      setPendingRole(detectedRole);
      setPendingSecret(twoFaCheck.secret);
      setPendingEmail(twoFaCheck.email);
      setTotpCode('');
      setTotpError('');
      setIs2FAPending(true);
      return;
    }

    login(cleanUser, detectedRole, false);
  };

  const handleTotpChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setTotpCode(cleaned);
    if (totpError) setTotpError('');

    // Auto-verify when all 6 digits are typed
    if (cleaned.length === 6) {
      const isValid = verifyTotpCode(cleaned, pendingSecret, pendingEmail);
      if (isValid) {
        setTimeout(() => {
          login(pendingUser, pendingRole, true);
        }, 120);
      } else {
        setTotpError(
          'Kode OTP tidak valid atau telah kedaluwarsa. Pastikan waktu di HP Anda akurat dan masukkan 6 digit terbaru dari Google Authenticator.'
        );
      }
    }
  };

  const handleVerify2FASubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = totpCode.trim().replace(/\s+/g, '');

    if (cleanCode.length !== 6) {
      setTotpError('Masukkan 6 digit kode dari aplikasi Google Authenticator.');
      return;
    }

    const isValid = verifyTotpCode(cleanCode, pendingSecret, pendingEmail);
    if (!isValid) {
      setTotpError(
        'Kode OTP tidak valid atau telah kedaluwarsa. Pastikan waktu di HP Anda akurat dan masukkan 6 digit terbaru dari Google Authenticator.'
      );
      return;
    }

    setTotpError('');
    login(pendingUser, pendingRole, true);
  };

  const handleCancel2FA = () => {
    setIs2FAPending(false);
    setTotpCode('');
    setTotpError('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Harap lengkapi Nama Lengkap, Alamat Email, dan Password Akun.');
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    const existingUsers = db.getUsers();
    if (existingUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      setErrorMessage('Email ini sudah terdaftar. Silakan beralih ke tab Masuk untuk login.');
      return;
    }

    setIsRegistering(true);
    setErrorMessage('');

    setTimeout(() => {
      const newUserId = `usr-cust-${Date.now()}`;
      const username =
        cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 14) ||
        `cust${Math.floor(100 + Math.random() * 899)}`;

      const newUser: User = {
        id: newUserId,
        name: regName.trim(),
        email: cleanEmail,
        username,
        role: 'customer',
        phone: regPhone.trim() || '+62 812-2673-8883',
        creditBalance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.saveUser(newUser);

      const planMap: Record<string, { name: string; price: number; disk: number }> = {
        'plan-starter': { name: 'Cloud Starter NVMe', price: 29000, disk: 5120 },
        'plan-pro': { name: 'Cloud Business PRO', price: 75000, disk: 25600 },
        'plan-enterprise': { name: 'Cloud Enterprise', price: 150000, disk: 102400 },
        'reseller-starter': { name: 'Reseller Lite Partner', price: 150000, disk: 51200 },
      };
      const chosen = planMap[regPlanId] || planMap['plan-starter'];
      const cleanDomain =
        regDomain.trim().toLowerCase().replace(/^(https?:\/\/)/, '') ||
        `${username}.karsacloud.biz.id`;

      const newAcc: HostingAccount = {
        id: `acc-cust-${Date.now()}`,
        primaryDomain: cleanDomain,
        domain: cleanDomain,
        username,
        customerId: newUserId,
        customerName: regName.trim(),
        customerEmail: cleanEmail,
        serverId: 'srv-id-01',
        serverName: 'ID-Cyber-01 (Jakarta)',
        planId: regPlanId,
        planName: chosen.name,
        diskUsedMb: 1,
        diskLimitMb: chosen.disk,
        bandwidthUsedMb: 10,
        bandwidthLimitMb: 102400,
        phpVersion: '8.2',
        phpExtensions: ['mysqli', 'pdo', 'curl', 'opcache', 'gd', 'mbstring', 'zip'],
        status: 'active',
        sslStatus: 'active',
        sslProvider: "Let's Encrypt",
        sslExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        forceHttps: true,
        documentRoot: `/home/${username}/public_html`,
        ipAddress: '172.67.223.133',
        databaseCount: 0,
        emailCount: 0,
        ftpCount: 1,
        nameservers: ['ns1.karsacloud.biz.id', 'ns2.karsacloud.biz.id'],
        createdAt: new Date().toISOString(),
      };
      db.saveHostingAccount(newAcc);

      const invId = `inv-${Date.now()}`;
      const invNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInv: Invoice = {
        id: invId,
        invoiceNumber: invNumber,
        userId: newUserId,
        userName: regName.trim(),
        userEmail: cleanEmail,
        userPhone: regPhone.trim() || '+62 812-2673-8883',
        amount: chosen.price,
        currency: 'IDR',
        status: 'unpaid',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Pendaftaran Baru: ${chosen.name} - Domain: ${cleanDomain}`,
        items: [
          {
            description: `Paket ${chosen.name} (Siklus Bulanan)`,
            qty: 1,
            unitPrice: chosen.price,
            amount: chosen.price,
          },
          {
            description: `Aktivasi Akun & AutoSSL Let's Encrypt (${cleanDomain})`,
            qty: 1,
            unitPrice: 0,
            amount: 0,
          },
        ],
      };
      db.saveInvoice(newInv);

      setIsRegistering(false);
      // Auto-login to Client Portal seamlessly
      login(cleanEmail, 'customer', true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7fc] via-[#f8fbff] to-[#eaf2fb] text-slate-800 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Modern High-End Cloud Ambient Lighting & Soft Mesh */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 select-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(14, 165, 233, 0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-sky-300/35 via-blue-200/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-200/40 via-indigo-200/20 to-transparent blur-3xl" />

      {/* ========================================================================= */}
      {/* ARTISTIC CLOUD WATERMARK (WATERMARK AWAN YANG INDAH & MODERN BERKELAS)    */}
      {/* ========================================================================= */}
      <div className="pointer-events-none select-none absolute inset-0 -z-0 flex items-center justify-center overflow-hidden opacity-60">
        <svg
          className="w-[980px] max-w-[140%] h-[580px] text-sky-400"
          viewBox="0 0 900 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="loginCloudWatermark1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="loginCloudWatermark2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path
            d="M 280 430 C 180 430 90 365 90 265 C 90 170 160 98 255 92 C 305 -2 438 -8 520 52 C 575 25 650 36 695 92 C 785 108 840 186 830 274 C 825 362 748 430 655 430 Z"
            fill="url(#loginCloudWatermark1)"
          />
          <path
            d="M 330 400 C 265 400 215 345 226 279 C 237 218 286 179 352 179 C 390 118 478 113 538 157 C 582 140 637 157 665 201 C 714 223 736 283 714 338 C 692 388 637 400 571 400 Z"
            fill="url(#loginCloudWatermark2)"
          />
          <path
            d="M 240 415 C 160 415 115 354 121 277 C 126 205 181 139 258 133 C 297 51 412 40 489 89 C 544 67 615 78 654 122 C 731 138 786 204 775 281 C 764 353 698 415 621 415"
            stroke="#0284c7"
            strokeWidth="2"
            strokeOpacity="0.22"
            strokeDasharray="10 8"
            fill="none"
          />
          <path
            d="M 160 310 C 215 299 270 321 325 304 C 380 288 435 255 501 260 C 567 266 622 299 688 288 C 743 277 787 244 831 233"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeOpacity="0.32"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* ================= ICONIC BRAND HEADER (OUTSIDE THE FRAME) ================= */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-5xl relative z-10 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 sm:px-2">
        <CloudProLogo
          variant="full"
          size="lg"
          cloudTextColor="text-slate-900"
          showSubtitle={true}
          subtitleText="KARSA CLOUD PRO INFRASTRUCTURE & PANEL"
          noTruncate={true}
        />

        {/* Live SLA & Global Cluster Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-white/90 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] font-bold text-emerald-700 shadow-md shadow-emerald-950/5 backdrop-blur-md shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>SLA 99.99% HIGH AVAILABILITY</span>
        </div>
      </div>

      <div className="w-full max-w-md sm:max-w-xl lg:max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white/90 backdrop-blur-2xl border border-sky-100/90 shadow-2xl shadow-sky-950/10 overflow-hidden">
        {/* ================= LEFT COLUMN: EXECUTIVE INFRASTRUCTURE SHOWCASE (Desktop / Large Tablet Only) ================= */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 lg:p-10 border-r border-sky-900/40 bg-gradient-to-br from-[#0c1e36] via-[#102a4c] to-[#0a192f] text-white relative overflow-hidden">
          {/* Subtle Internal Cloud Watermark Accent */}
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <svg
            className="pointer-events-none absolute bottom-0 right-0 w-72 h-52 text-sky-400/15"
            viewBox="0 0 260 180"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 75 145 C 45 145 20 125 20 95 C 20 67 42 45 70 43 C 85 15 125 12 150 30 C 167 21 190 25 203 42 C 230 47 245 71 242 98 C 240 125 217 145 190 145 Z"
              fill="#38bdf8"
              fillOpacity="0.08"
            />
          </svg>

          <div className="space-y-6 relative z-10">
            {/* Executive Value Proposition */}
            <div className="space-y-3 pt-1">
              <div className="inline-flex items-center gap-2 rounded-lg border border-sky-400/30 bg-sky-500/15 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-sky-300">
                <ShieldCheck className="h-4 w-4 text-sky-300" />
                <span>Multi-Tier Cloud &amp; Bare-Metal Control Plane</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-white leading-snug">
                Manajemen Server, KVM Hypervisor, &amp; Web Hosting Terpadu Karsa Cloud PRO.
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed max-w-xl">
                Dirancang dengan arsitektur isolasi multi-tenant (Root Admin, WHM Reseller, dan
                cPanel Klien), integrasi penuh Cloudflare Wildcard Tunnel, IPv6 DDNS, dan penyimpanan
                NVMe berkecepatan tinggi.
              </p>
            </div>

            {/* 3 Architectural Pillars */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              <div className="flex items-start gap-3.5 rounded-2xl border border-sky-800/40 bg-white/[0.04] p-3.5 backdrop-blur-md hover:bg-white/[0.08] transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/20 text-sky-300">
                  <Server className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Cluster Server Nodes &amp; KVM Cloud VPS
                  </h3>
                  <p className="mt-0.5 text-[11px] text-sky-100/70 leading-relaxed">
                    Pemantauan daemon systemd realtime, terminal SSH langsung, dan orkestrasi virtual
                    machine Linux.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-sky-800/40 bg-white/[0.04] p-3.5 backdrop-blur-md hover:bg-white/[0.08] transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/20 text-sky-300">
                  <Network className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Wildcard Cloudflare Tunnel &amp; Tailscale Mesh VPN
                  </h3>
                  <p className="mt-0.5 text-[11px] text-sky-100/70 leading-relaxed">
                    Routing domain/subdomain otomatis tanpa port-forwarding serta sinkronisasi
                    pembaruan GitHub 1-klik.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-sky-800/40 bg-white/[0.04] p-3.5 backdrop-blur-md hover:bg-white/[0.08] transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/20 text-sky-300">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Multi-Tenant WHM Reseller &amp; cPanel Web Suite
                  </h3>
                  <p className="mt-0.5 text-[11px] text-sky-100/70 leading-relaxed">
                    File Manager, Auto-Cloner, MySQL/phpMyAdmin, AutoSSL Let&apos;s Encrypt, dan
                    Billing Kwitansi resmi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Cluster Telemetry Strip */}
          <div className="mt-6 pt-4 border-t border-sky-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-sky-200/70 relative z-10">
            <span>Gateway: ZeroSSL TLS 1.3 &bull; HTTP/3 QUIC</span>
            <span className="text-sky-300 font-semibold">Karsa Cloud PRO v2.6</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AUTHENTICATION VAULT (Streamlined for Mobile/Android & Full on Desktop) ================= */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-7 lg:p-10 bg-white/95 backdrop-blur-2xl">
          <div>
            {is2FAPending ? (
              /* ================= 2FA AUTHENTICATOR CHALLENGE SCREEN ================= */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCancel2FA}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Login</span>
                  </button>
                  <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="h-3 w-3" />
                    2FA WAJIB
                  </span>
                </div>

                <div className="text-center pt-1 space-y-1.5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 shadow-lg shadow-sky-500/10">
                    <Smartphone className="h-7 w-7" />
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Verifikasi Google Authenticator
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    Masukkan 6 digit kode OTP dari ponsel Anda untuk akun{' '}
                    <strong className="text-sky-700 font-mono">{pendingUser}</strong>
                  </p>
                </div>

                {totpError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{totpError}</span>
                  </div>
                )}

                <form onSubmit={handleVerify2FASubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-center text-xs font-semibold text-slate-700 mb-2">
                      6 Digit Kode Keamanan (OTP)
                    </label>
                    <div className="relative">
                      <input
                        ref={totpInputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus
                        placeholder="••••••"
                        value={totpCode}
                        onChange={e => handleTotpChange(e.target.value)}
                        className="w-full rounded-2xl border-2 border-sky-400 bg-sky-50/40 px-4 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 focus:outline-hidden transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Live TOTP 30s Window Indicator */}
                  <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-500">
                    <div className="flex items-center gap-1.5 text-sky-700 font-medium">
                      <Timer className="h-3.5 w-3.5 animate-spin" />
                      <span>Siklus kode: {secondsRemaining} dtk</span>
                    </div>
                    <span className="text-slate-400">Google Authenticator</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:via-sky-500 hover:to-blue-500 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Verifikasi &amp; Masuk Portal</span>
                  </button>
                </form>

                {/* Emergency Recovery Rescue Code Helper */}
                <div className="pt-2 border-t border-sky-100 text-center">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyHelp(prev => !prev)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Ponsel hilang / kendala OTP? Opsi Darurat</span>
                  </button>

                  {showEmergencyHelp && (
                    <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-[11px] text-amber-900 space-y-2 shadow-2xs">
                      <div className="font-bold flex items-center gap-1 text-amber-800">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Master Emergency Rescue Token</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Jika waktu di ponsel Anda tidak sinkron, masukkan kode pemulihan darurat master:{' '}
                        <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold text-amber-800">
                          {EMERGENCY_RESCUE_CODE}
                        </code>{' '}
                        atau klik tombol login darurat di bawah ini:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTotpCode(EMERGENCY_RESCUE_CODE);
                          setTotpError('');
                          setTimeout(() => {
                            login(pendingUser, pendingRole, true);
                          }, 100);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Masuk Sekarang Pakai Kode Darurat ({EMERGENCY_RESCUE_CODE})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ================= STANDARD CREDENTIALS FORM ================= */
              <>
                {/* Prominent 2-Segmented Portal Switcher: Admin Server vs Klien/Reseller */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/90 mb-4 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPortalMode('server_admin');
                      setAuthTab('login');
                      setErrorMessage('');
                      if (!username || username === 'pelanggan' || username === 'denbaguse') {
                        setUsername('admin');
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      portalMode === 'server_admin'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Server className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Admin Server (server.)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPortalMode('client_portal');
                      setAuthTab('login');
                      setErrorMessage('');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      portalMode === 'client_portal'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Klien &amp; Reseller (client.)</span>
                  </button>
                </div>

                {/* Portal Mode Header Badge & Title */}
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-900 tracking-tight">
                    {portalMode === 'server_admin'
                      ? 'Login Admin Server'
                      : authTab === 'register'
                      ? 'Registrasi Akun Klien Baru'
                      : 'Login Klien & Reseller'}
                  </h2>
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                      portalMode === 'server_admin'
                        ? 'border-sky-300 bg-sky-50 text-sky-800'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {portalMode === 'server_admin'
                      ? 'server.karsacloud.biz.id'
                      : 'client.karsacloud.biz.id'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mb-3">
                  {portalMode === 'server_admin'
                    ? 'Akses khusus Administrator Sistem. Masukkan kredensial Anda untuk mengelola infrastruktur cluster.'
                    : authTab === 'register'
                    ? 'Pendaftaran akun baru instan. Pilih paket cloud hosting dan nikmati aktivasi otomatis beserta faktur resmi.'
                    : 'Akses resmi Mitra Reseller WHM & Pelanggan cPanel. Sistem mengarahkan otomatis sesuai hak akses akun Anda.'}
                </p>

                {/* Client Mode Dual Tab: Masuk vs Registrasi */}
                {portalMode === 'client_portal' && (
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-sky-100/70 rounded-xl border border-sky-200/70 mb-3.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setErrorMessage('');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        authTab === 'login'
                          ? 'bg-white text-sky-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Masuk Akun
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('register');
                        setErrorMessage('');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        authTab === 'register'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Registrasi Akun</span>
                      <span className="rounded-full bg-emerald-400/20 text-emerald-100 text-[9px] px-1.5 py-0.2">
                        Instan
                      </span>
                    </button>
                  </div>
                )}

                {/* Smart Device Auto-Fill Status Banner (Only for login tab) */}
                {authTab === 'login' && isAutoFilledFromDevice && (
                  <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50/90 px-3 py-1.5 sm:py-2 text-[10.5px] sm:text-[11px] text-sky-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span className="truncate font-medium">
                        Perangkat Terverifikasi &bull; Akses Cepat Aktif
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearDeviceMemory}
                      className="inline-flex items-center gap-1 shrink-0 font-mono text-[9.5px] sm:text-[10px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus data sesi tersimpan"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 sm:p-3 text-[11px] sm:text-xs text-rose-800 space-y-2 shadow-2xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                    {errorMessage.includes('client.karsacloud.biz.id') && (
                      <button
                        type="button"
                        onClick={() => {
                          setPortalMode('client_portal');
                          setErrorMessage('');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <span>Akses Portal Klien &amp; Reseller</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {errorMessage.includes('server.karsacloud.biz.id') && (
                      <button
                        type="button"
                        onClick={() => {
                          setPortalMode('server_admin');
                          setErrorMessage('');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <span>Akses Panel Admin Server</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {authTab === 'register' && portalMode === 'client_portal' ? (
                  /* ================= SELF-SERVICE CLIENT REGISTRATION FORM ================= */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap Anda
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Nama lengkap atau nama bisnis Anda..."
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                        Alamat Email Aktif
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="contoh@gmail.com (untuk notifikasi invoice & login)"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                          No. WhatsApp Aktif
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                            <Phone className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="0812xxxxxxx"
                            value={regPhone}
                            onChange={e => setRegPhone(e.target.value)}
                            className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                          Kata Sandi Akun
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            type="password"
                            required
                            placeholder="Buat kata sandi..."
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                        Pilihan Paket Layanan Awal
                      </label>
                      <select
                        value={regPlanId}
                        onChange={e => setRegPlanId(e.target.value)}
                        className="w-full rounded-xl border border-sky-200/90 bg-white/90 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                      >
                        <option value="plan-starter">Cloud Starter NVMe (5GB) - Rp 29.000 / bln</option>
                        <option value="plan-pro">Cloud Business PRO (25GB) - Rp 75.000 / bln</option>
                        <option value="plan-enterprise">Cloud Enterprise (100GB) - Rp 150.000 / bln</option>
                        <option value="reseller-starter">Reseller Lite Partner (50GB) - Rp 150.000 / bln</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                        Domain yang Ingin Digunakan (Opsional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                          <Globe className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="contoh: tokosaya.biz.id (kosongkan jika belum ada)"
                          value={regDomain}
                          onChange={e => setRegDomain(e.target.value)}
                          className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <>
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Memproses Registrasi Akun...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 text-amber-300" />
                          <span>Registrasi &amp; Aktivasi Layanan</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setAuthTab('login')}
                        className="text-[11px] text-slate-600 hover:text-sky-600 cursor-pointer"
                      >
                        Sudah memiliki akun? <strong>Masuk di sini</strong>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ================= LOGIN FORM ================= */

                <form onSubmit={handleLoginSubmit} autoComplete="on" className="space-y-3 sm:space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700">
                        Username / Email Akun
                      </label>
                      <span className="font-mono text-[9px] sm:text-[10px] text-slate-500">
                        Admin / Reseller / Klien
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        placeholder="Username atau email akun Anda..."
                        value={username}
                        onChange={e => {
                          setUsername(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi Keamanan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi..."
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className="w-full rounded-xl border border-sky-200/90 bg-white/90 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-hidden transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Device Auto-Fill Toggle */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="inline-flex items-center gap-2 text-[10.5px] sm:text-[11px] text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={e => setRememberDevice(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-sky-300 bg-white text-sky-600 focus:ring-sky-500/30 cursor-pointer"
                      />
                      <span>Simpan &amp; isi otomatis di perangkat ini</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:via-sky-500 hover:to-blue-500 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <span>
                      {portalMode === 'server_admin'
                        ? 'Akses Panel Admin Server'
                        : 'Akses Portal Klien & Reseller'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {onBackToLanding && (
                    <button
                      type="button"
                      onClick={onBackToLanding}
                      className="w-full mt-2.5 py-2 px-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-900 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Globe className="h-3.5 w-3.5 text-sky-600" />
                      <span>Portal Utama (karsacloud.biz.id)</span>
                    </button>
                  )}
                </form>
                )}
              </>
            )}
          </div>

          {/* Executive Security & Infrastructure Telemetry Footer */}
          <div className="mt-4 sm:mt-5 space-y-2 text-center">
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-2 sm:p-2.5 text-[10px] sm:text-[10.5px] text-slate-600 flex items-center justify-center gap-2 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Sesi login aman terenkripsi &bull; TLS 1.3 HTTP/3 &bull; Auto-Recall</span>
            </div>

            <div className="text-[10px] sm:text-[11px] text-slate-500">
              &copy; {new Date().getFullYear()}{' '}
              <strong className="text-slate-700 font-semibold">Karsa Cloud PRO</strong>. Seluruh hak cipta dilindungi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
