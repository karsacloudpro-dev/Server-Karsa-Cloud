import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  PlusCircle,
  FolderOpen,
  Lock,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap,
  HelpCircle,
  Copy,
  Server,
  ArrowRight,
  ShieldCheck,
  Archive,
  AlertTriangle,
  Terminal,
  Activity,
  Settings,
  Check,
  X,
  GitBranch,
  RefreshCw,
} from 'lucide-react';
import { HostingAccount, DomainEntity, PhpVersion, CoreServerDomainInfo } from '../../types';
import { CloudProApi } from '../../services/api';
import { db, isCoreServerDomain } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import { WebsitePreviewModal } from './WebsitePreviewModal';

interface DomainSubdomainManagerProps {
  account: HostingAccount;
  onOpenFileManager?: (path: string) => void;
  onNavigateTab?: (tab: string, domain?: string) => void;
  initialScopeTab?: 'server_infra' | 'client_domains';
}

export const DomainSubdomainManager: React.FC<DomainSubdomainManagerProps> = ({
  account,
  onOpenFileManager,
  onNavigateTab,
  initialScopeTab,
}) => {
  const { currentUser } = useAuth();
  const { showToast, refreshAll, confirmAction } = useServer();

  if (!currentUser || !account) return null;

  const [scopeTab, setScopeTab] = useState<'server_infra' | 'client_domains'>(() => {
    if (initialScopeTab) return initialScopeTab;
    if (currentUser.role === 'admin') return 'server_infra';
    return 'client_domains';
  });

  const coreServerDomains = useMemo(() => db.getCoreServerDomains(), []);
  const [selectedProxyConfigDomain, setSelectedProxyConfigDomain] = useState<CoreServerDomainInfo | null>(null);
  const [copiedProxyText, setCopiedProxyText] = useState(false);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  const handleSyncServerUpdate = async () => {
    setIsSyncingGithub(true);
    try {
      const res = await fetch('/api/system/git-pull-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        showToast('success', 'Update Berhasil', data.message || 'Server telah disinkronkan ke repo GitHub terbaru.');
      } else {
        showToast('error', 'Update Gagal', data.message || 'Gagal menyinkronkan ke GitHub.');
      }
    } catch (err: any) {
      showToast('error', 'Error Update', err?.message || 'Koneksi ke endpoint update gagal.');
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const [domains, setDomains] = useState<DomainEntity[]>(() => account?.id ? db.getDomains(account.id) : []);
  const [showSubdomainModal, setShowSubdomainModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{ domain: string; docRoot: string } | null>(null);

  // Subdomain form states
  const [subPrefix, setSubPrefix] = useState('');
  const [parentDomain, setParentDomain] = useState(account?.primaryDomain || '');
  const [subDocRoot, setSubDocRoot] = useState('');
  const [isCustomSubDocRoot, setIsCustomSubDocRoot] = useState(false);
  const [subPhpVersion, setSubPhpVersion] = useState<PhpVersion>('7.4');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // Addon domain form states
  const [addonDomain, setAddonDomain] = useState('');
  const [addonDocRoot, setAddonDocRoot] = useState('');
  const [isCustomAddonDocRoot, setIsCustomAddonDocRoot] = useState(false);
  const [addonPhpVersion, setAddonPhpVersion] = useState<PhpVersion>('8.2');
  const [isSubmittingAddon, setIsSubmittingAddon] = useState(false);

  useEffect(() => {
    if (account?.id) {
      setDomains([...db.getDomains(account.id)]);
      setParentDomain(account.primaryDomain || '');
    }
  }, [account?.id, account?.primaryDomain]);

  // Refresh domain list
  const reloadDomains = () => {
    setDomains([...db.getDomains(account.id)]);
  };

  const currentPlan = useMemo(() => {
    return db.getHostingPlans().find(p => p.id === account?.planId);
  }, [account?.planId]);

  const maxSubdomains = currentPlan?.maxSubdomains ?? (currentPlan?.maxDomains ? currentPlan.maxDomains * 5 : 10);
  const currentSubdomainsCount = domains.filter(d => d.type === 'subdomain').length;
  const isSubdomainLimitReached = maxSubdomains < 999 && currentSubdomainsCount >= maxSubdomains;

  const isPresetActive = (prefix: string): boolean => {
    const targetFull = `${prefix.toLowerCase()}.${account.primaryDomain.toLowerCase()}`;
    return domains.some(
      d => d.type === 'subdomain' && d.domain.toLowerCase() === targetFull
    );
  };

  const handleSubPrefixChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubPrefix(clean);
    if (!isCustomSubDocRoot) {
      setSubDocRoot(`/home/${account.username}/public_html/${clean}`);
    }
  };

  const handleAddonDomainChange = (val: string) => {
    const clean = val.toLowerCase().trim();
    setAddonDomain(clean);
    if (!isCustomAddonDocRoot) {
      setAddonDocRoot(`/home/${account.username}/${clean}`);
    }
  };

  const handleCreateSubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubdomainLimitReached) {
      showToast(
        'error',
        'Batas Kuota Subdomain Tercapai',
        `Akun telah mencapai batas maksimum ${maxSubdomains} subdomain pada paket ${currentPlan?.name || 'ini'}. Silakan upgrade paket hosting.`
      );
      return;
    }
    if (!subPrefix.trim()) {
      showToast('error', 'Validasi Gagal', 'Prefix subdomain tidak boleh kosong.');
      return;
    }

    setIsSubmittingSub(true);
    try {
      const cleanPrefix = subPrefix.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
      const targetParent = parentDomain || account.primaryDomain;
      const finalDocRoot = isCustomSubDocRoot && subDocRoot.trim()
        ? subDocRoot.trim()
        : `/home/${account.username}/public_html/${cleanPrefix}`;

      await CloudProApi.createSubdomain(
        {
          accountId: account.id,
          subdomainPrefix: cleanPrefix,
          parentDomain: targetParent,
          documentRoot: finalDocRoot,
          phpVersion: subPhpVersion,
        },
        currentUser
      );

      setShowSubdomainModal(false);
      setSubPrefix('');
      setIsCustomSubDocRoot(false);
      reloadDomains();
      refreshAll();
      showToast(
        'success',
        'Subdomain Berhasil Dibuat',
        `${cleanPrefix}.${targetParent} aktif dengan Document Root otomatis di ${finalDocRoot}.`
      );
    } catch (err: any) {
      showToast('error', 'Gagal Membuat Subdomain', err.message);
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleQuickPresetSubdomain = async (prefix: string, phpVer: PhpVersion) => {
    if (isSubdomainLimitReached && !isPresetActive(prefix)) {
      showToast(
        'error',
        'Batas Kuota Subdomain Tercapai',
        `Akun telah mencapai batas maksimum ${maxSubdomains} subdomain pada paket ${currentPlan?.name || 'ini'}. Silakan upgrade paket hosting.`
      );
      return;
    }
    setIsSubmittingSub(true);
    try {
      const cleanPrefix = prefix.toLowerCase().trim();
      const targetParent = account.primaryDomain;
      const finalDocRoot = `/home/${account.username}/public_html/${cleanPrefix}`;

      await CloudProApi.createSubdomain(
        {
          accountId: account.id,
          subdomainPrefix: cleanPrefix,
          parentDomain: targetParent,
          documentRoot: finalDocRoot,
          phpVersion: phpVer,
        },
        currentUser
      );

      reloadDomains();
      refreshAll();
      showToast(
        'success',
        'Subdomain Berhasil Diaktifkan',
        `${cleanPrefix}.${targetParent} (PHP ${phpVer}) telah aktif di ${finalDocRoot}.`
      );
    } catch (err: any) {
      showToast('error', 'Gagal Mengaktifkan Subdomain', err.message);
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleCreateAddonDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonDomain.trim() || !addonDomain.includes('.')) {
      showToast('error', 'Validasi Gagal', 'Masukkan nama domain yang valid (misal: contoh.com).');
      return;
    }

    setIsSubmittingAddon(true);
    try {
      const cleanDomain = addonDomain.toLowerCase().trim();
      const finalDocRoot = isCustomAddonDocRoot && addonDocRoot.trim()
        ? addonDocRoot.trim()
        : `/home/${account.username}/${cleanDomain}`;

      await CloudProApi.createAddonDomain(
        {
          accountId: account.id,
          domain: cleanDomain,
          documentRoot: finalDocRoot,
          phpVersion: addonPhpVersion,
        },
        currentUser
      );

      showToast(
        'success',
        'Addon Domain Berhasil Ditambahkan!',
        `${cleanDomain} aktif dengan Document Root otomatis di ${finalDocRoot}.`
      );
      setShowAddonModal(false);
      setAddonDomain('');
      setIsCustomAddonDocRoot(false);
      reloadDomains();
      refreshAll();
    } catch (err: any) {
      showToast('error', 'Gagal Menambah Addon Domain', err.message);
    } finally {
      setIsSubmittingAddon(false);
    }
  };

  const handleDeleteDomain = (dom: DomainEntity) => {
    confirmAction({
      title: 'Hapus Domain / Subdomain',
      message: `Apakah Anda yakin ingin menghapus domain/subdomain ${dom.domain}? Virtual host dan routing Nginx untuk domain ini akan dinonaktifkan.`,
      confirmText: 'Hapus Domain',
      isDanger: true,
      onConfirm: async () => {
        try {
          await CloudProApi.deleteDomain(dom.id, currentUser);
          showToast('info', 'Domain Dihapus', `${dom.domain} berhasil dihapus.`);
          reloadDomains();
          refreshAll();
        } catch (err: any) {
          showToast('error', 'Gagal Menghapus Domain', err.message);
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast('info', 'Tersalin', `Path direktori ${text} disalin ke clipboard.`);
  };

  return (
    <div className="space-y-6">
      {/* Scope Switcher: Server Core Infrastructure vs Client Domains */}
      {currentUser.role === 'admin' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setScopeTab('server_infra')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scopeTab === 'server_infra'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Domain Infrastruktur Server (3 Core)</span>
              <span className={`font-mono text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                scopeTab === 'server_infra' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
                CORE
              </span>
            </button>
            <button
              type="button"
              onClick={() => setScopeTab('client_domains')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scopeTab === 'client_domains'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Domain Milik Klien (Reseller &amp; Pelanggan)</span>
              <span className={`font-mono text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                scopeTab === 'client_domains' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
                {domains.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 px-3 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {scopeTab === 'server_infra'
                ? 'Terisolasi: Pengaturan domain inti karsacloud.biz.id'
                : `Domain klien pada akun: ${account.primaryDomain}`}
            </span>
          </div>
        </div>
      )}

      {scopeTab === 'server_infra' ? (
        /* ================================================================ */
        /* TAB 1: DOMAIN INFRASTRUKTUR UTAMA SERVER                         */
        /* (karsacloud.biz.id, server.karsacloud.biz.id, client.karsacloud)  */
        /* ================================================================ */
        <div className="space-y-6">
          {/* Executive Server Domain Banner */}
          <div className="rounded-2xl border border-sky-300 bg-gradient-to-br from-sky-900/40 via-slate-900 to-indigo-950/40 p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-sky-500/20 border border-sky-400/40 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-sky-300 uppercase">
                    CORE CLUSTER DOMAINS
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Node: SG-Edge-01 (178.83.181.238)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Domain Infrastruktur Server Utama Karsa Cloud PRO
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Pengaturan ini mengelola 3 domain inti sistem server: Portal Utama (<strong className="text-white">karsacloud.biz.id</strong>), Web Panel Admin (<strong className="text-amber-300">server.karsacloud.biz.id</strong>), dan Portal Klien cPanel (<strong className="text-emerald-300">client.karsacloud.biz.id</strong>). Domain-domain ini telah dipisahkan secara permanen dari domain milik klien untuk menjaga stabilitas routing cluster.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('dns-zones')}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span>DNS Zone Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('terminal')}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Web Terminal (SSH)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Core Server Domains Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coreServerDomains.map((core) => {
              const isWebPanel = core.domain === 'server.karsacloud.biz.id';
              const isApex = core.domain === 'karsacloud.biz.id';

              return (
                <div
                  key={core.id}
                  className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between transition-all ${
                    isApex
                      ? 'border-sky-300 dark:border-sky-800/80 hover:border-sky-400'
                      : isWebPanel
                      ? 'border-amber-300 dark:border-amber-800/80 hover:border-amber-400'
                      : 'border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`rounded-lg px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider ${
                          isApex
                            ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                            : isWebPanel
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {core.badge}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 break-all">
                      <span>{core.domain}</span>
                    </h4>
                    <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {core.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {core.roleDescription}
                    </p>

                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Target Port:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          Port {core.targetPort} (Node Engine)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Sertifikat SSL:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          <span>TLS 1.3 Auto-Renew</span>
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Document Root:</span>
                        <strong className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={core.documentRoot}>
                          {core.documentRoot}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Node IP:</span>
                        <strong className="text-slate-700 dark:text-slate-300">
                          {core.ipAddress}
                        </strong>
                      </div>
                    </div>

                    {isWebPanel && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-sans space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                            <GitBranch className="h-3 w-3 text-emerald-400" />
                            <span>Default Update Server</span>
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
                            AUTO-SYNC GITHUB
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-300 truncate" title="https://github.com/karsacloudpro-dev/Server-Karsa-Cloud.git">
                          repo: karsacloudpro-dev/Server-Karsa-Cloud (main)
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Sistem pembaruan web panel <strong className="text-white">server.karsacloud.biz.id</strong> terhubung ke repository GitHub ini secara default.
                        </p>
                        <button
                          type="button"
                          disabled={isSyncingGithub}
                          onClick={handleSyncServerUpdate}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 py-1.5 px-2 font-semibold text-[10.5px] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3 w-3 ${isSyncingGithub ? 'animate-spin' : ''}`} />
                          <span>{isSyncingGithub ? 'Menyinkronkan Kode...' : 'Tarik Pembaruan GitHub Sekarang'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    <a
                      href={`https://${core.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 px-3 text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Buka {isApex ? 'Website' : isWebPanel ? 'Web Panel' : 'Portal Klien'}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedProxyConfigDomain(core)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Lihat Konfigurasi Reverse Proxy / VHost"
                    >
                      <Settings className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VHost Routing & System Security Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Tabel Virtual Host &amp; Reverse Proxy Server Core
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Terisolasi &bull; Anti-Konflik Klien
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:bg-slate-800/60 dark:text-slate-400 font-sans border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Domain Hostname</th>
                    <th className="px-5 py-3">Peran Server</th>
                    <th className="px-5 py-3">Upstream / Port</th>
                    <th className="px-5 py-3">Protokol &amp; SSL</th>
                    <th className="px-5 py-3">Proteksi Sistem</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {coreServerDomains.map((core) => (
                    <tr key={core.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                          <span>{core.domain}</span>
                          <Lock className="h-3 w-3 text-emerald-500" />
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-sans">
                          {core.documentRoot}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {core.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IP: {core.ipAddress}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className="rounded bg-sky-50 dark:bg-sky-950 px-2 py-0.5 font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          localhost:{core.targetPort}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px]">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>TLS 1.3 / HTTP/3</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {core.sslProvider}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <ShieldCheck className="h-3 w-3" />
                          <span>DIKUNCI OLEH SISTEM</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedProxyConfigDomain(core)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Settings className="h-3 w-3 text-sky-500" />
                            <span>VHost Config</span>
                          </button>
                          <a
                            href={`https://${core.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-sky-500 cursor-pointer shadow-2xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================ */
        /* TAB 2: DOMAIN MILIK KLIEN (RESELLER & PELANGGAN)                 */
        /* ================================================================ */
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Manajemen Domain &amp; Subdomain Milik Klien
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Kelola subdomain dan addon domain untuk akun klien (<strong className="text-slate-800 dark:text-slate-200">{account.primaryDomain}</strong>). Seluruh perubahan di sini terisolasi dan tidak menyentuh domain server utama.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 text-xs font-mono">
                <Globe className="h-3.5 w-3.5 text-sky-500" />
                <span className="text-slate-500">Kuota Subdomain:</span>
                <span className={`font-bold ${isSubdomainLimitReached ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {currentSubdomainsCount} / {maxSubdomains >= 999 ? 'Unlimited' : maxSubdomains}
                </span>
              </div>

              <button
                disabled={isSubdomainLimitReached}
                onClick={() => {
                  setSubPrefix('');
                  setIsCustomSubDocRoot(false);
                  setShowSubdomainModal(true);
                }}
                title={isSubdomainLimitReached ? 'Batas kuota subdomain paket ini telah penuh' : 'Buat subdomain baru'}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Buat Subdomain</span>
              </button>

              <button
                onClick={() => {
                  setAddonDomain('');
                  setIsCustomAddonDocRoot(false);
                  setShowAddonModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs cursor-pointer transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Addon Domain</span>
              </button>
            </div>
          </div>

      {/* RDM & School Quick Presets Card */}
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-white p-4 sm:p-5 shadow-xs dark:border-sky-900/60 dark:from-sky-950/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Preset Cepat Subdomain Aplikasi Madrasah &amp; Sekolah
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Klik salah satu tombol di bawah untuk langsung menyiapkan subdomain dengan Document Root otomatis:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSubmittingSub}
              onClick={() => handleQuickPresetSubdomain('rdm', '7.2')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {isPresetActive('rdm') ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              <span>
                {isPresetActive('rdm')
                  ? `Subdomain RDM Aktif (rdm.${account.primaryDomain})`
                  : 'Subdomain RDM (PHP 7.2)'}
              </span>
            </button>

            <button
              type="button"
              disabled={isSubmittingSub}
              onClick={() => handleQuickPresetSubdomain('cbt', '7.4')}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {isPresetActive('cbt') ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              <span>
                {isPresetActive('cbt')
                  ? `Subdomain CBT Aktif (cbt.${account.primaryDomain})`
                  : 'Subdomain CBT / Ujian (PHP 7.4)'}
              </span>
            </button>

            <button
              type="button"
              disabled={isSubmittingSub}
              onClick={() => handleQuickPresetSubdomain('elearning', '8.2')}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {isPresetActive('elearning') ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              <span>
                {isPresetActive('elearning')
                  ? `Subdomain E-Learning Aktif (elearning.${account.primaryDomain})`
                  : 'Subdomain E-Learning (PHP 8.2)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Domain & Subdomain Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Daftar Domain &amp; Subdomain Aktif ({domains.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Virtual Host Hostname &amp; Pemetaan Path Direktori
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:bg-slate-800/60 dark:text-slate-400 font-sans border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Nama Domain / Subdomain</th>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Web Document Root (Folder Fisik)</th>
                <th className="px-5 py-3">PHP Runtime</th>
                <th className="px-5 py-3">Status SSL</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Belum ada domain atau subdomain yang terdaftar.
                  </td>
                </tr>
              ) : (
                domains.map(dom => (
                  <tr key={dom.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-sky-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewTarget({
                                  domain: dom.domain,
                                  docRoot: dom.documentRoot,
                                })
                              }
                              className="hover:text-sky-600 hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                              title="Buka Live Preview Website"
                            >
                              <span>{dom.domain}</span>
                              <ExternalLink className="h-3 w-3 text-sky-500" />
                            </button>
                          </div>
                          {dom.parentDomain && dom.type === 'subdomain' && (
                            <div className="text-[10.5px] text-slate-400">
                              Induk: {dom.parentDomain}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {dom.type === 'primary' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800">
                          Primary Domain
                        </span>
                      ) : dom.type === 'subdomain' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                          Subdomain
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800">
                          Addon Domain
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                          {dom.documentRoot}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(dom.documentRoot)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                          title="Salin path Document Root"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Otomatis terhubung ke Nginx &amp; File Manager</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <button
                        type="button"
                        onClick={() => onNavigateTab && onNavigateTab('php-selector', dom.domain)}
                        className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 dark:bg-violet-950/60 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-semibold text-[11px] cursor-pointer transition-colors"
                        title={`Atur versi PHP & ekstensi untuk ${dom.domain}`}
                      >
                        PHP {dom.phpVersion || account.phpVersion || '8.2'} ⚙
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                        <Lock className="h-3 w-3 text-emerald-500" /> Let&apos;s Encrypt Aktif
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewTarget({
                              domain: dom.domain,
                              docRoot: dom.documentRoot,
                            })
                          }
                          className="flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-500 cursor-pointer shadow-2xs"
                          title="Lihat Live Preview Website"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Preview</span>
                        </button>
                        {onOpenFileManager && (
                          <button
                            type="button"
                            onClick={() => {
                              const relativePath = dom.documentRoot.replace(`/home/${account.username}`, '') || '/public_html';
                              onOpenFileManager(relativePath);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                            title="Buka folder di File Manager"
                          >
                            <FolderOpen className="h-3 w-3 text-amber-500" />
                            <span>Buka Folder</span>
                          </button>
                        )}

                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('backups', dom.domain)}
                            className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300 cursor-pointer"
                            title="Cadangkan atau Pulihkan Domain Ini (.ZIP)"
                          >
                            <Archive className="h-3 w-3 text-orange-500" />
                            <span>Backup / Restore (.ZIP)</span>
                          </button>
                        )}

                        {dom.type !== 'primary' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDomain(dom)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer"
                            title="Hapus domain/subdomain"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SSL Subdomain Troubleshooting & Cloudflare Proxy Guide */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Subdomain Muncul Error &quot;ERR_SSL_PROTOCOL_ERROR&quot; di Browser?</span>
              <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                PANDUAN SOLUSI CEPAT
              </span>
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Jika saat membuka subdomain (misal: <code>siakad-madrasah.denbaguse.my.id</code>) muncul peringatan <em>&quot;Situs ini tidak dapat menyediakan sambungan aman (ERR_SSL_PROTOCOL_ERROR)&quot;</em>, berikut 2 cara memperbaikinya:
            </p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Cara 1: Cloudflare Proxy */}
              <div className="rounded-xl border border-white/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-[10px]">1</span>
                  <span>Solusi 1: Aktifkan Cloudflare Proxy (🟠 Paling Mudah)</span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Buka akun <strong>Cloudflare</strong> &gt; Menu <strong>DNS</strong> &gt; cari record subdomain Anda (misal <code>siakad-madrasah</code>):
                </p>
                <div className="mt-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  Ubah Proxy Status dari <strong>DNS only (Awan Abu-Abu)</strong> menjadi <strong>Proxied (Awan Oranye 🟠)</strong>.
                </div>
                <p className="mt-2 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Universal SSL Cloudflare otomatis mengamankan seluruh subdomain (*.{account.primaryDomain}) tanpa setup tambahan!
                </p>
              </div>

              {/* Cara 2: Web SSH / Caddy Fix */}
              <div className="rounded-xl border border-white/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[10px]">2</span>
                  <span>Solusi 2: 1-Click Fix via Web SSH Terminal</span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Jika tidak menggunakan proxy Cloudflare, daftarkan subdomain ke web server Caddy VPS Anda:
                </p>
                <div className="mt-2 rounded-lg bg-slate-900 p-2 text-emerald-400 font-mono text-[11px] flex items-center justify-between">
                  <span>bash fix-caddy-ssl.sh</span>
                  <a
                    href="/ssh"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-violet-500"
                  >
                    <Terminal className="h-3 w-3" />
                    <span>Buka Web SSH</span>
                  </a>
                </div>
                <p className="mt-2 text-[10.5px] text-slate-500 dark:text-slate-400">
                  Di Web SSH, cukup klik tombol ungu <strong>&quot;🔒 Fix SSL Subdomain (Caddy)&quot;</strong>. Caddy otomatis meminta sertifikat SSL Let&apos;s Encrypt / ZeroSSL!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Buat Subdomain Baru */}
      {showSubdomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-sky-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Registrasi Subdomain Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubdomainModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubdomain} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Nama Subdomain: *
                </label>
                <div className="mt-1 flex rounded-lg border border-slate-200 overflow-hidden dark:border-slate-700">
                  <input
                    type="text"
                    value={subPrefix}
                    onChange={e => handleSubPrefixChange(e.target.value)}
                    placeholder="rdm atau cbt atau elearning"
                    className="w-1/2 px-3 py-2 font-mono text-xs focus:outline-none dark:bg-slate-800 dark:text-white"
                    required
                    autoFocus
                  />
                  <div className="w-1/2 flex items-center bg-slate-50 px-3 text-slate-500 border-l border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-400 font-mono text-xs">
                    .{parentDomain}
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Domain lengkap: <strong className="font-mono text-sky-600 dark:text-sky-400">{subPrefix ? `${subPrefix}.${parentDomain}` : `[subdomain].${parentDomain}`}</strong>
                </p>
              </div>

              {/* Automatic Document Root Section */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Document Root:</span>
                    <span className="rounded bg-sky-200/80 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-sky-900 dark:bg-sky-900 dark:text-sky-200">
                      Otomatis
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isCustomSubDocRoot;
                      setIsCustomSubDocRoot(next);
                      if (!next) {
                        setSubDocRoot(`/home/${account.username}/public_html/${subPrefix || 'subdomain'}`);
                      }
                    }}
                    className="text-[11px] font-semibold text-sky-700 hover:underline dark:text-sky-300 cursor-pointer"
                  >
                    {isCustomSubDocRoot ? '← Reset ke Otomatis' : '⚙️ Ubah Root Kustom'}
                  </button>
                </div>

                <input
                  type="text"
                  value={isCustomSubDocRoot ? subDocRoot : `/home/${account.username}/public_html/${subPrefix || 'subdomain'}`}
                  onChange={e => setSubDocRoot(e.target.value)}
                  disabled={!isCustomSubDocRoot}
                  className={`w-full rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                    isCustomSubDocRoot
                      ? 'border-sky-500 bg-white text-slate-900 ring-2 ring-sky-500/20 dark:bg-slate-900 dark:text-white'
                      : 'border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                />

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Sistem otomatis membuat folder <code>/public_html/{subPrefix || '[subdomain]'}/</code> di akun Linux Anda beserta template <code>index.php</code> starter.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  PHP Runtime untuk Subdomain:
                </label>
                <select
                  value={subPhpVersion}
                  onChange={e => setSubPhpVersion(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="7.2">PHP 7.2 (Rekomendasi Rapor Digital Madrasah / RDM)</option>
                  <option value="7.4">PHP 7.4 (Rekomendasi CBT / Ujian Online)</option>
                  <option value="8.0">PHP 8.0</option>
                  <option value="8.1">PHP 8.1</option>
                  <option value="8.2">PHP 8.2 (LTS)</option>
                  <option value="8.3">PHP 8.3 (Terbaru)</option>
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Otomatisasi Sistem Terintegrasi:</span>
                </div>
                <p>
                  DNS A Record untuk <code>{subPrefix || 'subdomain'}.{parentDomain}</code> otomatis diarahkan ke IP <code>{account.ipAddress}</code> dan sertifikat SSL Let&apos;s Encrypt akan diaktifkan secara instan.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubdomainModal(false)}
                  className="rounded-lg border px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSub}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>{isSubmittingSub ? 'Membuat...' : 'Buat Subdomain'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Addon Domain Baru */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Tambah Addon Domain Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddonModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAddonDomain} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Nama Domain Baru: *
                </label>
                <input
                  type="text"
                  value={addonDomain}
                  onChange={e => handleAddonDomainChange(e.target.value)}
                  placeholder="alumni-madrasah.sch.id"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                  autoFocus
                />
              </div>

              {/* Automatic Document Root Section */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Document Root:</span>
                    <span className="rounded bg-indigo-200/80 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                      Otomatis
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isCustomAddonDocRoot;
                      setIsCustomAddonDocRoot(next);
                      if (!next) {
                        setAddonDocRoot(`/home/${account.username}/${addonDomain || 'domain-baru.com'}`);
                      }
                    }}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline dark:text-indigo-300 cursor-pointer"
                  >
                    {isCustomAddonDocRoot ? '← Reset ke Otomatis' : '⚙️ Ubah Root Kustom'}
                  </button>
                </div>

                <input
                  type="text"
                  value={isCustomAddonDocRoot ? addonDocRoot : `/home/${account.username}/${addonDomain || 'domain-baru.com'}`}
                  onChange={e => setAddonDocRoot(e.target.value)}
                  disabled={!isCustomAddonDocRoot}
                  className={`w-full rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                    isCustomAddonDocRoot
                      ? 'border-indigo-500 bg-white text-slate-900 ring-2 ring-indigo-500/20 dark:bg-slate-900 dark:text-white'
                      : 'border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                />

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Sistem otomatis menyiapkan folder terisolasi untuk addon domain ini agar tidak bercampur dengan domain utama.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  PHP Runtime:
                </label>
                <select
                  value={addonPhpVersion}
                  onChange={e => setAddonPhpVersion(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="8.3">PHP 8.3 (Terbaru)</option>
                  <option value="8.2">PHP 8.2 (LTS)</option>
                  <option value="8.1">PHP 8.1</option>
                  <option value="8.0">PHP 8.0</option>
                  <option value="7.4">PHP 7.4</option>
                  <option value="7.2">PHP 7.2</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddonModal(false)}
                  className="rounded-lg border px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAddon}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>{isSubmittingAddon ? 'Menambahkan...' : 'Tambah Addon Domain'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      )}

      {/* VHost & Reverse Proxy Configuration Modal for Core Server Domains */}
      {selectedProxyConfigDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  Konfigurasi VHost &amp; Reverse Proxy: {selectedProxyConfigDomain.domain}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProxyConfigDomain(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono">
                <div>
                  <div className="text-slate-400 text-[11px]">Domain Endpoint:</div>
                  <div className="text-sky-300 font-bold">{selectedProxyConfigDomain.domain}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Upstream Target:</div>
                  <div className="text-emerald-400 font-bold">127.0.0.1:{selectedProxyConfigDomain.targetPort}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Caddy v2 Production Block:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const caddyBlock = `${selectedProxyConfigDomain.domain} {\n  encode gzip zstd\n  reverse_proxy 127.0.0.1:${selectedProxyConfigDomain.targetPort}\n  tls {\n    dns cloudflare {env.CLOUDFLARE_API_TOKEN}\n  }\n}`;
                      navigator.clipboard.writeText(caddyBlock);
                      setCopiedProxyText(true);
                      setTimeout(() => setCopiedProxyText(false), 2000);
                      showToast('info', 'Tersalin', 'Blok konfigurasi Caddy disalin.');
                    }}
                    className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedProxyText ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedProxyText ? 'Tersalin' : 'Salin Snippet'}</span>
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
{`${selectedProxyConfigDomain.domain} {
  encode gzip zstd
  reverse_proxy 127.0.0.1:${selectedProxyConfigDomain.targetPort}
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
}`}
                </pre>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3 text-sky-200 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1 text-sky-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Isolasi Server Mandiri</span>
                </div>
                <p className="text-slate-300">
                  Domain ini otomatis ditangani oleh daemon Caddy reverse-proxy dan engine Node.js port {selectedProxyConfigDomain.targetPort}. Domain milik klien (reseller / customer) tidak akan pernah menimpa routing domain ini.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedProxyConfigDomain(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {previewTarget && (
        <WebsitePreviewModal
          isOpen={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          account={account}
          initialDomain={previewTarget.domain}
          initialDocRoot={previewTarget.docRoot}
          onOpenFileManager={onOpenFileManager}
        />
      )}
    </div>
  );
};
