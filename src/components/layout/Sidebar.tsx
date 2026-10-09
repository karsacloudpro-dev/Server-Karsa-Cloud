import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Server,
  Users,
  HardDrive,
  Layers,
  Shield,
  CreditCard,
  Code2,
  FolderOpen,
  Database,
  Mail,
  Globe,
  Lock,
  Cpu,
  Clock,
  Archive,
  Palette,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Cloud,
  Network,
  Sparkles,
  Terminal,
  Search,
  X,
  ChevronsUpDown,
  Trash2,
  RotateCcw,
  Activity,
  Zap,
  GitBranch,
  ShieldCheck,
  ShoppingBag,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import { CloudProLogo } from '../common/CloudProLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenSummaryPage?: () => void;
}

interface NavMenuItem {
  id: string;
  label: string;
  aliases?: string[];
  icon: React.ComponentType<{ className?: string }>;
  externalHref?: string;
  badge?: {
    text: string;
  };
}

interface NavMenuGroup {
  key: string;
  title: string;
  items: NavMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  onOpenSummaryPage,
}) => {
  const { currentUser, currentResellerProfile, switchRole, logout, authenticatedRole } = useAuth();
  const { servers } = useServer();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [commitHash, setCommitHash] = useState<string>('dc4bca9');

  useEffect(() => {
    const fetchCommit = () => {
      fetch('/api/system/git-commit-info')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.ok && data.local?.shortHash) {
            setCommitHash(data.local.shortHash);
          }
        })
        .catch(() => {});
    };

    fetchCommit();
    const interval = setInterval(fetchCommit, 20000);
    window.addEventListener('git-commit-synced', fetchCommit);
    window.addEventListener('focus', fetchCommit);
    return () => {
      clearInterval(interval);
      window.removeEventListener('git-commit-synced', fetchCommit);
      window.removeEventListener('focus', fetchCommit);
    };
  }, []);

  // Group expand/collapse states (Consolidated into 6 clean suites)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    // Admin Suites
    admin_infra: true,
    admin_network_cloud: true,
    admin_hosting_domains: true,
    admin_apps_storage: true,
    admin_storage_backup: true,
    admin_client_finance: true,
    // Reseller Suites
    reseller_portal: true,
    reseller_hosting_domains: true,
    reseller_apps: true,
    reseller_storage_backup: true,
    reseller_finance: true,
    // Customer Suites
    customer_overview: true,
    customer_domains: true,
    customer_apps: true,
    customer_storage_billing: true,
  });

  const adminGroups: NavMenuGroup[] = useMemo(
    () => [
      {
        key: 'admin_infra',
        title: 'Web Panel & Cluster Node',
        items: [
          {
            id: 'web-panel-server',
            label: 'Web Panel Server',
            icon: ShieldCheck,
            badge: {
              text: '2FA',
            },
          },
          {
            id: 'dashboard',
            aliases: ['admin-dashboard'],
            label: 'Cluster Overview',
            icon: LayoutDashboard,
          },
          {
            id: 'servers',
            label: 'Server Nodes & Daemon',
            icon: Server,
          },
          {
            id: 'ssh-direct',
            label: 'Web Terminal (SSH)',
            icon: Terminal,
            externalHref: '/ssh',
            badge: {
              text: 'SSH',
            },
          },
          {
            id: 'architecture',
            label: 'Arsitektur Sistem',
            icon: Layers,
          },
        ],
      },
      {
        key: 'admin_network_cloud',
        title: 'Jaringan & Cloud VPS',
        items: [
          {
            id: 'vps',
            label: 'Kelola VPS Cloud (KVM)',
            icon: Cpu,
          },
          {
            id: 'gateway-tunnel',
            label: 'CF Tunnel & IPv6 DDNS',
            icon: Network,
          },
          {
            id: 'tailscale-mesh',
            label: 'Tailscale Mesh & SSH',
            icon: Network,
          },
          {
            id: 'ip-manager',
            label: 'Dedicated IP & Pool',
            icon: Globe,
          },
          {
            id: 'dns-zones',
            aliases: ['cpanel-dns'],
            label: 'DNS Zone Editor',
            icon: Globe,
          },
          {
            id: 'nameservers',
            aliases: ['dns-manager', 'private-ns'],
            label: 'Private Nameserver',
            icon: Server,
          },
        ],
      },
      {
        key: 'admin_hosting_domains',
        title: 'Hosting & Domain Suite',
        items: [
          {
            id: 'server-domains',
            aliases: ['core-domains', 'infra-domains'],
            label: 'Domain Server Utama',
            icon: ShieldCheck,
            badge: {
              text: 'CORE',
            },
          },
          {
            id: 'accounts',
            aliases: ['hosting-accounts', 'hosting'],
            label: 'Akun Hosting (vHosts)',
            icon: Globe,
          },
          {
            id: 'domains',
            aliases: ['cpanel-domains', 'subdomains', 'client-domains'],
            label: 'Domain Klien & Reseller',
            icon: Globe,
          },
          {
            id: 'ssl',
            aliases: ['cpanel-ssl'],
            label: "SSL & Let's Encrypt",
            icon: Lock,
          },
        ],
      },
      {
        key: 'admin_apps_storage',
        title: 'Berkas, Database & Engine',
        items: [
          {
            id: 'file-manager',
            aliases: ['cpanel-files', 'files'],
            label: 'File Manager',
            icon: FolderOpen,
          },
          {
            id: 'website-cloner',
            aliases: ['cloner'],
            label: 'Kloning Website (1-Click)',
            icon: Sparkles,
          },
          {
            id: 'databases',
            aliases: ['cpanel-database'],
            label: 'Basis Data MySQL (phpMyAdmin)',
            icon: Database,
          },
          {
            id: 'php-selector',
            aliases: ['cpanel-php', 'php'],
            label: 'PHP Selector & Versi',
            icon: Cpu,
          },
          {
            id: 'media-storage',
            aliases: ['cpanel-media', 'media'],
            label: 'Cloudflare R2 & Media',
            icon: Cloud,
          },
          {
            id: 'cron-jobs',
            aliases: ['cpanel-cron', 'cron'],
            label: 'Cron Jobs Otomasi',
            icon: Clock,
          },
          {
            id: 'emails',
            aliases: ['cpanel-email'],
            label: 'Email & Webmail',
            icon: Mail,
          },
        ],
      },
      {
        key: 'admin_storage_backup',
        title: 'Penyimpanan & Cadangan',
        items: [
          {
            id: 'disk-usage',
            aliases: ['cpanel-disk'],
            label: 'Disk Usage & Analisa',
            icon: HardDrive,
          },
          {
            id: 'disk-cleaner',
            aliases: ['cleaner', 'cpanel-cleaner', 'cpanel-disk-cleaner'],
            label: 'Disk Cleaner (Pembersih)',
            icon: Trash2,
          },
          {
            id: 'backups',
            aliases: ['backup', 'cpanel-backup', 'cpanel-backups'],
            label: 'Backup Website (.ZIP)',
            icon: Archive,
            badge: {
              text: '.ZIP',
            },
          },
          {
            id: 'restore',
            aliases: ['cpanel-restore', 'restore-manager'],
            label: 'Restore & Pulihkan Data',
            icon: RotateCcw,
          },
        ],
      },
      {
        key: 'admin_client_finance',
        title: 'Klien, Keuangan & Keamanan',
        items: [
          {
            id: 'resellers',
            label: 'Mitra Reseller',
            icon: Users,
          },
          {
            id: 'customers',
            label: 'Semua Pelanggan',
            icon: Users,
          },
          {
            id: 'plans',
            aliases: ['packages'],
            label: 'Paket Hosting Global',
            icon: Layers,
          },
          {
            id: 'billing',
            aliases: ['invoices'],
            label: 'Billing & Invoices',
            icon: CreditCard,
          },
          {
            id: 'tickets',
            aliases: ['support', 'helpdesk', 'tiket'],
            label: 'Support Tickets',
            icon: LifeBuoy,
            badge: { text: '24/7' },
          },
          {
            id: 'security',
            label: 'Firewall & Security',
            icon: Shield,
          },
          {
            id: 'whitelabel',
            aliases: ['branding'],
            label: 'White-Label Settings',
            icon: Palette,
          },
          {
            id: 'api-explorer',
            aliases: ['api-docs', 'api'],
            label: 'REST API & Webhooks',
            icon: Code2,
          },
        ],
      },
    ],
    []
  );

  const resellerGroups: NavMenuGroup[] = useMemo(
    () => [
      {
        key: 'reseller_portal',
        title: 'Portal Reseller',
        items: [
          {
            id: 'reseller-dashboard',
            label: 'Dashboard Kuota',
            icon: LayoutDashboard,
          },
          {
            id: 'order-service',
            aliases: ['client-catalog', 'order-new', 'store'],
            label: 'Katalog & Alokasi Kuota',
            icon: ShoppingBag,
            badge: {
              text: 'Katalog',
            },
          },
          {
            id: 'customers',
            label: 'Pelanggan Saya',
            icon: Users,
          },
          {
            id: 'plans',
            aliases: ['packages'],
            label: 'Paket Hosting Sendiri',
            icon: Layers,
          },
          {
            id: 'vps',
            label: 'Cloud VPS Instances',
            icon: Cpu,
          },
        ],
      },
      {
        key: 'reseller_hosting_domains',
        title: 'Hosting & Domain',
        items: [
          {
            id: 'accounts',
            aliases: ['hosting-accounts'],
            label: 'Akun Hosting (vHosts)',
            icon: Globe,
          },
          {
            id: 'domains',
            aliases: ['cpanel-domains', 'subdomains'],
            label: 'Domain & Subdomain',
            icon: Globe,
          },
          {
            id: 'ssl',
            aliases: ['cpanel-ssl'],
            label: "SSL Let's Encrypt",
            icon: Lock,
          },
          {
            id: 'dns-zones',
            aliases: ['cpanel-dns'],
            label: 'DNS Zone Editor',
            icon: Globe,
          },
          {
            id: 'nameservers',
            aliases: ['dns-manager'],
            label: 'Private Nameserver (NS)',
            icon: Server,
          },
        ],
      },
      {
        key: 'reseller_apps',
        title: 'Berkas, Database & Aplikasi',
        items: [
          {
            id: 'file-manager',
            aliases: ['cpanel-files'],
            label: 'File Manager',
            icon: FolderOpen,
          },
          {
            id: 'website-cloner',
            aliases: ['cloner'],
            label: 'Kloning Website (1-Click)',
            icon: Sparkles,
          },
          {
            id: 'databases',
            aliases: ['cpanel-database'],
            label: 'MySQL & phpMyAdmin',
            icon: Database,
          },
          {
            id: 'php-selector',
            aliases: ['cpanel-php'],
            label: 'PHP Selector & Versi',
            icon: Cpu,
          },
          {
            id: 'media-storage',
            aliases: ['cpanel-media'],
            label: 'Cloudflare R2 & Media',
            icon: Cloud,
            badge: {
              text: 'R2',
            },
          },
          {
            id: 'cron-jobs',
            aliases: ['cpanel-cron'],
            label: 'Cron Jobs Otomasi',
            icon: Clock,
          },
          {
            id: 'emails',
            aliases: ['cpanel-email'],
            label: 'Email & Webmail',
            icon: Mail,
          },
        ],
      },
      {
        key: 'reseller_storage_backup',
        title: 'Penyimpanan & Cadangan',
        items: [
          {
            id: 'disk-usage',
            aliases: ['cpanel-disk'],
            label: 'Disk Usage & Analisa',
            icon: HardDrive,
          },
          {
            id: 'disk-cleaner',
            aliases: ['cleaner', 'cpanel-cleaner'],
            label: 'Disk Cleaner (Pembersih)',
            icon: Trash2,
          },
          {
            id: 'backups',
            aliases: ['backup', 'cpanel-backup', 'cpanel-backups'],
            label: 'Backup Website (.ZIP)',
            icon: Archive,
          },
          {
            id: 'restore',
            aliases: ['cpanel-restore'],
            label: 'Restore & Pulihkan Data',
            icon: RotateCcw,
          },
        ],
      },
      {
        key: 'reseller_finance',
        title: 'Branding & Keuangan',
        items: [
          {
            id: 'whitelabel',
            aliases: ['branding'],
            label: 'White-Label Branding',
            icon: Palette,
          },
          {
            id: 'billing',
            aliases: ['invoices'],
            label: 'Billing & Invoice',
            icon: CreditCard,
          },
          {
            id: 'tickets',
            aliases: ['support', 'helpdesk', 'tiket'],
            label: 'Support Tickets',
            icon: LifeBuoy,
            badge: { text: '24/7' },
          },
          {
            id: 'security',
            label: 'Aktivitas & Keamanan',
            icon: Shield,
          },
        ],
      },
    ],
    []
  );

  const customerGroups: NavMenuGroup[] = useMemo(
    () => [
      {
        key: 'customer_overview',
        title: 'Ringkasan & Cloud',
        items: [
          {
            id: 'cpanel-dashboard',
            aliases: ['customer-dashboard'],
            label: 'Ringkasan Akun',
            icon: LayoutDashboard,
          },
          {
            id: 'order-service',
            aliases: ['client-catalog', 'order-new', 'store'],
            label: 'Katalog Produk & Layanan',
            icon: ShoppingBag,
            badge: {
              text: 'Katalog',
            },
          },
          {
            id: 'vps',
            label: 'Dedicated VPS Cloud',
            icon: Cpu,
          },
        ],
      },
      {
        key: 'customer_domains',
        title: 'Domain, SSL & DNS',
        items: [
          {
            id: 'domains',
            aliases: ['cpanel-domains', 'subdomains'],
            label: 'Domain & Subdomain',
            icon: Globe,
          },
          {
            id: 'ssl',
            aliases: ['cpanel-ssl'],
            label: "SSL Let's Encrypt",
            icon: Lock,
          },
          {
            id: 'dns-zones',
            aliases: ['cpanel-dns'],
            label: 'DNS Zone Editor',
            icon: Globe,
          },
        ],
      },
      {
        key: 'customer_apps',
        title: 'Berkas, Basis Data & Engine',
        items: [
          {
            id: 'file-manager',
            aliases: ['cpanel-files'],
            label: 'File Manager',
            icon: FolderOpen,
          },
          {
            id: 'website-cloner',
            aliases: ['cloner'],
            label: 'Kloning & Deploy Web',
            icon: Sparkles,
          },
          {
            id: 'databases',
            aliases: ['cpanel-database'],
            label: 'Basis Data MySQL',
            icon: Database,
          },
          {
            id: 'media-storage',
            aliases: ['cpanel-media'],
            label: 'Media & Cloudflare R2',
            icon: Cloud,
          },
          {
            id: 'php-selector',
            aliases: ['cpanel-php'],
            label: 'PHP Selector & Ext',
            icon: Cpu,
          },
          {
            id: 'cron-jobs',
            aliases: ['cpanel-cron'],
            label: 'Cron Jobs Otomasi',
            icon: Clock,
          },
          {
            id: 'emails',
            aliases: ['cpanel-email'],
            label: 'Email & Webmail',
            icon: Mail,
          },
        ],
      },
      {
        key: 'customer_storage_billing',
        title: 'Penyimpanan & Tagihan',
        items: [
          {
            id: 'disk-usage',
            aliases: ['cpanel-disk'],
            label: 'Disk Usage & Analisa',
            icon: HardDrive,
          },
          {
            id: 'disk-cleaner',
            aliases: ['cleaner', 'cpanel-cleaner'],
            label: 'Disk Cleaner (Pembersih)',
            icon: Trash2,
          },
          {
            id: 'backups',
            aliases: ['backup', 'cpanel-backup', 'cpanel-backups'],
            label: 'Backup Website (.ZIP)',
            icon: Archive,
          },
          {
            id: 'restore',
            aliases: ['cpanel-restore'],
            label: 'Restore & Pulihkan Data',
            icon: RotateCcw,
          },
          {
            id: 'billing',
            aliases: ['invoices'],
            label: 'Tagihan & Invoicing',
            icon: CreditCard,
          },
          {
            id: 'tickets',
            aliases: ['support', 'helpdesk', 'tiket'],
            label: 'Tiket Bantuan (Support)',
            icon: LifeBuoy,
            badge: { text: '24/7' },
          },
          {
            id: 'security',
            label: 'Audit Keamanan Akun',
            icon: Shield,
          },
        ],
      },
    ],
    []
  );

  const activeRoleGroups = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return adminGroups;
    if (currentUser.role === 'reseller') return resellerGroups;
    return customerGroups;
  }, [currentUser?.role, adminGroups, resellerGroups, customerGroups]);

  const isTabActive = (tabId: string, aliases: string[] = []) => {
    return currentTab === tabId || aliases.includes(currentTab);
  };

  // Automatically expand group containing active tab
  useEffect(() => {
    for (const grp of activeRoleGroups) {
      if (grp.items.some(item => isTabActive(item.id, item.aliases))) {
        setOpenSections(prev => (prev[grp.key] ? prev : { ...prev, [grp.key]: true }));
        break;
      }
    }
  }, [currentTab, currentUser?.role]);

  // Global keyboard shortcut: Ctrl+K or '/' focuses search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Lock body scroll ONLY on mobile drawer (<1024px)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isOpen && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isOpen]);

  // Close mobile sidebar with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCloseMobile]);

  if (!currentUser) return null;

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const areAllCurrentGroupsOpen = activeRoleGroups.every(g => openSections[g.key]);
  const toggleAllGroups = () => {
    const nextState = !areAllCurrentGroupsOpen;
    const updated: Record<string, boolean> = { ...openSections };
    activeRoleGroups.forEach(g => {
      updated[g.key] = nextState;
    });
    setOpenSections(updated);
  };

  // White-label dynamic branding
  const brandName = currentResellerProfile?.brandName || 'Karsa Cloud PRO';
  const themeColor = currentResellerProfile?.themeColor || '#0284c7';
  const panelDomain = currentResellerProfile?.panelDomain || 'panel.karsacloud.id';

  const handleNav = (tabId: string) => {
    if (tabId === 'web-panel-server' || tabId === 'web-panel' || tabId === 'summary') {
      if (onOpenSummaryPage) {
        onOpenSummaryPage();
      } else {
        onSelectTab(tabId);
      }
      onCloseMobile();
      return;
    }
    onSelectTab(tabId);
    onCloseMobile();
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredGroups = activeRoleGroups
    .map(group => {
      if (!normalizedQuery) return group;
      const matchingItems = group.items.filter(
        item =>
          item.label.toLowerCase().includes(normalizedQuery) ||
          group.title.toLowerCase().includes(normalizedQuery)
      );
      return { ...group, items: matchingItems };
    })
    .filter(group => group.items.length > 0);

  const primaryServer = servers && servers.length > 0 ? servers[0] : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-xs lg:hidden cursor-pointer"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[100] flex h-dvh max-h-dvh w-72 flex-col border-r border-sky-200/80 bg-gradient-to-b from-[#ffffff] via-[#f1f7fe] to-[#e6f2fc] text-slate-700 shadow-xl shadow-sky-950/5 transition-transform duration-300 ease-in-out lg:w-64 lg:translate-x-0 overflow-hidden backdrop-blur-2xl ${
          isOpen
            ? 'translate-x-0 pointer-events-auto'
            : '-translate-x-full pointer-events-none lg:translate-x-0 lg:pointer-events-auto'
        }`}
      >
        {/* ========================================================================= */}
        {/* MODERN ARTISTIC CLOUD WATERMARK (WATERMARK AWAN YANG INDAH & MODERN)     */}
        {/* ========================================================================= */}
        <div className="pointer-events-none select-none absolute inset-0 -z-0 overflow-hidden opacity-60">
          {/* Atmospheric Soft Radiant Cloud Lights */}
          <div className="absolute top-12 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200/40 via-sky-300/20 to-transparent blur-2xl" />
          <div className="absolute top-1/2 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-200/30 via-indigo-100/20 to-transparent blur-3xl" />
          <div className="absolute bottom-16 right-0 h-48 w-48 rounded-full bg-sky-200/30 blur-2xl" />

          {/* Top Section Stylized Cloud Watermark Contour */}
          <svg
            className="absolute top-20 -right-12 w-64 h-48 text-sky-400/25"
            viewBox="0 0 260 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sbCloudGlowTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M 75 145 C 45 145 20 125 20 95 C 20 67 42 45 70 43 C 85 15 125 12 150 30 C 167 21 190 25 203 42 C 230 47 245 71 242 98 C 240 125 217 145 190 145 Z"
              fill="url(#sbCloudGlowTop)"
            />
            <path
              d="M 65 140 C 40 140 25 120 26 95 C 27 72 45 52 69 50 C 82 23 120 20 145 36 C 162 28 185 32 197 48 C 222 53 238 75 235 100 C 232 123 211 140 186 140"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeOpacity="0.28"
              strokeDasharray="6 5"
              fill="none"
            />
          </svg>

          {/* Main Center-Bottom High-Fidelity Modern Cloud Watermark */}
          <svg
            className="absolute bottom-28 -right-8 w-80 h-72 text-sky-500/30"
            viewBox="0 0 320 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sbCloudGlowMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="sbCloudGlowInner" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {/* Outer Floating Cumulus Watermark */}
            <path
              d="M 90 215 C 50 215 18 185 18 145 C 18 107 48 76 86 73 C 106 35 160 32 193 56 C 215 45 245 49 263 71 C 298 78 320 109 316 145 C 314 180 283 215 246 215 Z"
              fill="url(#sbCloudGlowMain)"
            />
            {/* Inner Translucent Cloud Accent */}
            <path
              d="M 110 200 C 80 200 58 175 62 145 C 67 117 90 98 120 98 C 137 70 178 68 205 88 C 225 80 250 88 263 108 C 285 118 295 145 285 170 C 275 194 250 200 220 200 Z"
              fill="url(#sbCloudGlowInner)"
            />
            {/* Elegant Cloud Waves & Contour Streams */}
            <path
              d="M 75 208 C 42 208 24 180 26 148 C 28 116 54 87 88 84 C 105 48 153 45 183 67 C 205 57 234 62 250 82 C 282 89 304 118 300 152 C 296 184 268 208 236 208"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeOpacity="0.30"
              strokeDasharray="8 6"
              fill="none"
            />
            <path
              d="M 45 160 C 70 155 95 165 120 157 C 145 149 170 134 200 136 C 230 139 255 155 285 150"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeOpacity="0.38"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 75 180 C 100 175 125 183 150 177 C 175 171 200 160 230 162 C 255 164 275 175 295 172"
              stroke="#60a5fa"
              strokeWidth="1.2"
              strokeOpacity="0.28"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Top Brand Lockup with Glowing Accent */}
        <div className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-sky-200/70 bg-white/90 px-4 backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
          
          {/* Official Cloud PRO Master Brand */}
          <CloudProLogo
            variant="compact"
            size="md"
            cloudTextColor="text-slate-900"
            showSubtitle={true}
            subtitleText="ENTERPRISE CLOUD PANEL"
          />

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            onTouchEnd={e => {
              e.preventDefault();
              onCloseMobile();
            }}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-sky-200/80 bg-white text-slate-500 hover:bg-sky-50 hover:text-sky-900 lg:hidden cursor-pointer touch-manipulation active:scale-95 transition-all shadow-2xs"
            aria-label="Tutup Menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Live Node Telemetry Pulse & User Role Badge */}
        <div className="relative z-10 border-b border-sky-200/60 bg-white/75 px-3.5 py-2 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <div className="min-w-0 leading-tight">
                <div className="text-[11px] font-bold text-slate-900 truncate">
                  {currentUser.role === 'admin' ? 'Jaenal Maskun' : (currentUser.name || 'Administrator')}
                </div>
                <div className="text-[9px] font-mono text-emerald-700 flex items-center gap-1 font-medium">
                  <span>● {currentUser.role === 'admin' ? `Server: ${primaryServer?.hostname || 'server.karsacloud.biz.id'}` : 'Cluster: Karsa Cloud PRO Edge'}</span>
                </div>
              </div>
            </div>
            <span className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wider ${
              currentUser.role === 'admin'
                ? 'border-sky-300/80 bg-sky-100/90 text-sky-900'
                : currentUser.role === 'reseller'
                ? 'border-indigo-300/80 bg-indigo-100/90 text-indigo-900'
                : 'border-emerald-300/80 bg-emerald-100/90 text-emerald-900'
            }`}>
              {currentUser.role === 'admin'
                ? 'ROOT ADMIN'
                : currentUser.role === 'reseller'
                ? 'WHM RESELLER'
                : 'CPANEL USER'}
            </span>
          </div>
        </div>

        {/* Search Bar with Keyboard Shortcut Indicator & Collapse Toggle */}
        <div className="relative z-10 border-b border-sky-100/80 bg-white/70 px-3.5 py-2 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari modul..."
                className="w-full rounded-lg border border-sky-200/80 bg-white/90 pl-8 pr-12 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30 shadow-2xs transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Bersihkan pencarian"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block rounded border border-sky-200 bg-sky-50/70 px-1 font-mono text-[8px] text-slate-500 select-none">
                    Ctrl+K
                  </kbd>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAllGroups}
              title={areAllCurrentGroupsOpen ? 'Ringkas semua grup menu' : 'Buka semua grup menu'}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-900 hover:bg-sky-50 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Architectural Tree-Line Navigation Menu (Modern Cloud Palette) */}
        <nav
          className="relative z-10 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 text-xs font-medium scrollbar-thin scrollbar-thumb-sky-200/80 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filteredGroups.length === 0 ? (
            <div className="rounded-xl border border-sky-200/80 bg-white/80 p-4 text-center text-[11px] text-slate-500 shadow-2xs">
              Modul <strong>&ldquo;{searchQuery}&rdquo;</strong> tidak ditemukan.
            </div>
          ) : (
            filteredGroups.map(group => {
              const isOpenGroup = normalizedQuery ? true : !!openSections[group.key];
              const hasActiveChild = group.items.some(item =>
                isTabActive(item.id, item.aliases)
              );

              return (
                <div key={group.key} className="space-y-1">
                  {/* Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(group.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em] transition-colors cursor-pointer select-none touch-manipulation group ${
                      hasActiveChild
                        ? 'text-sky-950 bg-sky-100/70 border border-sky-200/80 shadow-2xs'
                        : 'text-slate-500 hover:bg-sky-100/40 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                          hasActiveChild
                            ? 'bg-sky-500 ring-2 ring-sky-400/30'
                            : 'bg-slate-400 group-hover:bg-sky-500'
                        }`}
                      />
                      <span className="truncate">{group.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[9px] text-slate-400 group-hover:text-slate-600">
                        {group.items.length}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${
                          isOpenGroup ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Group Items with Architectural Tree-Line */}
                  {isOpenGroup && (
                    <div className="ml-3 border-l border-sky-200/70 pl-2 space-y-0.5">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const active = isTabActive(item.id, item.aliases);

                        const itemContent = (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                                  active
                                    ? 'border-white/25 bg-white/20 text-white shadow-2xs ring-1 ring-white/30'
                                    : 'border-sky-200/80 bg-white/90 text-sky-600 group-hover:border-sky-300 group-hover:bg-white group-hover:text-sky-700 shadow-2xs'
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className={`truncate ${active ? 'font-bold text-white' : 'font-medium text-slate-700 group-hover:text-sky-950'}`}>
                                {item.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.badge && (
                                <span
                                  className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold border ${
                                    active
                                      ? 'border-white/30 bg-white/20 text-white'
                                      : 'border-sky-200/80 bg-white/90 text-sky-700 group-hover:text-sky-900'
                                  }`}
                                >
                                  {item.badge.text}
                                </span>
                              )}
                              {active && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs shadow-white/80" />
                              )}
                            </div>
                          </>
                        );

                        if (item.externalHref) {
                          return (
                            <a
                              key={item.id}
                              href={item.externalHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-slate-700 hover:bg-white/85 hover:text-sky-950 transition-all cursor-pointer touch-manipulation"
                              title="Buka Direct Web Terminal Linux Shell"
                            >
                              {itemContent}
                            </a>
                          );
                        }

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNav(item.id)}
                            className={`group flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                              active
                                ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white font-bold shadow-md shadow-sky-500/25 ring-1 ring-white/20'
                                : 'text-slate-700 hover:bg-sky-100/70 hover:text-sky-950 active:bg-sky-200/50'
                            }`}
                          >
                            {itemContent}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Live Server Telemetry Gauge (CPU / RAM / Disk) */}
        <div className="relative z-10 border-t border-sky-100/80 bg-white/70 p-2.5 space-y-1.5 backdrop-blur-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Activity className="h-3 w-3 text-sky-500" /> Beban Server Node
            </span>
            <span className="font-mono text-[9px] text-emerald-600 font-semibold">12ms · Normal</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <div className="rounded-md border border-sky-100 bg-white/90 p-1 text-center shadow-2xs">
              <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">CPU</div>
              <div className="font-mono text-[10px] font-bold text-sky-600">14%</div>
            </div>
            <div className="rounded-md border border-sky-100 bg-white/90 p-1 text-center shadow-2xs">
              <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">RAM</div>
              <div className="font-mono text-[10px] font-bold text-emerald-600">2.8G</div>
            </div>
            <div className="rounded-md border border-sky-100 bg-white/90 p-1 text-center shadow-2xs">
              <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">DISK</div>
              <div className="font-mono text-[10px] font-bold text-amber-600">18G</div>
            </div>
          </div>
        </div>

        {/* Compact Executive Portal Switcher & Logout Dock */}
        <div className="relative z-10 border-t border-sky-100/90 bg-white/90 p-3 space-y-2 backdrop-blur-md">
          {/* Untuk Akun Klien (Customer): Kunci di cPanel, jangan tampilkan switcher portal */}
          {authenticatedRole === 'customer' ? (
            <div className="flex items-center justify-between gap-2 py-0.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                  Portal cPanel Klien
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/70 px-2.5 py-1 text-[10px] font-semibold text-rose-700 hover:border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                title="Keluar / Logout Akun"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : authenticatedRole === 'reseller' ? (
            /* Untuk Akun Reseller: Kunci di WHM Reseller, jangan tampilkan switcher portal */
            <div className="flex items-center justify-between gap-2 py-0.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-800">
                  Portal WHM Reseller
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/70 px-2.5 py-1 text-[10px] font-semibold text-rose-700 hover:border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                title="Keluar / Logout Akun"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Khusus Akun Root Administrator: Tampilkan Mode Portal Switcher */
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Mode Portal (Root)
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/70 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                  title="Keluar / Logout Akun"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Logout</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 rounded-xl border border-sky-200/80 bg-sky-100/50 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    switchRole('admin');
                    handleNav('dashboard');
                  }}
                  className={`rounded-lg py-1.5 text-center font-mono text-[10px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                    currentUser.role === 'admin'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  ROOT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('reseller');
                    handleNav('reseller-dashboard');
                  }}
                  className={`rounded-lg py-1.5 text-center font-mono text-[10px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                    currentUser.role === 'reseller'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  WHM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('customer');
                    handleNav('customer-dashboard');
                  }}
                  className={`rounded-lg py-1.5 text-center font-mono text-[10px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                    currentUser.role === 'customer'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  CPANEL
                </button>
              </div>
            </>
          )}

          {/* Portal Utama Landing Page Button (Mudah diakses dari Android / Mobile Sidebar) */}
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              window.dispatchEvent(new CustomEvent('open-landing-page'));
            }}
            title="Buka Portal Utama Karsa Cloud (karsacloud.biz.id)"
            className="flex w-full items-center justify-between rounded-xl border border-sky-200 bg-sky-50/80 px-2.5 py-1.5 text-[11px] font-bold text-sky-800 hover:bg-sky-100 hover:text-sky-950 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-sky-600" />
              <span>Portal Utama Karsa Cloud</span>
            </span>
            <span className="text-[9px] font-mono text-sky-700 bg-white/90 border border-sky-200 px-1.5 py-0.5 rounded font-bold">.biz.id</span>
          </button>

          {/* Android & Mobile Accessible Git Commit Version Badge (Permanently placed in sidebar navigation) */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-git-commit-modal'));
            }}
            title="Klik untuk melihat Status Commit & Verifikasi Integritas Server"
            className="flex w-full items-center justify-between rounded-xl border border-sky-200/90 bg-white/90 px-2.5 py-1.5 text-[10px] font-mono text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-950 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="flex items-center gap-1.5 text-slate-700">
              <GitBranch className="h-3 w-3 text-emerald-600" />
              <span>Git:</span>
              <strong className="text-emerald-700 font-bold">{commitHash}</strong>
            </span>
            <span className="flex items-center gap-1 text-[9px] text-slate-500 font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-700">Terkoneksi</span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
