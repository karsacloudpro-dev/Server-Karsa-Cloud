import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Archive,
  Download,
  RotateCcw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  HardDrive,
  FileCheck,
  ShieldCheck,
  Lock,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Globe,
  DownloadCloud,
  AlertTriangle,
  Layers,
  ExternalLink,
  Zap,
  Server,
  ChevronDown,
  Eye,
  FileText,
  ArrowRight,
  Loader2,
  FolderOpen,
  Cloud,
  Database,
  Power,
  Laptop,
  Moon,
  Sun,
  Share2,
} from 'lucide-react';
import { AccountBackup, HostingAccount, DomainEntity } from '../../types';
import { CloudProApi } from '../../services/api';
import { db } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';

export interface BackupManagerProps {
  account: HostingAccount;
  preselectedDomain?: string;
  initialTab?: 'backup_domain' | 'restore_domain' | 'backup_archives' | 'persistent_vault' | 'cloud_failover';
  mode?: 'backup' | 'restore' | 'all';
  onNavigateTab?: (tab: string, domain?: string) => void;
}

interface ServerDomainItem {
  id: string;
  domain: string;
  type: 'primary' | 'subdomain' | 'addon';
  documentRoot: string;
  accountId: string;
  username: string;
  phpVersion: string;
  filesCount: number;
  totalSizeBytes: number;
  formattedSize: string;
}

interface ServerBackupItem {
  id: string;
  fileName: string;
  domain: string;
  documentRoot: string;
  type: 'full' | 'database' | 'files';
  sizeBytes: number;
  formattedSize: string;
  createdAt: string;
  downloadUrl: string;
  notes?: string;
}

interface BackupJobState {
  id: string;
  type: string;
  status: 'pending' | 'downloading' | 'snapshotting' | 'extracting' | 'permissions' | 'completed' | 'error';
  progress: number;
  message: string;
  updatedAt: string;
  targetDomain?: string;
  targetDir?: string;
  result?: any;
  error?: string;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  account,
  preselectedDomain,
  initialTab,
  mode = 'all',
  onNavigateTab,
}) => {
  const { currentUser } = useAuth();
  const { showToast, refreshAll, confirmAction } = useServer();

  if (!currentUser) return null;

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<'backup_domain' | 'restore_domain' | 'backup_archives' | 'persistent_vault' | 'cloud_failover'>(
    initialTab || (mode === 'restore' ? 'restore_domain' : 'backup_domain')
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (mode === 'restore' && activeTab === 'backup_domain') {
      setActiveTab('restore_domain');
    } else if (mode === 'backup' && activeTab === 'restore_domain') {
      setActiveTab('backup_domain');
    }
  }, [initialTab, mode]);

  // Domains & Subdomains for this account
  const [serverDomains, setServerDomains] = useState<ServerDomainItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>(
    preselectedDomain || account?.primaryDomain || 'karsacloud.biz.id'
  );
  const [selectedDocRoot, setSelectedDocRoot] = useState<string>(account?.documentRoot || '/public_html');

  // Backups lists (server + local db)
  const [serverBackups, setServerBackups] = useState<ServerBackupItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);

  // --- Create Backup State ---
  const [backupType, setBackupType] = useState<'full' | 'database' | 'files'>('full');
  const [includeConfigManifest, setIncludeConfigManifest] = useState<boolean>(true);
  const [backupNotes, setBackupNotes] = useState<string>('');
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [createdBackupResult, setCreatedBackupResult] = useState<ServerBackupItem | null>(null);

  // --- Restore State ---
  const [restoreSourceType, setRestoreSourceType] = useState<'server_archive' | 'remote_url' | 'upload_zip'>('server_archive');
  const [selectedArchiveFile, setSelectedArchiveFile] = useState<string>('');
  const [uploadedRestoreFile, setUploadedRestoreFile] = useState<File | null>(null);
  const [isUploadingRestoreFile, setIsUploadingRestoreFile] = useState<boolean>(false);
  const [remoteZipUrl, setRemoteZipUrl] = useState<string>('');
  const [remoteAuthType, setRemoteAuthType] = useState<'none' | 'basic' | 'bearer' | 'custom_header'>('none');
  const [remoteAuthUser, setRemoteAuthUser] = useState<string>('');
  const [remoteAuthPass, setRemoteAuthPass] = useState<string>('');
  const [remoteBearerToken, setRemoteBearerToken] = useState<string>('');
  const [remoteHeaderName, setRemoteHeaderName] = useState<string>('');
  const [remoteHeaderValue, setRemoteHeaderValue] = useState<string>('');

  // Restore options
  const [restoreSafetySnapshot, setRestoreSafetySnapshot] = useState<boolean>(true);
  const [restoreCleanDestination, setRestoreCleanDestination] = useState<boolean>(false);
  const [restoreAutoFlatten, setRestoreAutoFlatten] = useState<boolean>(true);
  const [restoreFixPermissions, setRestoreFixPermissions] = useState<boolean>(true);
  const [restoreImportDatabase, setRestoreImportDatabase] = useState<boolean>(true);
  const [restoreAutoDeleteZip, setRestoreAutoDeleteZip] = useState<boolean>(false);

  // Probe Remote URL State
  const [isProbingRemote, setIsProbingRemote] = useState<boolean>(false);
  const [remoteProbeInfo, setRemoteProbeInfo] = useState<{
    ok: boolean;
    httpStatus: number;
    formattedSize?: string;
    fileName?: string;
    serverHeader?: string;
    message?: string;
  } | null>(null);

  // Active Job Progress
  const [activeJob, setActiveJob] = useState<BackupJobState | null>(null);
  const [isPollingJob, setIsPollingJob] = useState<boolean>(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Persistent Vault State
  const [keepDataOnUpdate, setKeepDataOnUpdate] = useState<boolean>(() =>
    typeof db.isDataRetentionEnabled === 'function' ? db.isDataRetentionEnabled() : true
  );
  const [isSyncingVault, setIsSyncingVault] = useState(false);
  const [isRestoringVault, setIsRestoringVault] = useState(false);
  const [isCleaningDisk, setIsCleaningDisk] = useState(false);
  const [vaultPath, setVaultPath] = useState<string>('~/.cloudpro-persistent-vault');
  const [lastVaultSync, setLastVaultSync] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));
  const [copiedCmd, setCopiedCmd] = useState(false);
  const vaultFileInputRef = useRef<HTMLInputElement>(null);
  const localZipInputRef = useRef<HTMLInputElement>(null);

  // Cloud Failover & Google Cloud State
  const [isExportingCloud, setIsExportingCloud] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [copiedNightSyncCmd, setCopiedNightSyncCmd] = useState<boolean>(false);
  const [copiedMorningSyncCmd, setCopiedMorningSyncCmd] = useState<boolean>(false);
  const [copiedGdriveCmd, setCopiedGdriveCmd] = useState<boolean>(false);

  const handleExportToCloud = async () => {
    setIsExportingCloud(true);
    setCloudSyncStatus('syncing');
    try {
      const res = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          domain: selectedDomain,
          documentRoot: selectedDocRoot,
          backupType: 'full',
          includeConfig: true,
          notes: `Cloud Snapshot Failover ${selectedDomain} (${new Date().toLocaleDateString('id-ID')})`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Gagal membuat snapshot cadangan.');

      setCloudSyncStatus('synced');
      loadBackups();
      showToast(
        'success',
        'Snapshot Cloud Berhasil Dibuat!',
        `Berkas cadangan ${data.backup?.fileName} siap diunduh dan disinkronkan ke Cloud!`
      );
      if (data.backup?.downloadUrl) {
        window.open(data.backup.downloadUrl, '_blank');
      }
    } catch (err: any) {
      setCloudSyncStatus('idle');
      showToast('error', 'Gagal Ekspor Snapshot', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsExportingCloud(false);
    }
  };

  // Load server domains and backups safely with AbortController timeout
  const loadDomains = async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const q = new URLSearchParams({
        role: currentUser?.role || 'admin',
        userId: currentUser?.id || '',
        accountId: account?.id || '',
        username: currentUser?.username || '',
      });
      const res = await fetch(`/api/backup/domains?${q.toString()}`, {
        signal: controller.signal,
        headers: {
          'x-cloudpro-role': currentUser?.role || 'admin',
          'x-cloudpro-user-id': currentUser?.id || '',
          'x-cloudpro-account-id': account?.id || '',
          'x-cloudpro-username': currentUser?.username || '',
        },
      });
      clearTimeout(timer);

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.ok && Array.isArray(data.domains)) {
            const knownEduPrefixes = new Set([
              'siakad-madrasah', 'rdm', 'cbt', 'elearning', 'ppdb', 'perpustakaan',
              'simpatika', 'emis', 'absensi-gtk', 'adm-madrasah', 'kartu-pelajar', 'modul-ajar'
            ]);

            let filteredDomains: ServerDomainItem[] = [];

            if (currentUser?.role === 'admin') {
              // ROOT ADMIN sees ALL domains and subdomains across the server (excluding only phantom duplicates)
              filteredDomains = data.domains.filter((d: ServerDomainItem) => {
                const dLower = (d.domain || '').toLowerCase();
                if (dLower.endsWith('.karsacloud.biz.id')) {
                  const pfx = dLower.replace('.karsacloud.biz.id', '');
                  if (knownEduPrefixes.has(pfx)) return false;
                }
                return true;
              });

              // Merge any subdomains from local db that might not be in server list yet
              for (const ld of db.getDomains()) {
                const ldLower = ld.domain.toLowerCase();
                if (ldLower.endsWith('.karsacloud.biz.id')) {
                  const pfx = ldLower.replace('.karsacloud.biz.id', '');
                  if (knownEduPrefixes.has(pfx)) continue;
                }
                if (!filteredDomains.some(fd => fd.domain.toLowerCase() === ldLower)) {
                  filteredDomains.push({
                    id: ld.id,
                    domain: ld.domain,
                    type: ld.type as any,
                    documentRoot: ld.documentRoot || '/public_html',
                    accountId: ld.accountId,
                    username: 'cloudpro',
                    phpVersion: ld.phpVersion || '8.2',
                    filesCount: 0,
                    totalSizeBytes: 0,
                    formattedSize: '0 B',
                  });
                }
              }
            } else if (currentUser?.role === 'reseller') {
              // RESELLER sees their own primary domain, ALL their subdomains, and their clients' domains
              const isDenbaguse = currentUser?.username === 'denbaguse' || account?.primaryDomain === 'denbaguse.my.id';
              filteredDomains = data.domains.filter((d: ServerDomainItem) => {
                const dLower = (d.domain || '').toLowerCase();
                if (isDenbaguse) {
                  return dLower.endsWith('denbaguse.my.id') || dLower === 'denbaguse.my.id' || knownEduPrefixes.has(dLower.split('.')[0]);
                }
                if (account?.primaryDomain) {
                  const accDom = account.primaryDomain.toLowerCase();
                  return dLower === accDom || dLower.endsWith(`.${accDom}`);
                }
                return true;
              });

              // Also merge subdomains from db for this reseller account
              const resellerAccId = account?.id || (isDenbaguse ? 'acc-denbaguse-01' : 'acc-school-02');
              const localResellerDoms = db.getDomains(resellerAccId);
              for (const ld of localResellerDoms) {
                if (!filteredDomains.some(fd => fd.domain.toLowerCase() === ld.domain.toLowerCase())) {
                  filteredDomains.push({
                    id: ld.id,
                    domain: ld.domain,
                    type: ld.type as any,
                    documentRoot: ld.documentRoot || '/public_html',
                    accountId: ld.accountId,
                    username: currentUser?.username || 'reseller',
                    phpVersion: ld.phpVersion || '8.2',
                    filesCount: 0,
                    totalSizeBytes: 0,
                    formattedSize: '0 B',
                  });
                }
              }
            } else {
              // Customer sees their own domains
              filteredDomains = data.domains.filter((d: ServerDomainItem) => {
                const accDom = (account?.primaryDomain || 'client.karsacloud.biz.id').toLowerCase();
                const dLower = (d.domain || '').toLowerCase();
                return dLower === accDom || dLower.endsWith(`.${accDom}`);
              });
            }

            setServerDomains(filteredDomains);
            const initial = filteredDomains.find(
              (d: ServerDomainItem) => d.domain.toLowerCase() === (preselectedDomain || account?.primaryDomain || '').toLowerCase()
            ) || filteredDomains[0];
            if (initial) {
              setSelectedDomain(initial.domain);
              setSelectedDocRoot(initial.documentRoot);
            }
            return;
          }
        } catch {}
      }
    } catch {}

    // Fallback to local db domains
    const isDenFallback = currentUser?.username === 'denbaguse' || account?.primaryDomain === 'denbaguse.my.id';
    const accId = account?.id || (currentUser?.role === 'admin' ? 'acc-rdm-01' : isDenFallback ? 'acc-denbaguse-01' : 'acc-school-02');
    const accDomain = account?.primaryDomain || (currentUser?.role === 'admin' ? 'karsacloud.biz.id' : isDenFallback ? 'denbaguse.my.id' : 'client.karsacloud.biz.id');
    const accUser = account?.username || (currentUser?.role === 'admin' ? 'karsacloud' : isDenFallback ? 'denbaguse' : 'pelanggan');
    const localDoms = currentUser?.role === 'admin' ? db.getDomains() : db.getDomains(accId);
    const mapped: ServerDomainItem[] = [
      {
        id: 'dom-primary',
        domain: accDomain,
        type: 'primary',
        documentRoot: '/public_html',
        accountId: accId,
        username: accUser,
        phpVersion: '8.2',
        filesCount: db.getVirtualFiles(accId).length,
        totalSizeBytes: 10485760,
        formattedSize: '10.5 MB',
      },
      ...localDoms
        .filter(d => d.domain.toLowerCase() !== accDomain.toLowerCase())
        .map(d => ({
          id: d.id,
          domain: d.domain,
          type: d.type as any,
          documentRoot: d.documentRoot ? d.documentRoot.replace(`/home/${accUser}`, '') : '/public_html',
          accountId: d.accountId || accId,
          username: accUser,
          phpVersion: d.phpVersion || '8.2',
          filesCount: 0,
          totalSizeBytes: 0,
          formattedSize: '0 B',
        })),
    ];
    setServerDomains(mapped);
  };

  const loadBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const q = new URLSearchParams({
        role: currentUser?.role || 'admin',
        userId: currentUser?.id || '',
        accountId: account?.id || '',
        username: currentUser?.username || '',
      });
      const res = await fetch(`/api/backup/list?${q.toString()}`, {
        signal: controller.signal,
        headers: {
          'x-cloudpro-role': currentUser?.role || 'admin',
          'x-cloudpro-user-id': currentUser?.id || '',
          'x-cloudpro-account-id': account?.id || '',
          'x-cloudpro-username': currentUser?.username || '',
        },
      });
      clearTimeout(timer);

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.ok && Array.isArray(data.backups)) {
            const filteredBackups = currentUser?.role === 'admin'
              ? data.backups
              : data.backups.filter((b: ServerBackupItem) =>
                  b.domain.toLowerCase() !== 'karsacloud.biz.id' &&
                  !b.domain.toLowerCase().endsWith('.karsacloud.biz.id') &&
                  b.fileName.toLowerCase().indexOf('karsacloud') === -1
                );
            setServerBackups(filteredBackups);
            if (filteredBackups.length > 0 && !selectedArchiveFile) {
              setSelectedArchiveFile(filteredBackups[0].fileName);
            }
          }
        } catch {}
      }
    } catch {} finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    loadDomains();
    loadBackups();
  }, [account?.id]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch('/api/vault/state', { signal: controller.signal })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        clearTimeout(timer);
        if (data?.vaultPath) setVaultPath(data.vaultPath);
        if (data?.lastSavedAt) {
          setLastVaultSync(new Date(data.lastSavedAt).toLocaleString('id-ID'));
        }
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  // Update selected doc root when domain selection changes
  const handleDomainChange = (domName: string) => {
    setSelectedDomain(domName);
    const found = serverDomains.find(d => d.domain.toLowerCase() === domName.toLowerCase());
    if (found) {
      setSelectedDocRoot(found.documentRoot);
    }
  };

  // --- Handlers: Probe Remote Zip ---
  const handleProbeRemoteZip = async () => {
    if (!remoteZipUrl.trim()) {
      showToast('error', 'URL Remote Kosong', 'Masukkan URL file .zip dari server sumber yang ingin diuji.');
      return;
    }
    setIsProbingRemote(true);
    setRemoteProbeInfo(null);
    try {
      const res = await fetch('/api/cloner/server-zip-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipUrl: remoteZipUrl.trim(),
          authType: remoteAuthType,
          authUsername: remoteAuthUser.trim(),
          authPassword: remoteAuthPass.trim(),
          bearerToken: remoteBearerToken.trim(),
          customHeaderName: remoteHeaderName.trim(),
          customHeaderValue: remoteHeaderValue.trim(),
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server remote mengembalikan respon bukan JSON (${res.status} ${res.statusText}).`);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal menjangkau URL file ZIP remote.');
      }

      setRemoteProbeInfo({
        ok: true,
        httpStatus: data.httpStatus,
        formattedSize: data.formattedSize,
        fileName: data.fileName,
        serverHeader: data.serverHeader,
      });

      showToast(
        'success',
        'Koneksi Berhasil!',
        `File ${data.fileName} (${data.formattedSize}) terdeteksi siap di-restore ke server.`
      );
    } catch (err: any) {
      setRemoteProbeInfo({
        ok: false,
        httpStatus: 0,
        message: err?.message || 'Server remote tidak merespons.',
      });
      showToast('error', 'Uji Koneksi Gagal', err?.message || 'Server remote tidak dapat diakses.');
    } finally {
      setIsProbingRemote(false);
    }
  };

  // --- Handlers: Create Domain Backup .ZIP ---
  const handleCreateDomainBackup = async () => {
    setIsCreatingBackup(true);
    setCreatedBackupResult(null);
    try {
      const res = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          domain: selectedDomain,
          documentRoot: selectedDocRoot,
          backupType,
          includeConfig: includeConfigManifest,
          notes: backupNotes.trim() || `Cadangan .ZIP ${selectedDomain} (${backupType})`,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server mengembalikan respon tidak terduga (${res.status} ${res.statusText}).`);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal membuat file cadangan .ZIP.');
      }

      setCreatedBackupResult(data.backup);
      showToast(
        'success',
        'Backup .ZIP Berhasil Dibuat!',
        `Arsip ${data.backup.fileName} (${data.backup.formattedSize}) siap diunduh dan tersimpan di server.`
      );

      // Save to local DB list as well
      const newBackupRecord: AccountBackup = {
        id: data.backup.id,
        accountId: account.id,
        accountDomain: account.primaryDomain,
        targetDomain: selectedDomain,
        documentRoot: selectedDocRoot,
        fileName: data.backup.fileName,
        type: backupType,
        sizeMb: Math.round((data.backup.sizeBytes / (1024 * 1024)) * 10) / 10,
        formattedSize: data.backup.formattedSize,
        status: 'ready',
        createdAt: data.backup.createdAt,
        downloadUrl: data.backup.downloadUrl,
        notes: backupNotes,
      };
      db.saveBackup(newBackupRecord);
      loadBackups();
      refreshAll();
    } catch (err: any) {
      showToast('error', 'Gagal Membuat Backup .ZIP', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // --- Polling Routine for Async Restore Job ---
  const startJobPolling = (jobId: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    setIsPollingJob(true);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/backup/job-status?jobId=${encodeURIComponent(jobId)}`);
        if (!res.ok) return;
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.ok && data.job) {
          setActiveJob(data.job);
          if (data.job.status === 'completed') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setIsPollingJob(false);
            const rStats = data.job.result || {};
            const dbSummary =
              rStats.restoredSettingsCount > 0 || rStats.restoredUploadsCount > 0
                ? ` (${rStats.restoredSettingsCount || 0} modul database & ${rStats.restoredUploadsCount || 0} media dipulihkan)`
                : '';
            const purgeSummary = rStats.autoPurgedZip
              ? ` File .ZIP (${rStats.purgedZipFormatted || ''}) otomatis dibuang dari disk.`
              : '';
            showToast(
              'success',
              'Pemulihan (Restore) Berhasil!',
              `Domain ${data.job.targetDomain} berhasil dipulihkan${dbSummary} dengan ${rStats.filesCount || ''} file aktif.${purgeSummary}`
            );
            loadDomains();
            loadBackups();
            refreshAll();

            // Immediately scan and sync restored directory files into client VirtualFile database
            const docRootToScan = data.job.targetDir || selectedDocRoot || '/public_html';
            const targetDomainLower = (data.job.targetDomain || selectedDomain || '').toLowerCase();
            const matchedServerDomain = serverDomains.find(d => d.domain.toLowerCase() === targetDomainLower);
            const isDenbaguseTarget =
              targetDomainLower.includes('denbaguse') ||
              docRootToScan.includes('siakad-madrasah') ||
              docRootToScan.includes('adm-madrasah') ||
              docRootToScan.includes('absensi-gtk') ||
              docRootToScan.includes('kartu-pelajar') ||
              docRootToScan.includes('modul-ajar');
            const targetAccId =
              matchedServerDomain?.accountId ||
              (isDenbaguseTarget ? 'acc-denbaguse-01' : account.id);

            const accountsToSync = [targetAccId];
            for (const accIdToSync of accountsToSync) {
              fetch(`/api/files/disk-scan?dir=${encodeURIComponent(docRootToScan)}&accountId=${encodeURIComponent(accIdToSync)}`)
                .then(r => r.json())
                .then(scanRes => {
                  if (scanRes?.ok && Array.isArray(scanRes.files)) {
                    db.replaceDirectoryFilesFromDiskScan(accIdToSync, docRootToScan, scanRes.files.map((f: any) => ({
                      id: f.id || `vf-restored-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      accountId: accIdToSync,
                      name: f.name,
                      path: f.path,
                      type: f.type || 'file',
                      sizeBytes: f.size || 1024,
                      permissions: f.type === 'directory' ? '0755' : '0644',
                      mimeType: 'text/html',
                      updatedAt: new Date().toISOString(),
                      content: f.content,
                    })));
                  }
                  // Also scan parent /public_html so the restored folder itself is immediately indexed in /public_html
                  if (docRootToScan !== '/public_html') {
                    const folderName = docRootToScan.replace(/^\/public_html\/?/, '').split('/')[0];
                    if (folderName) {
                      db.saveVirtualFile({
                        id: `vf-dir-${folderName}-${accIdToSync}`,
                        accountId: accIdToSync,
                        name: folderName,
                        path: `/public_html/${folderName}`,
                        type: 'directory',
                        sizeBytes: 0,
                        permissions: '0755',
                        updatedAt: new Date().toISOString(),
                      });
                    }
                    fetch(`/api/files/disk-scan?dir=%2Fpublic_html&accountId=${encodeURIComponent(accIdToSync)}`)
                      .then(r => r.json())
                      .then(pRes => {
                        if (pRes?.ok && Array.isArray(pRes.files)) {
                          db.replaceDirectoryFilesFromDiskScan(accIdToSync, '/public_html', pRes.files.map((f: any) => ({
                            id: f.id || `vf-restored-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                            accountId: accIdToSync,
                            name: f.name,
                            path: f.path,
                            type: f.type || 'file',
                            sizeBytes: f.size || 1024,
                            permissions: f.type === 'directory' ? '0755' : '0644',
                            mimeType: 'text/html',
                            updatedAt: new Date().toISOString(),
                            content: f.content,
                          })));
                        }
                      })
                      .catch(() => {});
                  }
                })
                .catch(() => {});
            }
          } else if (data.job.status === 'error') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setIsPollingJob(false);
            showToast('error', 'Restore Gagal', data.job.error || 'Terjadi kesalahan saat memulihkan data.');
          }
        }
      } catch {}
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  // --- Handlers: Start Restore ---
  const handleStartRestore = () => {
    if (restoreSourceType === 'remote_url' && !remoteZipUrl.trim()) {
      showToast('error', 'URL Remote Kosong', 'Masukkan URL file .zip yang ingin ditarik.');
      return;
    }
    if (restoreSourceType === 'server_archive' && !selectedArchiveFile) {
      showToast('error', 'Pilih File Arsip', 'Pilih file backup dari daftar arsip server.');
      return;
    }
    if (restoreSourceType === 'upload_zip' && !uploadedRestoreFile) {
      showToast('error', 'Pilih File Cadangan', 'Pilih file backup (.zip, .json, atau .sql) dari perangkat Anda terlebih dahulu.');
      return;
    }

    const sourceDesc =
      restoreSourceType === 'remote_url'
        ? `URL Remote: ${remoteZipUrl.trim()}`
        : restoreSourceType === 'upload_zip' && uploadedRestoreFile
        ? `Unggahan Perangkat: ${uploadedRestoreFile.name}`
        : `Arsip Server: ${selectedArchiveFile}`;

    confirmAction({
      title: `Konfirmasi Restore ke ${selectedDomain}`,
      message: `PERINGATAN: Menjalankan restore akan memperbarui data & isi direktori "${selectedDocRoot}" pada domain "${selectedDomain}" dari ${sourceDesc}. Mendukung penuh hasil backup langsung dari website (.ZIP, .JSON, .SQL) maupun Full Hosting (.ZIP). Lanjutkan?`,
      confirmText: 'Mulai Restore Sekarang',
      isDanger: true,
      onConfirm: async () => {
        try {
          let targetArchiveFileName = selectedArchiveFile;

          if (restoreSourceType === 'upload_zip' && uploadedRestoreFile) {
            setIsUploadingRestoreFile(true);
            const totalBytes = uploadedRestoreFile.size;
            const totalMbStr = (totalBytes / (1024 * 1024)).toFixed(1);
            // 5 MB per chunk to bypass Cloudflare 100MB request limit and handle 200MB-500MB+ smoothly
            const CHUNK_SIZE = 5 * 1024 * 1024;
            const totalChunks = Math.max(1, Math.ceil(totalBytes / CHUNK_SIZE));
            let finalUploadedFileName = uploadedRestoreFile.name;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
              const start = chunkIndex * CHUNK_SIZE;
              const end = Math.min(start + CHUNK_SIZE, totalBytes);
              const chunkBlob = uploadedRestoreFile.slice(start, end);
              const uploadedMbStr = (end / (1024 * 1024)).toFixed(1);
              const pct = Math.min(48, Math.max(8, Math.round(((chunkIndex + 1) / totalChunks) * 45)));

              setActiveJob({
                id: 'uploading-local',
                type: 'backup_restore',
                status: 'downloading',
                progress: pct,
                message:
                  totalChunks > 1
                    ? `Mengunggah berkas ${uploadedRestoreFile.name} (Bagian ${chunkIndex + 1}/${totalChunks} — ${uploadedMbStr} MB / ${totalMbStr} MB)...`
                    : `Mengunggah berkas ${uploadedRestoreFile.name} (${totalMbStr} MB) ke server Cloud PRO...`,
                updatedAt: new Date().toISOString(),
                targetDomain: selectedDomain,
                targetDir: selectedDocRoot,
              });

              const chunkUrl = `/api/backup/upload-chunk?fileName=${encodeURIComponent(
                uploadedRestoreFile.name
              )}&chunkIndex=${chunkIndex}&totalChunks=${totalChunks}&tempForRestore=${
                restoreAutoDeleteZip ? '1' : '0'
              }`;

              const uploadRes = await fetch(chunkUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: chunkBlob,
              });
              const uploadText = await uploadRes.text();
              let uploadData: any = {};
              try {
                uploadData = JSON.parse(uploadText);
              } catch {
                throw new Error(`Gagal mengunggah bagian #${chunkIndex + 1} (${uploadRes.status}).`);
              }
              if (!uploadRes.ok || !uploadData.ok || !uploadData.fileName) {
                throw new Error(uploadData.message || 'Gagal mengunggah berkas cadangan ke server.');
              }
              finalUploadedFileName = uploadData.fileName;
            }

            targetArchiveFileName = finalUploadedFileName;
            setIsUploadingRestoreFile(false);
          }

          const res = await fetch('/api/backup/restore-async', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceType: restoreSourceType === 'remote_url' ? 'remote_url' : 'server_file',
              backupFileName: targetArchiveFileName,
              remoteZipUrl: remoteZipUrl.trim(),
              targetDomain: selectedDomain,
              targetDir: selectedDocRoot,
              createSnapshotBefore: restoreSafetySnapshot,
              cleanDestination: restoreCleanDestination,
              autoFlatten: restoreAutoFlatten,
              fixPermissions: restoreFixPermissions,
              importDatabase: restoreImportDatabase,
              autoDeleteZip: restoreAutoDeleteZip,
              authType: remoteAuthType,
              authUsername: remoteAuthUser.trim(),
              authPassword: remoteAuthPass.trim(),
              bearerToken: remoteBearerToken.trim(),
              customHeaderName: remoteHeaderName.trim(),
              customHeaderValue: remoteHeaderValue.trim(),
            }),
          });

          const text = await res.text();
          let data: any = {};
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error(`Server merespons bukan JSON (${res.status} ${res.statusText}).`);
          }

          if (!res.ok || !data.ok) {
            throw new Error(data.message || 'Gagal memulai background job pemulihan.');
          }

          setActiveJob({
            id: data.jobId,
            type: restoreSourceType === 'remote_url' ? 'server_zip_pull' : 'backup_restore',
            status: 'pending',
            progress: 20,
            message: 'Memulai background worker restorasi di server Linux...',
            updatedAt: new Date().toISOString(),
            targetDomain: selectedDomain,
            targetDir: selectedDocRoot,
          });

          startJobPolling(data.jobId);
          showToast('info', 'Tugas Restore Berjalan', 'Proses pemulihan sedang dieksekusi di background server.');
        } catch (err: any) {
          setIsUploadingRestoreFile(false);
          setActiveJob(null);
          showToast('error', 'Gagal Menjalankan Restore', err?.message || 'Terjadi kesalahan sistem.');
        }
      },
    });
  };

  // --- Handlers: Delete Server Backup ---
  const handleDeleteServerBackup = (fileName: string) => {
    confirmAction({
      title: 'Hapus Berkas Cadangan',
      message: `Hapus permanen file backup "${fileName}" dari penyimpanan server? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Berkas',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/backup/delete/${encodeURIComponent(fileName)}`, {
            method: 'DELETE',
          });
          const text = await res.text();
          let data: any = {};
          try { data = JSON.parse(text); } catch {}
          if (res.ok && data?.ok) {
            showToast('info', 'Berkas Dihapus', `Arsip ${fileName} telah dihapus.`);
            loadBackups();
            refreshAll();
          } else {
            showToast('error', 'Gagal Menghapus', data?.message || 'Gagal menghapus berkas.');
          }
        } catch (err: any) {
          showToast('error', 'Kesalahan', err?.message || 'Gagal menghapus berkas.');
        }
      },
    });
  };

  // --- Vault Handlers ---
  const handleToggleKeepData = async (nextVal: boolean) => {
    setKeepDataOnUpdate(nextVal);
    db.setDataRetentionEnabled(nextVal);
    db.syncToPersistentVault(true);
    try {
      await fetch('/api/vault/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: nextVal }),
      });
    } catch {}
    showToast(
      nextVal ? 'success' : 'info',
      nextVal ? 'Proteksi Data Aktif' : 'Proteksi Data Nonaktif',
      nextVal
        ? 'Seluruh file website, domain, dan konfigurasi dikunci permanen di Persistent Vault agar tidak hilang saat update.'
        : 'Mode kunci dinonaktifkan.'
    );
  };

  const handleLockDataNow = async () => {
    setIsSyncingVault(true);
    try {
      db.setDataRetentionEnabled(true);
      setKeepDataOnUpdate(true);
      db.syncToPersistentVault(true);
      await new Promise(r => setTimeout(r, 400));
      setLastVaultSync(new Date().toLocaleString('id-ID'));
      showToast(
        'success',
        'Data Berhasil Dikunci!',
        `Semua data website, ${serverDomains.length} domain, dan brankas telah diamankan.`
      );
    } finally {
      setIsSyncingVault(false);
    }
  };

  const handleRestoreFromServerVault = async () => {
    setIsRestoringVault(true);
    try {
      const ok = await db.hydrateFromServerVault();
      if (ok) {
        loadDomains();
        loadBackups();
        refreshAll();
        setLastVaultSync(new Date().toLocaleString('id-ID'));
        showToast('success', 'Data Dipulihkan dari Vault', 'Data berhasil dikembalikan dari brankas server.');
      } else {
        showToast('info', 'Data Terkini', 'Data panel Anda sudah sinkron dengan vault server.');
      }
    } finally {
      setIsRestoringVault(false);
    }
  };

  const safeUpdateCommand = `mkdir -p ~/.cloudpro-persistent-vault && cp -f .cloudpro-data/*.json ~/.cloudpro-persistent-vault/ 2>/dev/null || true && git pull && npm run build`;
  const copyUpdateCmd = () => {
    navigator.clipboard?.writeText(safeUpdateCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCleanDiskJunk = async () => {
    setIsCleaningDisk(true);
    try {
      const res = await fetch('/api/system/clean-disk', { method: 'POST' });
      const data = await res.json();
      if (data?.ok) {
        await loadDomains();
        await loadBackups();
        refreshAll();
        showToast(
          'success',
          'Sampah Disk Berhasil Dibersihkan!',
          data.message || `Disk sudah 100% bersih dan optimal! Total aktif: ${data.totalActiveFormatted}.`
        );
      } else {
        showToast('error', 'Gagal Membersihkan Disk', data?.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Membersihkan Disk', err?.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setIsCleaningDisk(false);
    }
  };

  const primaryDomains = useMemo(() => {
    const list = serverDomains.filter((d: ServerDomainItem) =>
      d.type === 'primary' ||
      (account?.primaryDomain && d.domain.toLowerCase() === account.primaryDomain.toLowerCase())
    );
    if (list.length === 0 && serverDomains.length > 0) {
      return [serverDomains[0]];
    }
    return list;
  }, [serverDomains, account?.primaryDomain]);

  const subdomains = useMemo(() => {
    const primaryNames = new Set(primaryDomains.map((p: ServerDomainItem) => p.domain.toLowerCase()));
    const subs = serverDomains.filter((d: ServerDomainItem) =>
      !primaryNames.has(d.domain.toLowerCase()) || d.type === 'subdomain' || d.type === 'addon'
    );

    // Merge any subdomains from db for this account that might not be in serverDomains yet
    if (account?.id) {
      const dbSubs = db.getDomains(account.id).filter(
        d => d.type === 'subdomain' || d.domain.toLowerCase() !== (account.primaryDomain || '').toLowerCase()
      );
      for (const d of dbSubs) {
        if (!subs.some(s => s.domain.toLowerCase() === d.domain.toLowerCase())) {
          subs.push({
            id: d.id,
            domain: d.domain,
            type: 'subdomain',
            documentRoot: d.documentRoot || `/public_html/${d.domain.split('.')[0]}`,
            accountId: account.id,
            username: account.username || 'client',
            phpVersion: d.phpVersion || '8.2',
            filesCount: 0,
            totalSizeBytes: 0,
            formattedSize: '0 B',
          });
        }
      }
    }

    return subs;
  }, [serverDomains, primaryDomains, account?.id, account?.primaryDomain, account?.username]);

  const currentDomainObj = serverDomains.find(d => d.domain.toLowerCase() === selectedDomain.toLowerCase());
  const isPrimarySelected = useMemo(() => {
    return primaryDomains.some((p: ServerDomainItem) => p.domain.toLowerCase() === selectedDomain.toLowerCase()) ||
      currentDomainObj?.type === 'primary';
  }, [primaryDomains, selectedDomain, currentDomainObj]);
  const isSubdomainSelected = !isPrimarySelected;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* =================================================================== */}
      {/* DOMAIN & SUBDOMAIN SCOPING BAR (KOLOM TERPISAH HINDARI SALAH KAMAR) */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 max-w-full overflow-hidden space-y-4">
        {/* Top Header Row: Title, Quick Actions & Disk Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Target Restorasi (Pemulihan Data &amp; Web)
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  isPrimarySelected
                    ? 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                }`}>
                  {isPrimarySelected ? '📍 KAMAR: DOMAIN UTAMA' : '📍 KAMAR: SUB DOMAIN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih kamar tujuan pada kolom di bawah. Sub domain memiliki kolom khusus terpisah agar tidak salah kamar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-slate-400 mr-1.5">Berkas di Disk:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {currentDomainObj?.filesCount || 0} File ({currentDomainObj?.formattedSize || '0 B'})
              </strong>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('disk-cleaner')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                title="Buka Modul Disk Cleaner untuk pembersihan sampah disk terpisah"
              >
                <Trash2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Modul Disk Cleaner</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => { loadDomains(); loadBackups(); }}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Perbarui Data Domain & Ukuran"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2 DEDICATED COLUMNS: DOMAIN UTAMA VS SUB DOMAIN (HINDARI SALAH KAMAR) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* KOLOM 1: DOMAIN UTAMA */}
          <div className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
            isPrimarySelected
              ? 'border-sky-500 bg-gradient-to-br from-sky-50/90 to-blue-50/50 dark:border-sky-500 dark:from-sky-950/40 dark:to-slate-900 ring-2 ring-sky-500/20 shadow-xs'
              : 'border-slate-200 bg-slate-50/60 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isPrimarySelected ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Kolom Domain Utama
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Root VHost (/public_html)
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                  isPrimarySelected
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {isPrimarySelected ? '✓ AKTIF DIPILIH' : 'DOMAIN UTAMA'}
                </span>
              </div>

              {primaryDomains.length <= 1 ? (
                <div
                  onClick={() => primaryDomains[0] && handleDomainChange(primaryDomains[0].domain)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isPrimarySelected
                      ? 'border-sky-400 bg-white dark:bg-slate-900 shadow-2xs'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {primaryDomains[0]?.domain || account?.primaryDomain}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-mono shrink-0">
                      {primaryDomains[0]?.formattedSize || '0 B'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Folder: <code className="text-sky-600 dark:text-sky-400 font-bold">{primaryDomains[0]?.documentRoot || '/public_html'}</code>
                  </div>
                </div>
              ) : (
                <select
                  value={isPrimarySelected ? selectedDomain : ''}
                  onChange={e => e.target.value && handleDomainChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer font-mono"
                >
                  <option value="" disabled>-- Pilih Domain Utama --</option>
                  {primaryDomains.map((d: ServerDomainItem) => (
                    <option key={d.id} value={d.domain}>
                      {d.domain} ({d.documentRoot}) — {d.formattedSize || '0 B'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {isPrimarySelected ? '📁 File diekstrak ke root utama' : 'Klik tombol untuk pilih domain utama'}
              </span>
              <button
                type="button"
                onClick={() => primaryDomains[0] && handleDomainChange(primaryDomains[0].domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isPrimarySelected
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'
                }`}
              >
                {isPrimarySelected ? '✓ Kamar Utama Aktif' : 'Pilih Kamar Ini'}
              </button>
            </div>
          </div>

          {/* KOLOM 2: SUB DOMAIN (KOLOM KHUSUS HINDARI SALAH KAMAR) */}
          <div className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
            isSubdomainSelected
              ? 'border-amber-500 bg-gradient-to-br from-amber-50/90 to-orange-50/50 dark:border-amber-500 dark:from-amber-950/40 dark:to-slate-900 ring-2 ring-amber-500/20 shadow-xs'
              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSubdomainSelected ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Kolom Sub Domain
                    </h4>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      🛡️ Pilihan Kamar Terpisah (Hindari Salah Kamar)
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                  isSubdomainSelected
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {isSubdomainSelected ? '✓ AKTIF DIPILIH' : `TERSEDIA (${subdomains.length})`}
                </span>
              </div>

              {subdomains.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-white/50 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
                  Belum ada subdomain terdaftar di akun ini.
                </div>
              ) : (
                <>
                  <select
                    value={isSubdomainSelected ? selectedDomain : ''}
                    onChange={e => e.target.value && handleDomainChange(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer font-mono"
                  >
                    <option value="" disabled>-- Pilih Sub Domain Target (Kamar Khusus) --</option>
                    {subdomains.map((d: ServerDomainItem) => (
                      <option key={d.id} value={d.domain}>
                        {d.domain} ({d.documentRoot}) — {d.formattedSize || '0 B'}
                      </option>
                    ))}
                  </select>

                  {/* Quick Subdomain Pills */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {subdomains.map((d: ServerDomainItem) => {
                      const isThisSubActive = selectedDomain.toLowerCase() === d.domain.toLowerCase();
                      const prefix = d.domain.split('.')[0];
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleDomainChange(d.domain)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            isThisSubActive
                              ? 'bg-amber-600 text-white shadow-2xs scale-102 ring-1 ring-amber-400'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                          title={`Target: ${d.documentRoot}`}
                        >
                          <FolderOpen className="h-3 w-3 shrink-0" />
                          <span>{prefix}</span>
                          <span className="text-[9px] opacity-75 font-sans">({d.formattedSize || '0 B'})</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {isSubdomainSelected ? `🔒 Kamar terisolasi di ${selectedDocRoot}` : 'Pilih subdomain agar tidak salah kamar'}
              </span>
              {subdomains.length > 0 && !isSubdomainSelected && (
                <button
                  type="button"
                  onClick={() => subdomains[0] && handleDomainChange(subdomains[0].domain)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 cursor-pointer"
                >
                  Pilih Subdomain Pertama
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE TARGET CONFIRMATION BANNER */}
        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
          isPrimarySelected
            ? 'border-sky-300 bg-sky-50 dark:border-sky-800/80 dark:bg-sky-950/40 text-sky-950 dark:text-sky-200'
            : 'border-amber-300 bg-amber-50 dark:border-amber-800/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {isPrimarySelected ? (
              <Globe className="h-4 w-4 text-sky-600 shrink-0" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
            )}
            <div className="min-w-0 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Target Restorasi Aktif: </span>
              <strong className="font-mono font-black text-slate-900 dark:text-white">{selectedDomain}</strong>
              <span className="mx-1.5 text-slate-400">&rarr;</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Folder Kamar: </span>
              <code className="font-mono font-bold text-orange-600 dark:text-orange-400">{selectedDocRoot}</code>
            </div>
          </div>
          <div className="text-[11px] font-bold shrink-0">
            {isPrimarySelected ? (
              <span className="text-sky-800 bg-sky-200/70 px-2 py-0.5 rounded">
                Kamar: Domain Utama (/public_html)
              </span>
            ) : (
              <span className="text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                ✓ Aman: Terkunci di Kamar Subdomain (Tidak Menimpa Root)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ACTIVE RUNNING JOB PROGRESS BAR                                     */}
      {/* =================================================================== */}
      {activeJob && activeJob.status !== 'completed' && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-orange-950/40 p-5 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {activeJob.status === 'downloading'
                    ? 'Mengunduh Berkas ZIP Antar Server...'
                    : activeJob.status === 'snapshotting'
                    ? 'Membuat Safety Snapshot Sebelum Menimpa...'
                    : activeJob.status === 'extracting'
                    ? 'Mengekstrak Berkas & Meratakan Direktori...'
                    : activeJob.status === 'permissions'
                    ? 'Mengatur Hak Akses Linux (0755/0644)...'
                    : 'Memproses Pemulihan Data...'}
                </h4>
                <p className="text-xs text-amber-200/80">
                  Target: <strong>{activeJob.targetDomain}</strong> &rarr; <code>{activeJob.targetDir}</code>
                </p>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-amber-300">
              {activeJob.progress}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.max(activeJob.progress, 5)}%` }}
            />
          </div>

          <p className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <Server className="h-3 w-3 text-amber-400" />
            <span>{activeJob.message}</span>
          </p>
        </div>
      )}

      {/* =================================================================== */}
      {/* TOP NAVIGATION TABS (ADAPTIVE PER MODULE MODE)                     */}
      {/* =================================================================== */}
      <div className={`grid gap-3 ${mode === 'backup' || mode === 'restore' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {(mode === 'all' || mode === 'backup') && (
          <button
            type="button"
            onClick={() => setActiveTab('backup_domain')}
            className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
              activeTab === 'backup_domain'
                ? 'border-orange-600 bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md ring-2 ring-orange-400/50'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            <Archive className={`h-5 w-5 shrink-0 ${activeTab === 'backup_domain' ? 'text-white' : 'text-orange-500'}`} />
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Cadangkan Domain</span>
                <span className={`rounded px-1 py-0.2 text-[8px] font-extrabold ${activeTab === 'backup_domain' ? 'bg-orange-800/80 text-orange-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'}`}>
                  .ZIP
                </span>
              </div>
              <div className={`text-[10px] ${activeTab === 'backup_domain' ? 'text-orange-100' : 'text-slate-400'}`}>
                Buat Arsip .ZIP Cepat
              </div>
            </div>
          </button>
        )}

        {(mode === 'all' || mode === 'restore') && (
          <button
            type="button"
            onClick={() => setActiveTab('restore_domain')}
            className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
              activeTab === 'restore_domain'
                ? 'border-sky-600 bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md ring-2 ring-sky-400/50'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            <RotateCcw className={`h-5 w-5 shrink-0 ${activeTab === 'restore_domain' ? 'text-white' : 'text-sky-500'}`} />
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Pulihkan (Restore)</span>
                <span className={`rounded px-1 py-0.2 text-[8px] font-extrabold ${activeTab === 'restore_domain' ? 'bg-sky-800/80 text-sky-200' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'}`}>
                  3 CARA
                </span>
              </div>
              <div className={`text-[10px] ${activeTab === 'restore_domain' ? 'text-sky-100' : 'text-slate-400'}`}>
                Server, URL Remote &amp; Upload
              </div>
            </div>
          </button>
        )}

        {(mode === 'all' || mode === 'backup') && (
          <button
            type="button"
            onClick={() => setActiveTab('backup_archives')}
            className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
              activeTab === 'backup_archives'
                ? 'border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md ring-2 ring-indigo-400/50'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            <HardDrive className={`h-5 w-5 shrink-0 ${activeTab === 'backup_archives' ? 'text-white' : 'text-indigo-500'}`} />
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Arsip Berkas Server</span>
                <span className="text-[10px] font-bold text-slate-400">({serverBackups.length})</span>
              </div>
              <div className={`text-[10px] ${activeTab === 'backup_archives' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Unduh &amp; Kelola .ZIP
              </div>
            </div>
          </button>
        )}

        {(mode === 'all' || mode === 'restore') && (
          <button
            type="button"
            onClick={() => setActiveTab('persistent_vault')}
            className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
              activeTab === 'persistent_vault'
                ? 'border-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            <ShieldCheck className={`h-5 w-5 shrink-0 ${activeTab === 'persistent_vault' ? 'text-white' : 'text-emerald-500'}`} />
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Persistent Vault</span>
                <span className={`rounded px-1 py-0.2 text-[8px] font-extrabold ${activeTab === 'persistent_vault' ? 'bg-emerald-800/80 text-emerald-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                  AMAN
                </span>
              </div>
              <div className={`text-[10px] ${activeTab === 'persistent_vault' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Kunci Data Saat Update
              </div>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('cloud_failover')}
          className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
            activeTab === 'cloud_failover'
              ? 'border-violet-600 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md ring-2 ring-violet-400/50'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
          }`}
        >
          <Cloud className={`h-5 w-5 shrink-0 ${activeTab === 'cloud_failover' ? 'text-white' : 'text-violet-500'}`} />
          <div>
            <div className="text-xs font-bold flex items-center gap-1">
              <span>Cloud &amp; Failover PC Mati</span>
              <span className={`rounded px-1 py-0.2 text-[8px] font-extrabold ${activeTab === 'cloud_failover' ? 'bg-violet-800/80 text-violet-200' : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'}`}>
                24 JAM
              </span>
            </div>
            <div className={`text-[10px] ${activeTab === 'cloud_failover' ? 'text-violet-100' : 'text-slate-400'}`}>
              Google Cloud, Unduh &amp; Sync
            </div>
          </div>
        </button>

        {/* Cross Module Jump Buttons */}
        {mode === 'backup' && (
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('restore', selectedDomain) : setActiveTab('restore_domain')}
            className="flex items-center justify-between rounded-xl border border-sky-300 bg-sky-50/70 p-3.5 text-left hover:bg-sky-100/80 dark:border-sky-800 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <div>
                <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  Modul Restore
                </div>
                <div className="text-[10px] text-sky-700 dark:text-sky-300">
                  Pulihkan website dari arsip / ZIP
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </button>
        )}

        {mode === 'restore' && (
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('backups', selectedDomain) : setActiveTab('backup_domain')}
            className="flex items-center justify-between rounded-xl border border-orange-300 bg-orange-50/70 p-3.5 text-left hover:bg-orange-100/80 dark:border-orange-800 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Archive className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-xs font-bold text-orange-900 dark:text-orange-200">
                  Modul Backup
                </div>
                <div className="text-[10px] text-orange-700 dark:text-orange-300">
                  Buat snapshot cadangan baru
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </button>
        )}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: CADANGKAN DOMAIN / SUBDOMAIN (.ZIP)                          */}
      {/* =================================================================== */}
      {activeTab === 'backup_domain' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Archive className="h-5 w-5 text-orange-500 shrink-0" />
                    <span>Cadangkan Berkas .ZIP: <span className="text-orange-600 dark:text-orange-400">{selectedDomain}</span></span>
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Mengemas berkas website menjadi arsip kompresi .ZIP berkecepatan tinggi menggunakan Linux Native Engine.
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-lg bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase shrink-0">
                  Linux Native Engine
                </span>
              </div>

              {/* Elemen Grid Minimalis & Elegan: Folder Sumber & Lokasi Penyimpanan Vault */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                <div className="md:col-span-4 rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40 p-3 flex items-start gap-2.5 min-w-0">
                  <FolderOpen className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Folder Sumber
                    </span>
                    <span className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={selectedDocRoot}>
                      {selectedDocRoot}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-8 rounded-xl border border-orange-200/80 bg-orange-50/40 dark:border-orange-900/40 dark:bg-orange-950/20 p-3 flex items-start gap-2.5 min-w-0">
                  <HardDrive className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-800/90 dark:text-orange-300/90">
                        Lokasi Penyimpanan (.ZIP Vault)
                      </span>
                      <span className="rounded bg-orange-200/70 dark:bg-orange-900/70 text-orange-900 dark:text-orange-200 px-1.5 py-0.2 text-[9px] font-mono font-bold shrink-0">
                        PERSISTENT DISK
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/60 rounded-lg px-2.5 py-1 border border-orange-200/60 dark:border-orange-800/50">
                      <code className="text-xs font-mono font-semibold text-orange-950 dark:text-orange-200 truncate" title={`${vaultPath}/backups/`}>
                        {vaultPath}/backups/
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(`${vaultPath}/backups/`);
                          showToast('info', 'Path Tersalin', `${vaultPath}/backups/`);
                        }}
                        className="text-slate-400 hover:text-orange-600 dark:hover:text-orange-300 p-0.5 cursor-pointer shrink-0"
                        title="Salin path penyimpanan"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Pilih Cakupan Cadangan (.ZIP):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'full',
                    title: 'Full Website (.zip)',
                    badge: 'DIREKOMENDASIKAN',
                    desc: 'Seluruh berkas web + otomatis ekspor database MySQL terkait ke dalam database.sql',
                  },
                  {
                    id: 'files',
                    title: 'File Dokumen Web Saja (.zip)',
                    badge: 'SUPER CEPAT',
                    desc: `Hanya mengarsipkan seluruh file & subfolder di dalam ${selectedDocRoot}`,
                  },
                  {
                    id: 'database',
                    title: 'Database MySQL Saja (.sql.zip)',
                    badge: 'SQL DUMP',
                    desc: 'Cadangan dump database MySQL yang terhubung ke domain ini',
                  },
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setBackupType(opt.id as any)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      backupType === opt.id
                        ? 'border-orange-500 bg-orange-50/60 dark:border-orange-500 dark:bg-orange-950/40 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.title}
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeConfigManifest}
                  onChange={e => setIncludeConfigManifest(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 dark:border-slate-700"
                />
                <span>
                  Sertakan Metadata Domain (<code>domain-manifest.json</code>: versi PHP {currentDomainObj?.phpVersion || '8.2'}, path direktori, nama domain) agar saat direstore setelan vHost langsung pulih 100%.
                </span>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Cadangan (Opsional):
                </label>
                <input
                  type="text"
                  value={backupNotes}
                  onChange={e => setBackupNotes(e.target.value)}
                  placeholder="Contoh: Backup sebelum update tema dan plugin WordPress"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Direktori sumber: <code>{selectedDocRoot}</code> ({currentDomainObj?.filesCount || 0} berkas)
              </div>

              <button
                type="button"
                disabled={isCreatingBackup}
                onClick={handleCreateDomainBackup}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:from-orange-500 hover:to-amber-500 cursor-pointer disabled:opacity-50"
              >
                {isCreatingBackup ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengompresi Berkas .ZIP di Linux Server...</span>
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    <span>Mulai Buat Cadangan .ZIP Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Banner upon creation */}
          {createdBackupResult && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 dark:border-emerald-500/30 dark:bg-emerald-950/30 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Cadangan .ZIP Berhasil Dibuat!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Berkas <strong>{createdBackupResult.fileName}</strong> ({createdBackupResult.formattedSize}) tersimpan aman di server.
                    </p>
                  </div>
                </div>

                <a
                  href={createdBackupResult.downloadUrl}
                  download={createdBackupResult.fileName}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh File .ZIP Langsung</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: PULIHKAN (RESTORE .ZIP) KE DOMAIN/SUBDOMAIN                 */}
      {/* =================================================================== */}
      {activeTab === 'restore_domain' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-sky-500" />
                <span>Pulihkan (Restore) ke: <span className="text-sky-600 dark:text-sky-400">{selectedDomain}</span></span>
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Pilih sumber file .ZIP cadangan (dari server lokal, tarik URL remote antar server, atau unggah langsung dari PC/HP).
              </p>
            </div>

            {/* Restore Source Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRestoreSourceType('server_archive')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  restoreSourceType === 'server_archive'
                    ? 'border-sky-500 bg-sky-50/60 dark:border-sky-500 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HardDrive className={`h-4 w-4 ${restoreSourceType === 'server_archive' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Dari Arsip Server</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih dari {serverBackups.length} file .ZIP yang sudah tersimpan di server
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRestoreSourceType('remote_url')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  restoreSourceType === 'remote_url'
                    ? 'border-amber-500 bg-amber-50/60 dark:border-amber-500 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DownloadCloud className={`h-4 w-4 ${restoreSourceType === 'remote_url' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Tarik URL Remote</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Sedot langsung dari server lain via Linux Socket (super cepat &amp; hemat kuota)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRestoreSourceType('upload_zip')}
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  restoreSourceType === 'upload_zip'
                    ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className={`h-4 w-4 ${restoreSourceType === 'upload_zip' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Unggah File (.ZIP / .JSON / .SQL)</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                   Mendukung hasil backup langsung dari website (.zip, .json, .sql) maupun Full Hosting (.zip)
                </p>
              </button>
            </div>

            {/* Source Input 1: Server Archive Dropdown */}
            {restoreSourceType === 'server_archive' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih File Cadangan di Server:
                </label>
                {serverBackups.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center">
                    Belum ada berkas backup .ZIP yang tersimpan di server. Anda dapat membuat backup baru di tab &quot;Cadangkan Domain&quot; atau menarik file dari URL remote.
                  </div>
                ) : (
                  <select
                    value={selectedArchiveFile}
                    onChange={e => setSelectedArchiveFile(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {serverBackups.map(b => (
                      <option key={b.fileName} value={b.fileName}>
                        {b.fileName} — {b.formattedSize || '0 B'} ({b.createdAt ? new Date(b.createdAt).toLocaleString('id-ID') : '-'}) [{(b.type || 'full').toUpperCase()}]
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Source Input 2: Remote URL */}
            {restoreSourceType === 'remote_url' && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-50/30 p-4 dark:border-amber-500/20 dark:bg-amber-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={remoteZipUrl}
                      onChange={e => setRemoteZipUrl(e.target.value)}
                      placeholder="https://siakad-madrasah.jaenalmaskun.biz.id/siakadmadrasah.zip"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isProbingRemote}
                    onClick={handleProbeRemoteZip}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isProbingRemote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    <span>Uji Koneksi &amp; Ukuran</span>
                  </button>
                </div>

                {/* Probe Feedback */}
                {remoteProbeInfo && (
                  <div
                    className={`rounded-xl p-3 text-xs flex items-center justify-between border ${
                      remoteProbeInfo.ok
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {remoteProbeInfo.ok ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>
                          File <strong>{remoteProbeInfo.fileName}</strong> terverifikasi dengan ukuran{' '}
                          <strong>{remoteProbeInfo.formattedSize}</strong> ({remoteProbeInfo.serverHeader}). Siap diunduh di server.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>{remoteProbeInfo.message || 'Gagal menghubungi server remote.'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Source Input 3: Upload Local ZIP / JSON / SQL */}
            {restoreSourceType === 'upload_zip' && (
              <div className="rounded-xl border-2 border-dashed border-indigo-400/60 bg-indigo-50/30 p-6 text-center dark:border-indigo-500/40 dark:bg-indigo-950/20 space-y-3">
                <Upload className="mx-auto h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pilih file cadangan (.ZIP hingga 200MB–500MB+, .JSON, atau .SQL) dari komputer / HP Anda
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Dilengkapi <strong>Chunked Streaming Upload (5MB/bagian)</strong> &amp; <strong>Auto-Purge .ZIP</strong> — file .ZIP besar otomatis dibuang dari disk setelah diekstrak!
                  </p>
                </div>
                <input
                  ref={localZipInputRef}
                  type="file"
                  accept=".zip,.json,.sql,application/zip,application/json,text/plain"
                  onChange={e => {
                    const f = e.target.files?.[0] || null;
                    setUploadedRestoreFile(f);
                    if (f) {
                      const sizeStr =
                        f.size < 1024 * 1024
                          ? `${(f.size / 1024).toFixed(1)} KB`
                          : `${(f.size / (1024 * 1024)).toFixed(2)} MB`;
                      showToast('info', 'File Cadangan Siap', `${f.name} (${sizeStr}) siap dipulihkan ke ${selectedDomain}.`);
                    }
                  }}
                  className="mt-2 block mx-auto text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:hover:bg-indigo-500 file:cursor-pointer"
                />

                {uploadedRestoreFile && (
                  <div className="mx-auto max-w-lg rounded-xl border border-indigo-500/30 bg-white/90 dark:bg-slate-900/90 p-3 text-left flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {uploadedRestoreFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Ukuran:{' '}
                          {uploadedRestoreFile.size < 1024 * 1024
                            ? `${(uploadedRestoreFile.size / 1024).toFixed(1)} KB`
                            : `${(uploadedRestoreFile.size / (1024 * 1024)).toFixed(2)} MB`}{' '}
                          &bull;{' '}
                          {uploadedRestoreFile.name.toLowerCase().endsWith('.json')
                            ? 'Format: Database JSON Website'
                            : uploadedRestoreFile.name.toLowerCase().endsWith('.sql')
                            ? 'Format: SQL Dump Database'
                            : 'Format: Arsip Lengkap .ZIP (Database + Media / Hosting)'}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                      SIAP RESTORE
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Restore Protections & Intelligence Options */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Opsi Proteksi &amp; Ekstraksi Pintar:
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreSafetySnapshot}
                  onChange={e => setRestoreSafetySnapshot(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
                />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Buat Cadangan Darurat (Safety Snapshot) Otomatis
                </span>
                <span className="text-slate-500 text-[11px]">— Menyimpan kondisi file saat ini sebelum ditimpa agar bisa di-rollback kapan saja.</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreAutoFlatten}
                  onChange={e => setRestoreAutoFlatten(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
                />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Auto-Flatten Folder Wrapper
                </span>
                <span className="text-slate-500 text-[11px]">— Jika di dalam ZIP dibungkus satu folder (seperti <code>public_html/</code> atau <code>nama-folder/</code>), otomatis lepaskan isinya langsung ke target domain.</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreCleanDestination}
                  onChange={e => setRestoreCleanDestination(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
                />
                <span>Hapus berkas lama di folder tujuan sebelum mengekstrak (Clean Destination).</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreFixPermissions}
                  onChange={e => setRestoreFixPermissions(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
                />
                <span>Setel permission Linux standar otomatis (Folder 0755 &amp; File 0644).</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreImportDatabase}
                  onChange={e => setRestoreImportDatabase(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
                />
                <span>Deteksi dan otomatis impor berkas database SQL (jika terdapat <code>database.sql</code> atau berkas .sql di dalam arsip).</span>
              </label>

              <label className="flex items-start sm:items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreAutoDeleteZip}
                  onChange={e => setRestoreAutoDeleteZip(e.target.checked)}
                  className="h-4 w-4 mt-0.5 sm:mt-0 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 dark:border-emerald-700"
                />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Otomatis Buang/Hapus File .ZIP Setelah Data Selesai Diekstrak (Auto-Purge .ZIP Hemat Disk)
                  </span>
                  <span className="block sm:inline sm:ml-1 text-emerald-700 dark:text-emerald-300/90 text-[11px]">
                    — Sangat disarankan untuk file .ZIP besar (200MB+) agar file mentah .ZIP tidak menumpuk di disk server setelah diekstrak.
                  </span>
                </div>
              </label>
            </div>

            {/* Start Restore Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <span>Target Restorasi: <strong>{selectedDomain}</strong> &rarr; <code>{selectedDocRoot}</code></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isPrimarySelected
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {isPrimarySelected ? '📍 KAMAR: DOMAIN UTAMA' : '📍 KAMAR: SUB DOMAIN (TERISOLASI)'}
                </span>
              </div>

              <button
                type="button"
                disabled={isPollingJob}
                onClick={handleStartRestore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-blue-500 cursor-pointer disabled:opacity-50"
              >
                {isPollingJob ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sedang Merestore di Server...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    <span>Mulai Restore ke {selectedDomain}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: ARSIP BERKAS CADANGAN SERVER (.ZIP)                          */}
      {/* =================================================================== */}
      {activeTab === 'backup_archives' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Daftar Berkas Cadangan (.ZIP) di Server ({serverBackups.length})</span>
              </h4>
              <p className="mt-0.5 text-xs text-slate-400 font-mono truncate max-w-full" title={`${vaultPath}/backups/`}>
                Lokasi: <code className="text-indigo-600 dark:text-indigo-400 font-semibold">{vaultPath}/backups/</code>
              </p>
            </div>

            <button
              type="button"
              onClick={loadBackups}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
              <span>Muat Ulang Berkas</span>
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:bg-slate-800/60 dark:text-slate-400 font-sans">
                <tr>
                  <th className="px-5 py-3">Nama Berkas .ZIP</th>
                  <th className="px-5 py-3">Domain Asal</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Ukuran Disk</th>
                  <th className="px-5 py-3">Tanggal Dibuat</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {serverBackups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-sans">
                      Belum ada berkas backup .ZIP di server. Buat cadangan baru melalui tab &quot;Cadangkan Domain&quot;.
                    </td>
                  </tr>
                ) : (
                  serverBackups.map(bk => (
                    <tr key={bk.fileName} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-orange-500 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white break-all">
                            {bk.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-sans">
                        <span className="font-bold text-slate-900 dark:text-white">{bk.domain}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-bold uppercase text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {bk.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {bk.formattedSize}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px] font-sans">
                        {bk.createdAt ? new Date(bk.createdAt).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={bk.downloadUrl}
                            download={bk.fileName}
                            className="flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                            title="Download Berkas .ZIP"
                          >
                            <Download className="h-3 w-3 text-orange-500" />
                            <span>Download</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedArchiveFile(bk.fileName);
                              setActiveTab('restore_domain');
                              setRestoreSourceType('server_archive');
                              showToast('info', 'Arsip Dipilih', `${bk.fileName} dipilih untuk restorasi.`);
                            }}
                            className="flex items-center gap-1 rounded bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
                            title="Restore Berkas Ini"
                          >
                            <RotateCcw className="h-3 w-3 text-sky-500" />
                            <span>Restore</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteServerBackup(bk.fileName)}
                            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 cursor-pointer"
                            title="Hapus Berkas Backup"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PERSISTENT VAULT (BRANKAS PERMANEN)                          */}
      {/* =================================================================== */}
      {activeTab === 'persistent_vault' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 p-6 text-white shadow-lg space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Proteksi Pertahankan Data Saat Update Cloud PRO (Persistent Vault)
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      keepDataOnUpdate
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>{keepDataOnUpdate ? 'AKTIF & TERKUNCI PERMANEN' : 'NONAKTIF'}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-3xl">
                  Fitur ini menyimpan seluruh file website hasil kloning/ekstrak ZIP (<code>/public_html</code>), daftar domain/subdomain, database, serta konfigurasi Cloudflare Tunnel ke <strong>brankas permanen di luar folder update</strong> (<code>{vaultPath}</code>). Saat Cloud PRO di-update atau server di-restart, data Anda <strong>tidak akan pernah hilang atau ter-reset</strong>.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-slate-950/80 px-3.5 py-2.5 text-xs font-bold text-emerald-300 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={keepDataOnUpdate}
                onChange={e => handleToggleKeepData(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-emerald-500"
              />
              <span>Pertahankan Data Otomatis Saat Update</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleLockDataNow}
              disabled={isSyncingVault}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs cursor-pointer"
            >
              <Lock className={`h-3.5 w-3.5 ${isSyncingVault ? 'animate-pulse' : ''}`} />
              <span>{isSyncingVault ? 'Mengunci ke Disk...' : 'Simpan & Kunci Data ke Disk Server Sekarang'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreFromServerVault}
              disabled={isRestoringVault}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 px-3.5 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-500/25 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRestoringVault ? 'animate-spin' : ''}`} />
              <span>Pulihkan dari Vault Server</span>
            </button>
          </div>

          {/* Safe Update Command */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-[11px] font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
            <div className="text-slate-300 break-all">
              <span className="text-emerald-400 font-sans font-bold mr-2">Perintah Update Cloud PRO Aman:</span>
              <code>{safeUpdateCommand}</code>
            </div>
            <button
              type="button"
              onClick={copyUpdateCmd}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 font-sans text-[10px] font-bold text-slate-200 hover:bg-slate-700 shrink-0 cursor-pointer"
            >
              {copiedCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCmd ? 'Tersalin!' : 'Salin Perintah'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: GOOGLE CLOUD & HYBRID FAILOVER (SAAT PC SERVER MATI)         */}
      {/* =================================================================== */}
      {activeTab === 'cloud_failover' && (
        <div className="space-y-6">
          {/* 1. STATUS DATA LOKAL DI PC SERVER (JAWABAN TEGAS & MENENANGKAN) */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 p-6 sm:p-7 text-white shadow-xl space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0 shadow-inner">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-emerald-300 border border-emerald-500/30">
                      KEAMANAN STORAGE LOKAL
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      100% NON-VOLATILE SSD/HDD
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Apakah Data di PC Lokal Tetap Tersimpan Saat PC Dimatikan?
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed max-w-3xl font-medium">
                    <strong className="text-white underline decoration-emerald-400 font-bold">JAWABAN: YA, TETAP 100% AMAN &amp; TERSIMPAN PERMANEN DI PC LOKAL!</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 shrink-0 text-left lg:text-right space-y-1">
                <div className="text-[11px] font-mono text-emerald-300/80">Status Media Fisik:</div>
                <div className="text-sm font-extrabold text-emerald-300 flex items-center lg:justify-end gap-1.5">
                  <HardDrive className="h-4 w-4" />
                  <span>SSD / HDD PC Aman</span>
                </div>
                <div className="text-[10px] text-slate-400">Zero Data Loss saat Shutdown</div>
              </div>
            </div>

            {/* Penjelasan Logika Storage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Power className="h-4 w-4 text-emerald-400" />
                  <span>1. PC Dimatikan (Malam Hari)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mematikan PC hanya menghentikan arus listrik ke CPU dan RAM. Seluruh file website (<code>/public_html</code>), database MySQL, script konfigurasi, dan SSL tersimpan di SSD/Harddisk fisik dan <strong>tidak akan pernah terhapus</strong>.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Cloud className="h-4 w-4 text-sky-400" />
                  <span>2. Pengalihan ke Cloud / VPS</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Data yang dialihkan ke Google Cloud atau VPS berstatus <strong>Replikasi / Salinan Mirror</strong>, BUKAN dipotong (cut). Data master tetap berada di PC lokal server Karsa Cloud Anda.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>3. PC Dinyalakan (Pagi Hari)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Saat PC dihidupkan kembali, Karsa Cloud PRO otomatis menyala dan seluruh data web langsung aktif kembali persis seperti kondisi terakhir sebelum dimatikan.
                </p>
              </div>
            </div>
          </div>

          {/* 2. MENU UNDUH & BACKUP SEWAKTU-WAKTU (JAWABAN PERTANYAAN 7 USER) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Pusat Unduh &amp; Backup Data Kapan Saja (24 Jam Nonstop)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Data website &amp; database dapat diunduh kapan pun Anda mau, baik melalui browser, HP, maupun disinkronkan ke Google Drive / Google Cloud.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Check className="h-3.5 w-3.5" />
                Dapat Diunduh Setiap Saat
              </span>
            </div>

            {/* 3 Opsi Unduh Praktis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opsi 1: Unduh Langsung ke Browser */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-5 dark:border-slate-800 dark:from-slate-800/40 dark:to-slate-900 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Download className="h-4 w-4" />
                    </span>
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      1-KLIK BROWSER
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Unduh Arsip Snapshot ({selectedDomain})
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Buat file cadangan <code>.ZIP</code> lengkap (berisi seluruh file web &amp; database dump) dan langsung unduh ke laptop / HP Anda saat ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportToCloud}
                  disabled={isExportingCloud}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {isExportingCloud ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sedang Mengemas .ZIP...</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="h-4 w-4" />
                      <span>Unduh Full Backup Sekarang</span>
                    </>
                  )}
                </button>
              </div>

              {/* Opsi 2: Backup Otomatis ke Google Drive */}
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/50 to-white p-5 dark:border-slate-800 dark:from-slate-800/40 dark:to-slate-900 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                      <Cloud className="h-4 w-4" />
                    </span>
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      GOOGLE DRIVE
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Sinkronkan ke Google Drive (Rclone)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Kirim backup secara otomatis ke Google Drive pribadi Anda, sehingga bisa Anda download dari HP kapan saja walau server PC sedang dimatikan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('rclone copy /var/cloudpro/backups gdrive:KarsaCloud-Backups/ -P');
                    setCopiedGdriveCmd(true);
                    setTimeout(() => setCopiedGdriveCmd(false), 3000);
                    showToast('success', 'Perintah Tersalin!', 'Perintah sync Google Drive siap dijalankan di terminal.');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  {copiedGdriveCmd ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedGdriveCmd ? 'Perintah Rclone Tersalin!' : 'Salin Perintah Sync GDrive'}</span>
                </button>
              </div>

              {/* Opsi 3: Akses Tab Arsip Berkas Server */}
              <div className="rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white p-5 dark:border-slate-800 dark:from-slate-800/40 dark:to-slate-900 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                      <Archive className="h-4 w-4" />
                    </span>
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      RIWAYAT ARSIP
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Arsip Berkas Server ({serverBackups.length})
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Lihat seluruh file arsip backup yang telah dibuat sebelumnya di disk server. Anda dapat mengunduh atau menghapus arsip lama kapan saja.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('backup_archives')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-300 bg-white px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Buka Tab Arsip Berkas ({serverBackups.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. SOLUSI WEB ON 24 JAM SAAT PC SERVER LOKAL DIMATIKAN */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Solusi Web ON 24 Jam Non-Stop Saat PC Dimatikan di Malam Hari
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Karena PC dipakai untuk mengetik dan tidak memungkinkan menyala 24 jam nonstop, gunakan strategi <strong>Hybrid Night Failover</strong> berikut:
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Zap className="h-3.5 w-3.5" />
                Arsitektur Hemat Daya
              </span>
            </div>

            {/* Alur Kerja Hybrid Siang vs Malam */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kolom A: Siang Hari (PC ON) */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Siang Hari (PC Server Lokal ON)
                  </h4>
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>PC Lokal sebagai Master:</strong> Menjalankan aplikasi web, PHP, MySQL, dan database utama dengan performa CPU &amp; RAM maksimal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>VPS sebagai Jembatan:</strong> Menerima traffic dari domain (misal <code>denbaguse.my.id</code>) lalu meneruskan ke PC lokal melalui bridge port 3000.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Data Baru:</strong> Seluruh input data tersimpan langsung di SSD/HDD PC lokal.</span>
                  </li>
                </ul>
              </div>

              {/* Kolom B: Malam Hari (PC Mati, Failover Standby) */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-500" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Malam Hari (PC Dimatikan, Dialihkan ke Cloud/VPS)
                  </h4>
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Sebelum PC Dimatikan:</strong> Jalankan skrip <code>night-sync.sh</code> untuk mengunggah snapshot HTML/statis atau database ke VPS / Google Cloud.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Web Tetap Terbuka:</strong> VPS Caddy menampilkan landing page / halaman statis web sehingga pengunjung tidak menemui error "502 Bad Gateway".</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Pagi Hari:</strong> Saat PC lokal dinyalakan kembali, jalankan <code>morning-sync.sh</code> untuk re-sinkronisasi data ke PC lokal.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Skrip 1-Baris Praktis */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Server className="h-4 w-4 text-indigo-500" />
                <span>Skrip Otomasi Malam &amp; Pagi (Siap Dijalankan di Terminal Linux):</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Night Sync Box */}
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5" />
                      <span>Sebelum PC Dimatikan di Malam Hari:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('bash night-sync.sh');
                        setCopiedNightSyncCmd(true);
                        setTimeout(() => setCopiedNightSyncCmd(false), 3000);
                        showToast('success', 'Perintah Tersalin!', 'Jalankan "bash night-sync.sh" sebelum mematikan PC.');
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
                    >
                      {copiedNightSyncCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedNightSyncCmd ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <code className="block text-xs font-mono text-emerald-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 break-all">
                    bash night-sync.sh
                  </code>
                  <p className="text-[10px] text-slate-400">
                    Otomatis membuat backup database, mengompres web, mengirim snapshot ke Cloud/VPS, dan mempersiapkan server untuk shutdown aman.
                  </p>
                </div>

                {/* Morning Sync Box */}
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <Sun className="h-3.5 w-3.5" />
                      <span>Setelah PC Dinyalakan di Pagi Hari:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('bash morning-sync.sh');
                        setCopiedMorningSyncCmd(true);
                        setTimeout(() => setCopiedMorningSyncCmd(false), 3000);
                        showToast('success', 'Perintah Tersalin!', 'Jalankan "bash morning-sync.sh" saat PC server baru menyala.');
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
                    >
                      {copiedMorningSyncCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedMorningSyncCmd ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <code className="block text-xs font-mono text-sky-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 break-all">
                    bash morning-sync.sh
                  </code>
                  <p className="text-[10px] text-slate-400">
                    Menghubungkan kembali jembatan VPS Bridge ke PC lokal, merestore status aktif, dan menyinkronkan data master ke SSD internal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
