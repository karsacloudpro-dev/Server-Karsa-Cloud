import {
  User,
  ResellerProfile,
  ServerNode,
  HostingPlan,
  HostingAccount,
  VirtualFile,
  DnsRecord,
  DatabaseEntity,
  EmailMailbox,
  CronJobItem,
  AccountBackup,
  Invoice,
  AuditLog,
  FirewallRule,
  ApiKeyItem,
  AppNotification,
  VpsInstance,
  VpsSnapshot,
  VpsFirewallRule,
  IpAddressRecord,
  PrivateNameserverConfig,
  CloudflareR2Config,
  OptimizedMediaFile,
  DomainEntity,
  DatabaseTableEntity,
  CloudProLetterheadConfig,
  CoreServerDomainInfo,
  SupportTicket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketDepartment,
  TicketAttachment,
} from '../types';

export const isCoreServerDomain = (domain: string): boolean => {
  if (!domain) return false;
  const d = domain.trim().toLowerCase();
  return (
    d === 'karsacloud.biz.id' ||
    d === 'server.karsacloud.biz.id' ||
    d === 'client.karsacloud.biz.id' ||
    d === 'ns1.karsacloud.biz.id' ||
    d === 'ns2.karsacloud.biz.id'
  );
};

const STORAGE_KEY = 'cloudpro_hosting_v9_clean';
const LETTERHEAD_STORAGE_KEY = 'cloudpro_letterhead_config_v1';

export const DEFAULT_LETTERHEAD_CONFIG: CloudProLetterheadConfig = {
  headerTitle: 'KARSA CLOUD PRO',
  headerSubtitle: 'Layanan Enterprise Cloud Hosting, Domain, Virtual Server (VPS) & Infrastruktur Digital',
  serverDomain: 'server.karsacloud.biz.id',
  officeAddress: 'Server Utama: server.karsacloud.biz.id • Website: karsacloud.biz.id • Indonesia',
  officialEmail: 'admin@karsacloud.biz.id',
  officialWhatsApp: '+62 812-2673-8883',
  ownerName: 'Jaenal Maskun',
  ownerTitle: 'Pemilik & Root Administrator Karsa Cloud PRO',
  signatureCity: 'Indonesia',
  bank1Name: 'Bank BCA',
  bank1Number: '8420-9918-22',
  bank1Holder: 'Jaenal Maskun (Karsa Cloud PRO)',
  bank2Name: 'Bank Mandiri / BRI',
  bank2Number: '139-00-8829104-5',
  bank2Holder: 'Jaenal Maskun (Karsa Cloud PRO)',
  qrisInfo: 'QRIS Karsa Cloud PRO (BCA, Mandiri, BRI, QRIS All Payment)',
  footerNote: 'Dokumen ini diterbitkan secara resmi oleh Sistem Billing & Otomasi Karsa Cloud PRO (karsacloud.biz.id) dan sah disertai Barcode Tanda Tangan Elektronik.',
  enableBarcodeSignature: true,
  autoSendWhatsApp: true,
  autoSendEmail: true,
  autoOpenWhatsAppOnManual: false,
  waGatewayUrl: '',
  waGatewayToken: '',
};

export interface DatabaseState {
  users: User[];
  resellerProfiles: ResellerProfile[];
  serverNodes: ServerNode[];
  hostingPlans: HostingPlan[];
  hostingAccounts: HostingAccount[];
  virtualFiles: VirtualFile[];
  dnsRecords: DnsRecord[];
  databases: DatabaseEntity[];
  databaseTables: Record<string, DatabaseTableEntity[]>;
  emailMailboxes: EmailMailbox[];
  cronJobs: CronJobItem[];
  backups: AccountBackup[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  firewallRules: FirewallRule[];
  apiKeys: ApiKeyItem[];
  notifications: AppNotification[];
  vpsInstances: VpsInstance[];
  vpsSnapshots: VpsSnapshot[];
  vpsFirewallRules: VpsFirewallRule[];
  ipAddresses: IpAddressRecord[];
  nameserverConfigs: PrivateNameserverConfig[];
  r2Configs: CloudflareR2Config[];
  optimizedMedia: OptimizedMediaFile[];
  domains: DomainEntity[];
  supportTickets?: SupportTicket[];
  deletedIds?: string[];
  letterheadConfig?: CloudProLetterheadConfig;
  stateUpdatedAt?: number;
}

const INITIAL_STATE: DatabaseState = {
  users: [
    {
      id: "usr-admin-01",
      name: "Jaenal Maskun",
      username: "karsacloud",
      email: "admin@karsacloud.biz.id",
      role: "admin",
      status: "active",
      creditBalance: 50000.0,
      companyName: "Karsa Cloud PRO (server.karsacloud.biz.id)",
      phone: "+62 812-2673-8883",
      twoFactorEnabled: false,
      twoFactorSecret: "KARSACLOUDSECRET23",
      createdAt: "2026-01-10T08:00:00Z",
      lastLogin: "2026-10-06T08:00:00Z",
    },
  ],

  resellerProfiles: [],

  serverNodes: [
    {
      id: "srv-sg-01",
      name: "Karsa Cloud Node (VPS Utama)",
      hostname: "server.karsacloud.biz.id",
      ipAddress: "178.83.181.238",
      location: "Cloud Node (Singapore & Global)",
      countryCode: "SG",
      osType: "Ubuntu 24.04 LTS (64-bit)",
      status: "online",
      totalCpuCores: 1,
      cpuUsagePct: 4.45,
      totalRamMb: 1024,
      ramUsageMb: 550,
      totalDiskGb: 15,
      diskUsageGb: 5.78,
      bandwidthUsageGb: 120,
      loadAverage: [0.08, 0.12, 0.10],
      uptimeDays: 2,
      isPrimary: true,
      assignedAccountsCount: 0,
      services: [
        { name: "caddy", displayName: "Caddy v2 (Reverse Proxy & Auto-SSL HTTPS)", status: "running", port: 443, version: "2.11.7", memoryMb: 120, uptime: "48d 14h" },
        { name: "nodejs", displayName: "Karsa Cloud PRO Engine (Node.js)", status: "running", port: 3000, version: "22.14.0", memoryMb: 350, uptime: "48d 14h" },
        { name: "sshd", displayName: "OpenSSH Daemon (Terminal Remote)", status: "running", port: 22, version: "9.6p1", memoryMb: 45, uptime: "48d 14h" },
        { name: "nginx", displayName: "Nginx High-Perf Web Server", status: "running", port: 80, version: "1.26.1", memoryMb: 210, uptime: "48d 14h" },
        { name: "mariadb", displayName: "MariaDB SQL Database Server", status: "running", port: 3306, version: "10.11.8", memoryMb: 850, uptime: "48d 14h" },
        { name: "pure_ftpd", displayName: "Pure-FTPd Secure Daemon", status: "running", port: 21, version: "1.0.51", memoryMb: 60, uptime: "48d 14h" },
      ],
    },
  ],

  hostingPlans: [
    {
      id: "plan-starter",
      name: "Cloud Starter",
      slug: "cloud-starter",
      description: "Ideal untuk website personal, portfolio, blog dan UMKM.",
      diskMb: 5120,
      bandwidthMb: 102400,
      cpuLimitPct: 100,
      ramLimitMb: 1024,
      maxDomains: 1,
      maxSubdomains: 5,
      maxDatabases: 2,
      maxEmails: 5,
      maxFtp: 2,
      hasSsl: true,
      hasBackup: true,
      hasCron: true,
      priceMonthly: 29000,
      priceYearly: 290000,
      currency: "IDR",
      isActive: true,
    },
    {
      id: "plan-pro",
      name: "Cloud Business Pro",
      slug: "cloud-pro",
      description: "Performa tinggi NVMe untuk website bisnis, e-commerce, dan madrasah.",
      diskMb: 25600,
      bandwidthMb: 512000,
      cpuLimitPct: 200,
      ramLimitMb: 4096,
      maxDomains: 10,
      maxSubdomains: 50,
      maxDatabases: 20,
      maxEmails: 50,
      maxFtp: 10,
      hasSsl: true,
      hasBackup: true,
      hasCron: true,
      priceMonthly: 75000,
      priceYearly: 750000,
      currency: "IDR",
      isActive: true,
    },
    {
      id: "plan-enterprise",
      name: "Cloud Enterprise",
      slug: "cloud-enterprise",
      description: "Resource terdedikasi untuk aplikasi skala besar dan reseller.",
      diskMb: 102400,
      bandwidthMb: 2048000,
      cpuLimitPct: 400,
      ramLimitMb: 8192,
      maxDomains: 999,
      maxSubdomains: 999,
      maxDatabases: 999,
      maxEmails: 100,
      maxFtp: 50,
      hasSsl: true,
      hasBackup: true,
      hasCron: true,
      priceMonthly: 150000,
      priceYearly: 1500000,
      currency: "IDR",
      isActive: true,
    },
  ],

  hostingAccounts: [],
  virtualFiles: [],
  dnsRecords: [],
  databases: [],
  databaseTables: {},
  emailMailboxes: [],
  cronJobs: [],
  backups: [],
  invoices: [],
  auditLogs: [],
  firewallRules: [],
  apiKeys: [],
  notifications: [],
  vpsInstances: [],
  vpsSnapshots: [],
  vpsFirewallRules: [],

  ipAddresses: [
    {
      id: "ip-01",
      ip: "178.83.181.238",
      gateway: "178.83.181.1",
      type: "dedicated",
      status: "assigned",
      serverId: "srv-sg-01",
      serverName: "Karsa Cloud Node (VPS Utama)",
      assignedToType: "server",
      assignedToId: "srv-sg-01",
      assignedToName: "server.karsacloud.biz.id",
      ptrRecord: "server.karsacloud.biz.id",
      isPrimaryServerIp: true,
      createdAt: "2026-01-10T08:00:00Z",
    },
  ],

  nameserverConfigs: [
    {
      id: "ns-cfg-01",
      domain: "karsacloud.biz.id",
      ns1Host: "ns1.karsacloud.biz.id",
      ns1Ip: "178.83.181.238",
      ns2Host: "ns2.karsacloud.biz.id",
      ns2Ip: "103.253.212.88",
      dnssecEnabled: false,
      soaEmail: "admin.karsacloud.biz.id",
      defaultTtl: 3600,
      updatedAt: "2026-01-10T08:00:00Z",
    },
  ],

  r2Configs: [],
  optimizedMedia: [],
  domains: [],
  supportTickets: [
    {
      id: "tik-001",
      ticketNumber: "TIK-2026-001",
      subject: "Bantuan Konfigurasi DNS & SSL Subdomain Madrasah",
      department: "domain_ssl",
      priority: "high",
      status: "answered",
      customerId: "usr-cust-02",
      customerName: "Den Baguse",
      customerEmail: "admin@denbaguse.my.id",
      resellerId: "prof-reseller-denbaguse",
      assignedStaffId: "usr-admin-01",
      assignedStaffName: "Jaenal Maskun",
      relatedDomain: "siakad-madrasah.denbaguse.my.id",
      relatedService: "Cloud Pro SSD (WHM Reseller)",
      messages: [
        {
          id: "msg-001-1",
          ticketId: "tik-001",
          authorId: "usr-cust-02",
          authorName: "Den Baguse",
          authorRole: "customer",
          authorEmail: "admin@denbaguse.my.id",
          message: "Halo Tim Support Karsa Cloud, mohon bantuan untuk verifikasi sertifikat SSL Let's Encrypt pada subdomain siakad-madrasah.denbaguse.my.id. Apakah perlu setup record CNAME tambahan atau sudah otomatis dari tunnel?",
          isStaffReply: false,
          createdAt: "2026-10-06T10:15:00.000Z",
        },
        {
          id: "msg-001-2",
          ticketId: "tik-001",
          authorId: "usr-admin-01",
          authorName: "Jaenal Maskun",
          authorRole: "admin",
          authorEmail: "admin@karsacloud.biz.id",
          message: "Halo Den Baguse, sertifikat SSL Let's Encrypt sudah otomatis terbit dan di-route via Cloudflare Tunnel edge. Pastikan status DNS di menu DNS Zone Editor menunjukkan proxy aktif. Kami telah memverifikasi subdomain Anda sudah dapat diakses dengan protokol HTTPS aman.",
          isStaffReply: true,
          createdAt: "2026-10-06T10:35:00.000Z",
        }
      ],
      lastReplyAt: "2026-10-06T10:35:00.000Z",
      lastReplyBy: "Jaenal Maskun",
      createdAt: "2026-10-06T10:15:00.000Z",
      updatedAt: "2026-10-06T10:35:00.000Z",
    },
    {
      id: "tik-002",
      ticketNumber: "TIK-2026-002",
      subject: "Optimasi Koneksi MySQL Bridge & Kuota Penyimpanan",
      department: "technical",
      priority: "medium",
      status: "in_progress",
      customerId: "usr-cust-02",
      customerName: "Den Baguse",
      customerEmail: "admin@denbaguse.my.id",
      assignedStaffId: "usr-admin-01",
      assignedStaffName: "Jaenal Maskun",
      relatedDomain: "denbaguse.my.id",
      relatedService: "MySQL / MariaDB Service",
      messages: [
        {
          id: "msg-002-1",
          ticketId: "tik-002",
          authorId: "usr-cust-02",
          authorName: "Den Baguse",
          authorRole: "customer",
          authorEmail: "admin@denbaguse.my.id",
          message: "Selamat siang, kami melihat sinkronisasi database MySQL Bridge berjalan lancar. Apakah kuota disk akun kami dapat dinaikkan jika data arsip SIAKAD bertambah di akhir semester?",
          isStaffReply: false,
          createdAt: "2026-10-06T14:20:00.000Z",
        },
        {
          id: "msg-002-2",
          ticketId: "tik-002",
          authorId: "usr-admin-01",
          authorName: "Jaenal Maskun",
          authorRole: "admin",
          authorEmail: "admin@karsacloud.biz.id",
          message: "Tentu, kuota disk Anda saat ini adalah 100 GB SSD NVMe. Jika memerlukan ekspansi kuota lebih dari 100 GB, kami dapat mengalokasikan storage tambahan langsung dari cluster server.",
          isStaffReply: true,
          createdAt: "2026-10-06T14:45:00.000Z",
        }
      ],
      lastReplyAt: "2026-10-06T14:45:00.000Z",
      lastReplyBy: "Jaenal Maskun",
      createdAt: "2026-10-06T14:20:00.000Z",
      updatedAt: "2026-10-06T14:45:00.000Z",
    }
  ],
  deletedIds: [],
};

class StorageService {
  private state: DatabaseState;
  private vaultSyncTimer: any = null;
  private hasHydratedFromServer = false;
  private isHydrating = false;
  private lastVaultSavedAt: string | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch {
        // ignore listener error
      }
    });
  }

  private markDeleted(ids: string | string[]): void {
    if (!Array.isArray(this.state.deletedIds)) {
      this.state.deletedIds = [];
    }
    const list = Array.isArray(ids) ? ids : [ids];
    const set = new Set<string>(this.state.deletedIds);
    for (const id of list) {
      if (id && typeof id === 'string') {
        set.add(id);
      }
    }
    this.state.deletedIds = Array.from(set).slice(-2500);
  }

  private loadState(): DatabaseState {
    try {
      ["cloudpro_hosting_v4", "cloudpro_hosting_v5", "cloudpro_hosting_v6", "cloudpro_hosting_v7", "cloudpro_database_v6"].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });

      let serialized: string | null = null;
      try {
        serialized = localStorage.getItem(STORAGE_KEY);
      } catch {}

      if (serialized) {
        const parsed = JSON.parse(serialized);
        const loadedDeletedIds: string[] = Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [];
        const deletedSet = new Set<string>(loadedDeletedIds);

        const loadedAccounts: HostingAccount[] = (
          Array.isArray(parsed.hostingAccounts) ? (parsed.hostingAccounts as HostingAccount[]) : []
        ).filter(a => {
          if (!a || !a.id) return false;
          const dom = (a.primaryDomain || "").toLowerCase();
          if (dom.includes("denbaguse") || dom.includes("websitepelanggan") || dom === "client.karsacloud.biz.id") return false;
          if (a.id === "acc-denbaguse-01" || a.id === "acc-school-02" || a.id === "acc-own-usr-reseller-denbaguse") return false;
          return !deletedSet.has(a.id);
        });

        const loadedUsers: User[] = (
          Array.isArray(parsed.users) ? (parsed.users as User[]) : INITIAL_STATE.users
        )
          .filter(u => {
            if (!u || !u.id) return false;
            if (u.id === "usr-reseller-denbaguse" || u.id === "usr-reseller-01" || u.id === "usr-cust-02") return false;
            if (u.username === "denbaguse" || u.username === "reseller" || u.username === "pelanggan") return false;
            return !deletedSet.has(u.id);
          })
          .map(u => {
            if (u.id === "usr-admin-01" || u.role === "admin") {
              return {
                ...u,
                name: "Jaenal Maskun",
                email: "admin@karsacloud.biz.id",
                role: "admin",
              };
            }
            return u;
          });

        if (!loadedUsers.some(u => u.id === "usr-admin-01")) {
          loadedUsers.unshift(INITIAL_STATE.users[0]);
        }

        const loadedDomains: DomainEntity[] = (
          Array.isArray(parsed.domains) ? (parsed.domains as DomainEntity[]) : []
        ).filter(d => {
          if (!d || !d.id || !d.domain) return false;
          const dom = d.domain.toLowerCase();
          if (dom.includes("denbaguse") || dom.includes("websitepelanggan") || dom === "client.karsacloud.biz.id") return false;
          return !deletedSet.has(d.id);
        });

        const loadedResellers: ResellerProfile[] = (
          Array.isArray(parsed.resellerProfiles) ? (parsed.resellerProfiles as ResellerProfile[]) : []
        ).filter(r => {
          if (!r || !r.id) return false;
          if (r.id === "prof-reseller-denbaguse" || r.id === "prof-reseller-01") return false;
          return !deletedSet.has(r.id);
        });

        const loadedServerNodes: ServerNode[] = (
          Array.isArray(parsed.serverNodes) && parsed.serverNodes.length > 0
            ? parsed.serverNodes
            : INITIAL_STATE.serverNodes
        ).map((srv: any) => ({
          ...srv,
          services: Array.isArray(srv.services) ? srv.services : [],
          loadAverage: Array.isArray(srv.loadAverage) && srv.loadAverage.length >= 3 ? srv.loadAverage : [0.08, 0.12, 0.10],
        }));

        return {
          ...INITIAL_STATE,
          ...parsed,
          users: loadedUsers,
          resellerProfiles: loadedResellers,
          serverNodes: loadedServerNodes,
          hostingPlans: Array.isArray(parsed.hostingPlans) && parsed.hostingPlans.length > 0 ? parsed.hostingPlans : INITIAL_STATE.hostingPlans,
          hostingAccounts: loadedAccounts,
          domains: loadedDomains,
          virtualFiles: (Array.isArray(parsed.virtualFiles) ? parsed.virtualFiles : []).filter((f: any) => !deletedSet.has(f.id)),
          dnsRecords: (Array.isArray(parsed.dnsRecords) ? parsed.dnsRecords : []).filter((d: any) => !deletedSet.has(d.id)),
          databases: (Array.isArray(parsed.databases) ? parsed.databases : []).filter((db: any) => !deletedSet.has(db.id)),
          emailMailboxes: (Array.isArray(parsed.emailMailboxes) ? parsed.emailMailboxes : []).filter((em: any) => !deletedSet.has(em.id)),
          cronJobs: (Array.isArray(parsed.cronJobs) ? parsed.cronJobs : []).filter((c: any) => !deletedSet.has(c.id)),
          backups: (Array.isArray(parsed.backups) ? parsed.backups : []).filter((b: any) => !deletedSet.has(b.id)),
          invoices: (Array.isArray(parsed.invoices) ? parsed.invoices : []).filter((i: any) => !deletedSet.has(i.id)),
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          firewallRules: Array.isArray(parsed.firewallRules) ? parsed.firewallRules : [],
          apiKeys: Array.isArray(parsed.apiKeys) ? parsed.apiKeys : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          vpsInstances: Array.isArray(parsed.vpsInstances) ? parsed.vpsInstances : [],
          ipAddresses: Array.isArray(parsed.ipAddresses) && parsed.ipAddresses.length > 0 ? parsed.ipAddresses : INITIAL_STATE.ipAddresses,
          supportTickets: (Array.isArray(parsed.supportTickets) ? parsed.supportTickets : (INITIAL_STATE.supportTickets || [])).filter((t: any) => !deletedSet.has(t.id)),
          deletedIds: loadedDeletedIds,
          letterheadConfig: parsed.letterheadConfig || DEFAULT_LETTERHEAD_CONFIG,
          stateUpdatedAt: parsed.stateUpdatedAt || Date.now(),
        };
      }
    } catch (err) {
      console.warn("Failed to load state from localStorage, falling back to default:", err);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  private getStorageOptimizedState(): DatabaseState {
    const MAX_LOCAL_FILE_CONTENT_CHARS = 1200;
    // Cap virtualFiles stored in localStorage to 60 items so localStorage stays under 30KB
    const rawFiles = (this.state.virtualFiles || []).slice(-60);
    const optimizedVirtualFiles = rawFiles.map(f => {
      if (typeof f.content === 'string' && f.content.length > MAX_LOCAL_FILE_CONTENT_CHARS) {
        return {
          ...f,
          content: undefined,
          isVaultOffloaded: true,
        };
      }
      return f;
    });

    return {
      ...this.state,
      virtualFiles: optimizedVirtualFiles,
    };
  }

  private saveState(syncToServer = true, immediateSync = false): void {
    try {
      this.state.stateUpdatedAt = Date.now();

      // 1. Prepare ultra-lightweight state for localStorage (< 35KB total)
      const optimizedState = this.getStorageOptimizedState();
      let jsonStr = JSON.stringify(optimizedState);

      // 2. Attempt to save to localStorage with graceful fallback chain
      try {
        localStorage.setItem(STORAGE_KEY, jsonStr);
      } catch {
        // Quota recovery: strip all virtual file contents for localStorage
        try {
          const minimalFiles = (this.state.virtualFiles || []).slice(-30).map(f => ({
            ...f,
            content: undefined,
            isVaultOffloaded: true,
          }));
          const minimalState = { ...this.state, virtualFiles: minimalFiles };
          jsonStr = JSON.stringify(minimalState);
          localStorage.setItem(STORAGE_KEY, jsonStr);
        } catch {
          // If still constrained by other storage on domain, save core entities only
          try {
            const emergencyState = {
              ...INITIAL_STATE,
              users: this.state.users,
              hostingAccounts: this.state.hostingAccounts,
              domains: this.state.domains,
              invoices: this.state.invoices,
              deletedIds: this.state.deletedIds,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencyState));
          } catch {
            // Memory and server vault maintain complete state
          }
        }
      }

      try {
        localStorage.setItem('cloudpro_last_saved_at', new Date().toISOString());
      } catch {
        // Ignore timestamp save error
      }

      this.notifyListeners();

      // 4. Automatically sync FULL state to the server's Persistent Vault ONLY after initial server hydration completes (or immediately on explicit deletion/mutation)
      if (syncToServer && !this.isHydrating) {
        if (this.vaultSyncTimer) clearTimeout(this.vaultSyncTimer);
        if (immediateSync) {
          this.syncToServerVault(true).catch(() => {});
        } else if (this.hasHydratedFromServer) {
          this.vaultSyncTimer = setTimeout(() => {
            this.syncToServerVault(true).catch(() => {});
          }, 1200);
        }
      }
    } catch {
      // Graceful fallback: memory and server vault maintain data
    }
  }

  public async syncToServerVault(userInitiated = true): Promise<boolean> {
    try {
      // Keep vault payload compact: cap virtualFiles to 300 entries and strip oversized non-index file content
      const cappedFiles = (this.state.virtualFiles || []).slice(-300).map(f => {
        const lowerName = (f.name || '').toLowerCase();
        const isEntry = lowerName === 'index.html' || lowerName === 'index.php' || lowerName === 'style.css';
        if (!isEntry && typeof f.content === 'string' && f.content.length > 100_000) {
          return { ...f, content: undefined };
        }
        return f;
      });
      const res = await fetch('/api/state/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: {
            ...this.state,
            virtualFiles: cappedFiles,
          },
          userInitiated,
          lockRetention: true,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.lastSavedAt) {
          this.lastVaultSavedAt = data.lastSavedAt;
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async hydrateFromServerVault(): Promise<boolean> {
    if (this.isHydrating) return false;
    this.isHydrating = true;
    try {
      const res = await fetch('/api/state/vault');
      if (!res.ok) {
        this.hasHydratedFromServer = true;
        return false;
      }
      const data = await res.json();
      let updated = false;
      let localHadExtra = false;

      // Fast exit if server vault hasn't changed since last hydration
      if (
        this.hasHydratedFromServer &&
        this.lastVaultSavedAt &&
        data?.lastSavedAt &&
        this.lastVaultSavedAt === data.lastSavedAt
      ) {
        return false;
      }

      if (data?.fullState && typeof data.fullState === 'object') {
        const vault = data.fullState as Partial<DatabaseState>;
        const vaultDeleted = Array.isArray(vault.deletedIds) ? vault.deletedIds : [];
        const localDeleted = Array.isArray(this.state.deletedIds) ? this.state.deletedIds : [];
        const deletedSet = new Set<string>([...vaultDeleted, ...localDeleted]);

        if (deletedSet.size !== localDeleted.length) {
          this.state.deletedIds = Array.from(deletedSet).slice(-2500);
          updated = true;
        }

        // Generic bidirectional union-merge by ID (server is authoritative for existing IDs, local extra IDs are preserved & pushed to server)
        const syncCollection = <T extends { id: string }>(
          vaultArr: T[] | undefined,
          localArr: T[] | undefined,
          trackExtraForPush = true
        ): T[] => {
          const vList = Array.isArray(vaultArr) ? vaultArr : [];
          const lList = Array.isArray(localArr) ? localArr : [];
          const map = new Map<string, T>();
          const vaultIdSet = new Set<string>();

          // 1. Add all non-deleted items from Server Vault
          for (const vItem of vList) {
            if (vItem && vItem.id && !deletedSet.has(vItem.id)) {
              map.set(vItem.id, vItem);
              vaultIdSet.add(vItem.id);
            }
          }

          // 2. Merge any local items that were created or more recently modified on this device (e.g. PC)
          for (const lItem of lList) {
            if (lItem && lItem.id && !deletedSet.has(lItem.id)) {
              const vExisting = map.get(lItem.id);
              if (!vExisting) {
                map.set(lItem.id, lItem);
                if (trackExtraForPush) {
                  localHadExtra = true;
                }
              } else {
                const lTs = Number((lItem as any)._updatedAt || 0);
                const vTs = Number((vExisting as any)._updatedAt || 0);
                if (lTs > vTs && JSON.stringify(lItem) !== JSON.stringify(vExisting)) {
                  map.set(lItem.id, lItem);
                  if (trackExtraForPush) {
                    localHadExtra = true;
                  }
                }
              }
            }
          }

          const result = Array.from(map.values());
          if (JSON.stringify(result) !== JSON.stringify(lList)) {
            updated = true;
          }
          return result;
        };

        this.state.users = syncCollection(vault.users, this.state.users, false);
        this.state.resellerProfiles = syncCollection(vault.resellerProfiles, this.state.resellerProfiles, false);
        this.state.serverNodes = syncCollection(vault.serverNodes, this.state.serverNodes, false);
        this.state.hostingPlans = syncCollection(vault.hostingPlans, this.state.hostingPlans, false);
        this.state.hostingAccounts = syncCollection(vault.hostingAccounts, this.state.hostingAccounts, false);
        this.state.domains = syncCollection(vault.domains, this.state.domains, false);
        this.state.databases = syncCollection(vault.databases, this.state.databases, false);
        this.state.emailMailboxes = syncCollection(vault.emailMailboxes, this.state.emailMailboxes, false);
        this.state.dnsRecords = syncCollection(vault.dnsRecords, this.state.dnsRecords, false);
        this.state.cronJobs = syncCollection(vault.cronJobs, this.state.cronJobs, false);
        this.state.backups = syncCollection(vault.backups, this.state.backups, false);
        this.state.invoices = syncCollection(vault.invoices, this.state.invoices, false);
        this.state.auditLogs = syncCollection(vault.auditLogs, this.state.auditLogs, false).slice(0, 200);
        this.state.firewallRules = syncCollection(vault.firewallRules, this.state.firewallRules, false);
        this.state.apiKeys = syncCollection(vault.apiKeys, this.state.apiKeys, false);
        this.state.notifications = syncCollection(vault.notifications, this.state.notifications, false).slice(0, 100);
        this.state.vpsInstances = syncCollection(vault.vpsInstances, this.state.vpsInstances, false);
        this.state.vpsSnapshots = syncCollection(vault.vpsSnapshots, this.state.vpsSnapshots, false);
        this.state.vpsFirewallRules = syncCollection(vault.vpsFirewallRules, this.state.vpsFirewallRules, false);
        this.state.ipAddresses = syncCollection(vault.ipAddresses, this.state.ipAddresses, false);
        this.state.nameserverConfigs = syncCollection(vault.nameserverConfigs, this.state.nameserverConfigs, false);
        this.state.r2Configs = syncCollection(vault.r2Configs, this.state.r2Configs, false);
        this.state.optimizedMedia = syncCollection(vault.optimizedMedia, this.state.optimizedMedia, false);
        this.state.supportTickets = syncCollection(vault.supportTickets, this.state.supportTickets, false);

        if (vault.databaseTables && typeof vault.databaseTables === 'object') {
          const mergedTables = {
            ...(this.state.databaseTables || {}),
            ...vault.databaseTables,
          };
          if (JSON.stringify(mergedTables) !== JSON.stringify(this.state.databaseTables)) {
            this.state.databaseTables = mergedTables;
            updated = true;
          }
        }

        if (vault.letterheadConfig && typeof vault.letterheadConfig === 'object') {
          if (JSON.stringify(vault.letterheadConfig) !== JSON.stringify(this.state.letterheadConfig)) {
            this.state.letterheadConfig = vault.letterheadConfig;
            try {
              localStorage.setItem(LETTERHEAD_STORAGE_KEY, JSON.stringify(vault.letterheadConfig));
            } catch {}
            updated = true;
          }
        }
      } else {
        // Server vault is empty; push our current state to initialize the server vault
        localHadExtra = true;
      }

      // High-performance single-pass in-memory merge for virtualFiles
      const deletedSet = new Set<string>(this.state.deletedIds || []);
      const fileMap = new Map<string, VirtualFile>();
      for (const lf of this.state.virtualFiles || []) {
        if (lf && !deletedSet.has(lf.id)) {
          const key = `${lf.accountId}:${this.normalizeVirtualPath(lf.path || '').toLowerCase()}`;
          fileMap.set(key, lf);
        }
      }

      const vaultFiles: VirtualFile[] = Array.isArray(data?.fullState?.virtualFiles) ? data.fullState.virtualFiles : [];
      for (const vf of vaultFiles) {
        if (!vf || deletedSet.has(vf.id)) continue;
        const key = `${vf.accountId}:${this.normalizeVirtualPath(vf.path || '').toLowerCase()}`;
        const prev = fileMap.get(key);
        const resolvedContent =
          typeof vf.content === 'string' && vf.content.length > 0
            ? vf.content
            : prev?.content;
        fileMap.set(key, {
          ...(prev || {}),
          ...vf,
          content: resolvedContent,
          isVaultOffloaded: resolvedContent ? undefined : (vf as any).isVaultOffloaded,
        });
      }

      // Merge filesByAccount from vhostStore IN-MEMORY without calling saveState() in a loop
      if (data?.vhostStore?.filesByAccount && typeof data.vhostStore.filesByAccount === 'object') {
        for (const [accId, sFiles] of Object.entries(data.vhostStore.filesByAccount)) {
          if (Array.isArray(sFiles)) {
            for (const sf of sFiles as any[]) {
              if (sf && (sf.type === 'file' || sf.type === 'directory')) {
                const normPath = this.normalizeVirtualPath(sf.path || '').toLowerCase();
                const key = `${accId}:${normPath}`;
                const prev = fileMap.get(key);

                if (
                  typeof sf.content === 'string' &&
                  sf.content.includes('Website Berhasil Disinkronkan!') &&
                  prev &&
                  String(prev.id || '').startsWith('vf-clone-') &&
                  (prev.content || '').length > 1000
                ) {
                  continue;
                }

                fileMap.set(key, {
                  ...(prev || {}),
                  id: prev?.id || sf.id || `vf-vault-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  accountId: accId,
                  name: sf.name,
                  path: sf.path,
                  type: sf.type || 'file',
                  sizeBytes: sf.size || sf.sizeBytes || (typeof sf.content === 'string' ? sf.content.length : 0),
                  permissions: sf.type === 'directory' ? '0755' : '0644',
                  updatedAt: sf.updatedAt || new Date().toISOString(),
                  content: typeof sf.content === 'string' ? sf.content : prev?.content,
                });
              }
            }
          }
        }
      }

      const nextFiles = Array.from(fileMap.values());
      if (nextFiles.length !== (this.state.virtualFiles || []).length) {
        this.state.virtualFiles = nextFiles;
        updated = true;
      }

      // Also merge any accounts from vhostStore.accounts on the server
      if (Array.isArray(data?.vhostStore?.accounts)) {
        for (const sAcc of data.vhostStore.accounts) {
          if (!sAcc || !sAcc.id || deletedSet.has(sAcc.id)) continue;
          const exists = this.state.hostingAccounts.some(a => a.id === sAcc.id);
          if (!exists && sAcc.primaryDomain) {
            this.state.hostingAccounts.push({
              id: sAcc.id,
              primaryDomain: sAcc.primaryDomain,
              domain: sAcc.primaryDomain,
              username: sAcc.username || sAcc.primaryDomain.split('.')[0],
              customerId: sAcc.customerId || 'usr-cust-02',
              customerName: sAcc.customerName || sAcc.username || sAcc.primaryDomain,
              customerEmail: sAcc.customerEmail || `admin@${sAcc.primaryDomain}`,
              serverId: sAcc.serverId || 'srv-sg-01',
              serverName: sAcc.serverName || 'SG-Equinix-Node01',
              planId: sAcc.planId || 'plan-starter',
              planName: sAcc.planName || 'Cloud Starter',
              diskUsedMb: sAcc.diskUsedMb ?? 25,
              diskLimitMb: sAcc.diskLimitMb ?? 10240,
              bandwidthUsedMb: sAcc.bandwidthUsedMb ?? 120,
              bandwidthLimitMb: sAcc.bandwidthLimitMb ?? 102400,
              phpVersion: (sAcc.phpVersion as any) || '8.2',
              phpExtensions: sAcc.phpExtensions || ['mysqli', 'pdo', 'curl', 'opcache', 'gd', 'mbstring', 'zip'],
              status: sAcc.status || 'active',
              sslStatus: sAcc.sslStatus || 'active',
              documentRoot: sAcc.documentRoot || `/home/${sAcc.username || 'user'}/public_html`,
              ipAddress: sAcc.ipAddress || '172.67.223.133',
              createdAt: sAcc.createdAt || new Date().toISOString(),
            });
            updated = true;
          }
        }
      }

      // Ensure invoices are populated if vault had empty invoices array
      if (!Array.isArray(this.state.invoices) || this.state.invoices.length === 0) {
        this.state.invoices = JSON.parse(JSON.stringify(INITIAL_STATE.invoices));
        updated = true;
      }

      // Always enforce multi-tenant isolation and upgrade legacy username to karsacloud
      if (Array.isArray(this.state.hostingAccounts)) {
        this.state.hostingAccounts = this.state.hostingAccounts.map(acc => {
          if (acc.id === 'acc-rdm-01') {
            const nextCust =
              !acc.customerName ||
              acc.customerName === 'Karsa Cloud Root System' ||
              acc.customerName.toLowerCase().includes('root system')
                ? 'Jaenal Maskun'
                : acc.customerName;
            if (acc.customerName !== nextCust) {
              acc.customerName = nextCust;
              updated = true;
            }
            if (
              acc.primaryDomain !== 'karsacloud.biz.id' ||
              acc.domain !== 'karsacloud.biz.id' ||
              acc.resellerId ||
              acc.username !== 'karsacloud' ||
              (acc.documentRoot || '').includes('/home/madrasah') ||
              (acc.documentRoot || '').includes('/home/cloudpro') ||
              (acc.documentRoot || '').includes('/home/gridmaster')
            ) {
              updated = true;
              return {
                ...acc,
                primaryDomain: 'karsacloud.biz.id',
                domain: 'karsacloud.biz.id',
                customerName: nextCust,
                customerEmail: acc.customerEmail || 'admin@karsacloud.biz.id',
                resellerId: undefined,
                customerId: 'usr-admin-01',
                username: 'karsacloud',
                documentRoot: '/home/karsacloud/public_html',
              };
            }
          }
          if (acc.id === 'acc-denbaguse-01' || acc.primaryDomain === 'denbaguse.my.id' || acc.domain === 'denbaguse.my.id') {
            if (acc.customerName !== 'Den Baguse') updated = true;
            return {
              ...acc,
              id: 'acc-denbaguse-01',
              primaryDomain: 'denbaguse.my.id',
              domain: 'denbaguse.my.id',
              username: 'denbaguse',
              customerId: 'usr-reseller-denbaguse',
              customerName: 'Den Baguse',
              customerEmail: acc.customerEmail || 'admin@denbaguse.my.id',
              resellerId: 'prof-reseller-denbaguse',
              documentRoot: '/public_html',
              status: 'active',
            };
          }
          if (acc.id === 'acc-school-02' || acc.customerId === 'usr-cust-02') {
            if (acc.resellerId || acc.primaryDomain.includes('reseller') || acc.customerName?.toLowerCase().includes('reseller')) {
              updated = true;
              const cleanDom =
                acc.primaryDomain === 'klien-reseller.my.id' ||
                acc.primaryDomain === 'portal.karsacloud.biz.id' ||
                acc.primaryDomain.includes('reseller') ||
                acc.primaryDomain.includes('websitepelanggan')
                  ? 'client.karsacloud.biz.id'
                  : acc.primaryDomain;
              return {
                ...acc,
                resellerId: undefined,
                primaryDomain: cleanDom,
                domain: cleanDom,
                username: acc.username === 'klienweb' ? 'pelanggan' : acc.username,
                customerName: 'Pelanggan Hosting cPanel',
                customerEmail: 'pelanggan@karsacloud.biz.id',
                documentRoot: '/home/pelanggan/public_html',
              };
            }
          }
          if (acc.id !== 'acc-rdm-01' && acc.primaryDomain !== 'karsacloud.biz.id' && acc.customerName === 'Jaenal Maskun') {
            updated = true;
            acc.customerName = (acc.id === 'acc-denbaguse-01' || acc.primaryDomain === 'denbaguse.my.id') ? 'Den Baguse' : 'Pelanggan Hosting cPanel';
          }
          return acc;
        });

        // Deduplicate any accounts for denbaguse
        const filteredAccounts: HostingAccount[] = [];
        let hasCanonicalDenbaguse = false;
        for (const a of this.state.hostingAccounts) {
          if (a.id === 'acc-own-usr-reseller-denbaguse') {
            updated = true;
            continue;
          }
          if (a.primaryDomain.toLowerCase() === 'denbaguse.my.id' || a.id === 'acc-denbaguse-01') {
            if (hasCanonicalDenbaguse) {
              updated = true;
              continue;
            }
            hasCanonicalDenbaguse = true;
          }
          filteredAccounts.push(a);
        }
        if (filteredAccounts.length !== this.state.hostingAccounts.length) {
          this.state.hostingAccounts = filteredAccounts;
          updated = true;
        }
      }

      if (Array.isArray(this.state.users)) {
        this.state.users = this.state.users.map(u => {
          if (u.id === 'usr-admin-01' || u.role === 'admin') {
            updated = true;
            return {
              ...u,
              name: 'Jaenal Maskun',
              email: u.email && u.email.includes('@') ? u.email : 'J.nalmaskun@gmail.com',
            };
          }
          return u;
        });
      }

      // Normalize legacy primary domain records in domains list after vault hydration
      if (Array.isArray(this.state.domains)) {
        this.state.domains = this.state.domains.map(d => {
          const nextDocRoot = (d.documentRoot || '')
            .replace('/home/madrasah', '/home/karsacloud')
            .replace('/home/cloudpro', '/home/karsacloud');
          if (d.accountId === 'acc-rdm-01' && d.type === 'primary') {
            updated = true;
            return {
              ...d,
              domain: 'karsacloud.biz.id',
              documentRoot: '/home/karsacloud/public_html',
            };
          }
          if (nextDocRoot !== d.documentRoot) {
            updated = true;
            return {
              ...d,
              documentRoot: nextDocRoot,
            };
          }
          return d;
        });
      }

      // Merge any subdomains from server vhostStore.subdomains so PHP Selector & Domain Manager always see all subdomains
      if (Array.isArray(data?.vhostStore?.subdomains)) {
        if (!Array.isArray(this.state.domains)) this.state.domains = [];
        for (const sub of data.vhostStore.subdomains) {
          if (!sub || !sub.fullDomain) continue;
          const fullDom = String(sub.fullDomain).toLowerCase().trim();
          const ownerAcc =
            this.state.hostingAccounts.find(a => a.id === sub.accountId) ||
            this.state.hostingAccounts.find(a => fullDom === a.primaryDomain.toLowerCase() || fullDom.endsWith(`.${a.primaryDomain.toLowerCase()}`));
          if (!ownerAcc) continue;
          const isPrimary = fullDom === ownerAcc.primaryDomain.toLowerCase();
          const existingIdx = this.state.domains.findIndex(d => d.domain.toLowerCase() === fullDom);
          if (existingIdx < 0 && !isPrimary) {
            const pDom = ownerAcc.primaryDomain.toLowerCase();
            const prefix = fullDom.endsWith(`.${pDom}`) ? fullDom.slice(0, -(pDom.length + 1)) : fullDom.split('.')[0];
            const cleanRelDoc = String(sub.documentRoot || `/public_html/${prefix}`).replace(/^\/home\/[^/]+/, '');
            this.state.domains.push({
              id: sub.id || `dom-sub-${prefix}`,
              accountId: ownerAcc.id,
              domain: sub.fullDomain,
              type: 'subdomain',
              parentDomain: ownerAcc.primaryDomain,
              subdomainPrefix: prefix,
              documentRoot: `/home/${ownerAcc.username}${cleanRelDoc.startsWith('/') ? cleanRelDoc : '/' + cleanRelDoc}`,
              phpVersion: (sub.phpVersion as any) || (prefix === 'rdm' ? '7.2' : prefix === 'cbt' ? '7.4' : ownerAcc.phpVersion || '8.2'),
              phpExtensions: Array.isArray(sub.phpExtensions) ? sub.phpExtensions : undefined,
              phpDirectives: sub.phpDirectives || undefined,
              sslStatus: 'active',
              createdAt: new Date().toISOString(),
            });
            updated = true;
          } else if (existingIdx >= 0 && sub.phpVersion) {
            const cur = this.state.domains[existingIdx];
            if (cur.phpVersion !== sub.phpVersion || (sub.phpExtensions && !cur.phpExtensions)) {
              this.state.domains[existingIdx] = {
                ...cur,
                phpVersion: sub.phpVersion as any,
                phpExtensions: sub.phpExtensions || cur.phpExtensions,
                phpDirectives: sub.phpDirectives || cur.phpDirectives,
              };
              updated = true;
            }
          }
        }
      }

      this.hasHydratedFromServer = true;
      this.lastVaultSavedAt = data?.lastSavedAt || new Date().toISOString();

      if (updated || localHadExtra) {
        this.saveState(false);
      }

      // If this device (e.g. PC) had custom customers/accounts/domains/invoices in localStorage not yet in the Server Vault, push them now!
      if (localHadExtra) {
        this.syncToServerVault(true).catch(() => {});
      }

      return updated || localHadExtra;
    } catch {
      this.hasHydratedFromServer = true;
      return false;
    } finally {
      this.isHydrating = false;
    }
  }

  public isDataRetentionEnabled(): boolean {
    try {
      const val = localStorage.getItem('cloudpro_data_retention_enabled');
      if (val === 'false') return false;
    } catch {
      // ignore
    }
    return true;
  }

  public setDataRetentionEnabled(enabled: boolean): void {
    try {
      localStorage.setItem('cloudpro_data_retention_enabled', enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public async syncToPersistentVault(userInitiated = true): Promise<boolean> {
    this.saveState();
    return this.syncToServerVault(userInitiated);
  }

  public exportFullStateJson(): string {
    return this.exportDatabaseJson();
  }

  public importFullStateJson(jsonStr: string): { ok: boolean; message: string } {
    const ok = this.importDatabaseJson(jsonStr);
    if (ok) {
      return {
        ok: true,
        message: 'Seluruh data website, domain, database, dan pengaturan berhasil dipulihkan dari file Persistent Vault.',
      };
    }
    return {
      ok: false,
      message: 'Format file JSON Persistent Vault tidak valid atau rusak.',
    };
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefault(): DatabaseState {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.saveState();
    return this.state;
  }

  public exportDatabaseJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importDatabaseJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.users && parsed.serverNodes && parsed.hostingAccounts) {
        this.state = parsed;
        this.saveState();
        this.syncToServerVault(true).catch(() => {});
        return true;
      }
    } catch (err) {
      console.error('Import failed:', err);
    }
    return false;
  }

  // --- Users & Resellers ---
  public getUsers(): User[] {
    return this.state.users.map(u => {
      let user = u;
      if (user.id === 'usr-admin-01' || user.role === 'admin') {
        if (!user.name || user.name === 'Root Administrator' || user.name === 'Admin') {
          user = { ...user, name: 'Jaenal Maskun' };
        }
      }
      if (user.twoFactorSecret && /[^A-Z2-7]/i.test(user.twoFactorSecret)) {
        user = { ...user, twoFactorSecret: 'KARSACLOUDSECRET23' };
      }
      return user;
    });
  }

  public getUserById(id: string): User | undefined {
    const u = this.state.users.find(user => user.id === id);
    if (!u) return undefined;
    let res = u;
    if (res.id === 'usr-admin-01' || res.role === 'admin') {
      if (!res.name || res.name === 'Root Administrator' || res.name === 'Admin') {
        res = { ...res, name: 'Jaenal Maskun' };
      }
    }
    if (res.twoFactorSecret && /[^A-Z2-7]/i.test(res.twoFactorSecret)) {
      res = { ...res, twoFactorSecret: 'KARSACLOUDSECRET23' };
    }
    return res;
  }

  public saveUser(user: User): void {
    const stamped = { ...user, _updatedAt: Date.now() } as User;
    const idx = this.state.users.findIndex(u => u.id === stamped.id);
    if (idx >= 0) {
      this.state.users[idx] = stamped;
    } else {
      this.state.users.unshift(stamped);
    }
    this.saveState();
  }

  public deleteUser(userId: string, cascadeAccounts = true): void {
    if (userId === 'usr-admin-01') return;
    const targetUser = this.getUserById(userId);
    const idsToMark: string[] = [userId];

    this.state.resellerProfiles
      .filter(r => r.userId === userId)
      .forEach(r => idsToMark.push(r.id));
    this.state.hostingPlans
      .filter(p => p.resellerId === userId)
      .forEach(p => idsToMark.push(p.id));

    this.state.users = this.state.users.filter(u => u.id !== userId);
    this.state.resellerProfiles = this.state.resellerProfiles.filter(r => r.userId !== userId);
    this.state.hostingPlans = this.state.hostingPlans.filter(p => p.resellerId !== userId);
    if (Array.isArray(this.state.nameserverConfigs)) {
      this.state.nameserverConfigs
        .filter(ns => ns.resellerId === userId)
        .forEach(ns => idsToMark.push(ns.id));
      this.state.nameserverConfigs = this.state.nameserverConfigs.filter(ns => ns.resellerId !== userId);
    }

    if (cascadeAccounts) {
      if (targetUser?.role === 'reseller') {
        const resellerAccs = this.state.hostingAccounts.filter(
          a => a.resellerId === userId && a.id !== 'acc-rdm-01'
        );
        resellerAccs.forEach(acc => this.deleteHostingAccount(acc.id));
        this.state.users
          .filter(u => u.role === 'customer' && u.resellerId === userId)
          .forEach(u => idsToMark.push(u.id));
        this.state.users = this.state.users.filter(
          u => !(u.role === 'customer' && u.resellerId === userId)
        );
        this.state.invoices
          .filter(inv => inv.userId === userId || inv.resellerId === userId)
          .forEach(inv => idsToMark.push(inv.id));
        this.state.invoices = this.state.invoices.filter(
          inv => inv.userId !== userId && inv.resellerId !== userId
        );
      } else {
        const customerAccs = this.state.hostingAccounts.filter(
          a =>
            a.id !== 'acc-rdm-01' &&
            (a.customerId === userId ||
              (targetUser?.email && a.customerEmail?.toLowerCase() === targetUser.email.toLowerCase()))
        );
        customerAccs.forEach(acc => this.deleteHostingAccount(acc.id));
        this.state.invoices
          .filter(inv => inv.userId === userId)
          .forEach(inv => idsToMark.push(inv.id));
        this.state.invoices = this.state.invoices.filter(inv => inv.userId !== userId);
      }
    }

    this.markDeleted(idsToMark);
    this.saveState(true, true);
  }

  public getResellerProfiles(): ResellerProfile[] {
    return this.state.resellerProfiles;
  }

  public getResellerProfile(userId: string): ResellerProfile | undefined {
    return this.state.resellerProfiles.find(p => p.userId === userId);
  }

  public saveResellerProfile(profile: ResellerProfile): void {
    const stamped = { ...profile, _updatedAt: Date.now() } as ResellerProfile;
    const idx = this.state.resellerProfiles.findIndex(p => p.id === stamped.id || p.userId === stamped.userId);
    if (idx >= 0) {
      this.state.resellerProfiles[idx] = stamped;
    } else {
      this.state.resellerProfiles.push(stamped);
    }
    this.saveState();
  }

  // --- Server Nodes ---
  public getServerNodes(): ServerNode[] {
    if (!Array.isArray(this.state.serverNodes) || this.state.serverNodes.length === 0) {
      this.state.serverNodes = [...INITIAL_STATE.serverNodes];
    }
    return this.state.serverNodes.map(srv => ({
      ...srv,
      services: Array.isArray(srv?.services) ? srv.services : [],
      loadAverage: Array.isArray(srv?.loadAverage) && srv.loadAverage.length >= 3 ? srv.loadAverage : [0.08, 0.12, 0.10],
    }));
  }

  public getServerNode(id: string): ServerNode | undefined {
    return this.state.serverNodes.find(s => s.id === id);
  }

  public saveServerNode(node: ServerNode): void {
    const idx = this.state.serverNodes.findIndex(s => s.id === node.id);
    if (idx >= 0) {
      this.state.serverNodes[idx] = node;
    } else {
      this.state.serverNodes.push(node);
    }
    this.saveState();
  }

  public deleteServerNode(id: string): void {
    this.markDeleted(id);
    this.state.serverNodes = this.state.serverNodes.filter(s => s.id !== id);
    this.saveState(true, true);
  }

  // --- Hosting Plans ---
  public getHostingPlans(): HostingPlan[] {
    return this.state.hostingPlans;
  }

  public saveHostingPlan(plan: HostingPlan): void {
    const stamped = { ...plan, _updatedAt: Date.now() } as HostingPlan;
    const idx = this.state.hostingPlans.findIndex(p => p.id === stamped.id);
    if (idx >= 0) {
      this.state.hostingPlans[idx] = stamped;
    } else {
      this.state.hostingPlans.push(stamped);
    }
    this.saveState();
  }

  public deleteHostingPlan(planId: string): void {
    this.markDeleted(planId);
    this.state.hostingPlans = this.state.hostingPlans.filter(p => p.id !== planId);
    this.saveState(true, true);
  }

  // --- Hosting Accounts ---
  public getHostingAccounts(): HostingAccount[] {
    const seen = new Set<string>();
    return this.state.hostingAccounts
      .filter(a => {
        if (a.primaryDomain === 'websitepelanggan.my.id' || a.domain === 'websitepelanggan.my.id') return false;
        if (a.id === 'acc-own-usr-reseller-denbaguse') return false;
        if (a.primaryDomain.toLowerCase() === 'denbaguse.my.id' && a.id !== 'acc-denbaguse-01') return false;
        const dom = a.primaryDomain.toLowerCase();
        if (seen.has(dom)) return false;
        seen.add(dom);
        return true;
      })
      .map(acc => {
        if (acc.id === 'acc-rdm-01' || acc.primaryDomain === 'karsacloud.biz.id') {
          return {
            ...acc,
            primaryDomain: 'karsacloud.biz.id',
            domain: 'karsacloud.biz.id',
            username: 'karsacloud',
            customerName: 'Jaenal Maskun',
            customerEmail: acc.customerEmail && acc.customerEmail.includes('@') ? acc.customerEmail : 'J.nalmaskun@gmail.com',
            documentRoot: '/home/karsacloud/public_html',
            resellerId: undefined,
            customerId: 'usr-admin-01',
          };
        }
        if (acc.id === 'acc-denbaguse-01' || acc.primaryDomain === 'denbaguse.my.id' || acc.domain === 'denbaguse.my.id') {
          return {
            ...acc,
            id: 'acc-denbaguse-01',
            primaryDomain: 'denbaguse.my.id',
            domain: 'denbaguse.my.id',
            username: 'denbaguse',
            customerName: 'Den Baguse',
            customerEmail: acc.customerEmail || 'admin@denbaguse.my.id',
            resellerId: 'prof-reseller-denbaguse',
            customerId: 'usr-reseller-denbaguse',
            documentRoot: '/public_html',
          };
        }
        if (acc.id !== 'acc-rdm-01' && acc.primaryDomain !== 'karsacloud.biz.id' && acc.customerName === 'Jaenal Maskun') {
          return {
            ...acc,
            customerName: (acc.id === 'acc-denbaguse-01' || acc.primaryDomain === 'denbaguse.my.id') ? 'Den Baguse' : 'Pelanggan Hosting cPanel',
          };
        }
        return acc;
      });
  }

  public getHostingAccount(id: string): HostingAccount | undefined {
    const acc = this.state.hostingAccounts.find(a => a.id === id);
    if (!acc) return undefined;
    if (acc.primaryDomain === 'websitepelanggan.my.id' || acc.domain === 'websitepelanggan.my.id') {
      return undefined;
    }
    if (acc.id === 'acc-rdm-01' || acc.primaryDomain === 'karsacloud.biz.id') {
      return {
        ...acc,
        primaryDomain: 'karsacloud.biz.id',
        domain: 'karsacloud.biz.id',
        username: 'karsacloud',
        customerName: 'Jaenal Maskun',
        customerEmail: acc.customerEmail && acc.customerEmail.includes('@') ? acc.customerEmail : 'J.nalmaskun@gmail.com',
        documentRoot: '/home/karsacloud/public_html',
        resellerId: undefined,
        customerId: 'usr-admin-01',
      };
    }
    if (acc.id === 'acc-denbaguse-01' || acc.primaryDomain === 'denbaguse.my.id' || acc.domain === 'denbaguse.my.id') {
      return {
        ...acc,
        id: 'acc-denbaguse-01',
        primaryDomain: 'denbaguse.my.id',
        domain: 'denbaguse.my.id',
        username: 'denbaguse',
        customerName: 'Den Baguse',
        customerEmail: acc.customerEmail || 'admin@denbaguse.my.id',
        resellerId: 'prof-reseller-denbaguse',
        customerId: 'usr-reseller-denbaguse',
        documentRoot: '/public_html',
      };
    }
    if (acc.id !== 'acc-rdm-01' && acc.primaryDomain !== 'karsacloud.biz.id' && acc.customerName === 'Jaenal Maskun') {
      return {
        ...acc,
        customerName: (acc.id === 'acc-denbaguse-01' || acc.primaryDomain === 'denbaguse.my.id') ? 'Den Baguse' : 'Pelanggan Hosting cPanel',
      };
    }
    return acc;
  }

  public saveHostingAccount(acc: HostingAccount): void {
    acc = { ...acc, _updatedAt: Date.now() } as HostingAccount;
    const idx = this.state.hostingAccounts.findIndex(a => a.id === acc.id);
    if (idx >= 0) {
      this.state.hostingAccounts[idx] = acc;
    } else {
      this.state.hostingAccounts.unshift(acc);
      // Increment assigned count on server node
      const server = this.state.serverNodes.find(s => s.id === acc.serverId);
      if (server) {
        server.assignedAccountsCount = (server.assignedAccountsCount || 0) + 1;
      }
    }

    // Automatically bind Cloudflare R2 config & CNAME record to the account's primaryDomain
    if (!this.state.r2Configs) this.state.r2Configs = [];
    const cleanDomain = (acc.primaryDomain || 'website.my.id').toLowerCase().trim();
    const cleanSlug = (acc.username || cleanDomain.replace(/[^a-z0-9]/g, '-')).toLowerCase();
    const existingR2 = this.state.r2Configs.find(r => r.accountId === acc.id);
    if (!existingR2) {
      this.state.r2Configs.push({
        id: `r2-cfg-${acc.id}`,
        accountId: acc.id,
        bucketName: `r2-${cleanSlug}-media`,
        accountIdCloudflare: 'cf_acc_auto_edge_id01',
        accessKeyId: `r2_key_${cleanSlug}_auto`,
        secretAccessKeyMasked: '********************************',
        publicCdnDomain: `https://media.${cleanDomain}`,
        autoWebpCompression: true,
        compressionQuality: 82,
        maxDimensionPx: 1920,
        stripExifGps: true,
        status: 'connected',
        lastSyncedAt: new Date().toISOString(),
      });
    } else if (
      acc.id !== 'acc-rdm-01' &&
      existingR2.publicCdnDomain.includes('karsacloud.biz.id')
    ) {
      existingR2.publicCdnDomain = `https://media.${cleanDomain}`;
      existingR2.bucketName = `r2-${cleanSlug}-media`;
    }

    // Ensure automatic CNAME DNS record for media.<domain> -> r2-edge.cloudpro.id
    if (!this.state.dnsRecords) this.state.dnsRecords = [];
    const hasMediaCname = this.state.dnsRecords.some(
      d => d.accountId === acc.id && d.name.toLowerCase() === 'media'
    );
    if (!hasMediaCname) {
      this.state.dnsRecords.push({
        id: `dns-r2-media-${acc.id}`,
        accountId: acc.id,
        domain: cleanDomain,
        type: 'CNAME',
        name: 'media',
        content: `r2-${cleanSlug}.r2-edge.cloudpro.id`,
        ttl: 3600,
      });
    }

    // Keep primary domain and child subdomains synchronized in this.state.domains
    if (!this.state.domains) this.state.domains = [];
    const primaryIdx = this.state.domains.findIndex(
      d => d.accountId === acc.id && d.type === 'primary'
    );
    if (primaryIdx >= 0) {
      this.state.domains[primaryIdx] = {
        ...this.state.domains[primaryIdx],
        domain: cleanDomain,
        documentRoot: acc.documentRoot || `/home/${acc.username}/public_html`,
        phpVersion: acc.phpVersion || '8.2',
        sslStatus: acc.sslStatus === 'active' ? 'active' : 'pending',
      };
    } else {
      this.state.domains.push({
        id: `dom-primary-${acc.id}`,
        accountId: acc.id,
        domain: cleanDomain,
        type: 'primary',
        documentRoot: acc.documentRoot || `/home/${acc.username}/public_html`,
        phpVersion: acc.phpVersion || '8.2',
        sslStatus: acc.sslStatus === 'active' ? 'active' : 'pending',
        createdAt: acc.createdAt || new Date().toISOString(),
      });
    }

    this.saveState();
  }

  public deleteHostingAccount(accId: string): void {
    const acc = this.getHostingAccount(accId);
    if (acc) {
      const server = this.state.serverNodes.find(s => s.id === acc.serverId);
      if (server && (server.assignedAccountsCount || 0) > 0) {
        server.assignedAccountsCount = (server.assignedAccountsCount || 0) - 1;
      }
    }
    const idsToMark: string[] = [accId];
    (this.state.domains || []).filter(d => d.accountId === accId).forEach(d => idsToMark.push(d.id));
    (this.state.virtualFiles || []).filter(f => f.accountId === accId).forEach(f => idsToMark.push(f.id));
    (this.state.dnsRecords || []).filter(d => d.accountId === accId).forEach(d => idsToMark.push(d.id));
    (this.state.databases || []).filter(d => d.accountId === accId).forEach(d => idsToMark.push(d.id));
    (this.state.emailMailboxes || []).filter(m => m.accountId === accId).forEach(m => idsToMark.push(m.id));
    (this.state.cronJobs || []).filter(c => c.accountId === accId).forEach(c => idsToMark.push(c.id));
    (this.state.backups || []).filter(b => b.accountId === accId).forEach(b => idsToMark.push(b.id));

    this.state.hostingAccounts = this.state.hostingAccounts.filter(a => a.id !== accId);
    this.state.domains = (this.state.domains || []).filter(d => d.accountId !== accId);
    this.state.virtualFiles = this.state.virtualFiles.filter(f => f.accountId !== accId);
    this.state.dnsRecords = this.state.dnsRecords.filter(d => d.accountId !== accId);
    this.state.databases = this.state.databases.filter(d => d.accountId !== accId);
    this.state.emailMailboxes = this.state.emailMailboxes.filter(m => m.accountId !== accId);
    this.state.cronJobs = this.state.cronJobs.filter(c => c.accountId !== accId);
    this.state.backups = this.state.backups.filter(b => b.accountId !== accId);
    this.markDeleted(idsToMark);
    this.saveState(true, true);
  }

  // --- Virtual Files ---
  public getVirtualFiles(accountId: string): VirtualFile[] {
    let changed = false;
    const isKarsacloudMain = accountId === 'acc-rdm-01';
    const knownDenbagusePrefixes = new Set([
      'siakad-madrasah', 'adm-madrasah', 'absensi-gtk', 'kartu-pelajar',
      'modul-ajar', 'rdm', 'cbt', 'elearning', 'ppdb', 'perpustakaan',
      'simpatika', 'emis', 'panel'
    ]);

    // Purge any accidental subdomain folder entries directly inside /public_html from state
    if (Array.isArray(this.state.virtualFiles)) {
      const beforeLen = this.state.virtualFiles.length;
      this.state.virtualFiles = this.state.virtualFiles.filter(f => {
        const pNorm = (f.path || '').toLowerCase();
        // If it's a directory entry directly under /public_html matching a subdomain, purge it!
        if (f.type === 'directory') {
          const directSub = pNorm.replace(/^\/public_html\//, '');
          if (!directSub.includes('/') && (knownDenbagusePrefixes.has(directSub) || knownDenbagusePrefixes.has((f.name || '').toLowerCase()))) {
            return false;
          }
        }
        // If it belongs to acc-rdm-01 (server main domain) and belongs to denbaguse, purge it completely!
        if (f.accountId === 'acc-rdm-01') {
          const pNormRel = pNorm.replace(/^\/public_html\//, '');
          const topFolder = pNormRel.split('/')[0];
          const lowerName = (f.name || '').toLowerCase();
          if (knownDenbagusePrefixes.has(topFolder) || knownDenbagusePrefixes.has(lowerName)) {
            return false;
          }
        }
        return true;
      });
      if (this.state.virtualFiles.length !== beforeLen) {
        changed = true;
      }
    }

    const files = this.state.virtualFiles.filter(f => {
      if (f.accountId !== accountId) return false;
      const pNorm = (f.path || '').toLowerCase();
      // Never return direct subdomain folder entries under /public_html
      if (f.type === 'directory') {
        const directSub = pNorm.replace(/^\/public_html\//, '');
        if (!directSub.includes('/') && (knownDenbagusePrefixes.has(directSub) || knownDenbagusePrefixes.has((f.name || '').toLowerCase()))) {
          return false;
        }
      }
      if (isKarsacloudMain) {
        const topFolder = pNorm.replace(/^\/public_html\//, '').split('/')[0];
        const lowerName = (f.name || '').toLowerCase();
        if (knownDenbagusePrefixes.has(topFolder) || knownDenbagusePrefixes.has(lowerName)) {
          return false;
        }
      }
      return true;
    });
    for (const f of files) {
      if (
        f.type === 'file' &&
        f.name.toLowerCase() === 'index.html' &&
        typeof f.content === 'string' &&
        f.content.includes('<base ') &&
        !f.content.includes('cloudpro-spa-clone-shim')
      ) {
        const baseMatch = f.content.match(/<base\s+href=["'](https?:\/\/[^/"']+)[^"']*["']/i);
        if (baseMatch && baseMatch[1]) {
          const originBase = baseMatch[1].replace(/\/$/, '');
          let healed = f.content.replace(/<base\s+href=["'][^"']*["']\s*\/?>/gi, '');
          const spaShim = `<script id="cloudpro-spa-clone-shim">
(function(){
  var ORIGIN = ${JSON.stringify(originBase)};
  try {
    var origPush = history.pushState;
    var origReplace = history.replaceState;
    history.pushState = function() { try { return origPush.apply(this, arguments); } catch (e) {} };
    history.replaceState = function() { try { return origReplace.apply(this, arguments); } catch (e) {} };
  } catch (e) {}
  try {
    var origFetch = window.fetch;
    if (origFetch) {
      window.fetch = function(input, init) {
        if (typeof input === 'string' && (input.indexOf('/api/') === 0 || input.indexOf('/uploads/') === 0)) {
          input = ORIGIN + input;
        }
        return origFetch.call(this, input, init);
      };
    }
  } catch (e) {}
})();
</script>`;
          healed = /<head[^>]*>/i.test(healed)
            ? healed.replace(/<head[^>]*>/i, m => `${m}\n${spaShim}`)
            : `${spaShim}\n${healed}`;
          f.content = healed;
          f.sizeBytes = healed.length;
          changed = true;
        }
      }
    }
    if (changed) {
      this.saveState();
    }
    return files;
  }

  private normalizeVirtualPath(rawPath: string): string {
    let p = (rawPath || '/public_html').trim().replace(/\\/g, '/').replace(/\/+/g, '/');
    p = p.replace(/^\/home\/[^/]+/, '');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p || '/public_html';
  }

  public clearDirectoryEntryFiles(accountId: string, dirPath: string): void {
    const cleanDir = this.normalizeVirtualPath(dirPath);
    const entryNames = new Set(['index.html', 'index.htm', 'index.php', 'default.html', 'style.css', 'script.js']);
    this.state.virtualFiles = this.state.virtualFiles.filter(f => {
      if (f.accountId !== accountId || f.type !== 'file') return true;
      const normalized = this.normalizeVirtualPath(f.path || '');
      const parent = normalized.substring(0, normalized.lastIndexOf('/')) || '/public_html';
      // Strictly match only the exact target directory (never affect subdomains when clearing /public_html or vice versa)
      if (parent.toLowerCase() === cleanDir.toLowerCase() && entryNames.has(f.name.toLowerCase())) {
        return false;
      }
      return true;
    });
    this.saveState();
  }

  public saveVirtualFile(file: VirtualFile): void {
    const cleanFilePath = this.normalizeVirtualPath(file.path || '');
    const normalizedFile: VirtualFile = { ...file, path: cleanFilePath };
    const normPath = cleanFilePath.toLowerCase();

    // Remove any duplicate files at the exact same accountId + path (with different id)
    this.state.virtualFiles = this.state.virtualFiles.filter(
      f =>
        f.id === normalizedFile.id ||
        !(f.accountId === normalizedFile.accountId && this.normalizeVirtualPath(f.path || '').toLowerCase() === normPath)
    );

    // If saving index.html or index.php in /public_html, only remove the default initial placeholder (vf-personal-html)
    // Never delete index.html when index.php is saved alongside it (hybrid PHP+SPA apps use both index.php and index.html!)
    const lowerName = normalizedFile.name.toLowerCase();
    if (lowerName === 'index.html' || lowerName === 'index.htm' || lowerName === 'index.php') {
      const parentDir = normPath.substring(0, normPath.lastIndexOf('/')) || '/public_html';
      this.state.virtualFiles = this.state.virtualFiles.filter(f => {
        if (f.accountId !== normalizedFile.accountId || f.id === normalizedFile.id || f.type !== 'file') return true;
        const fNorm = this.normalizeVirtualPath(f.path || '').toLowerCase();
        if (fNorm === normPath.toLowerCase()) return false;
        if (parentDir.toLowerCase() === '/public_html' && f.id === 'vf-personal-html') return false;
        return true;
      });
    }

    const idx = this.state.virtualFiles.findIndex(f => f.id === normalizedFile.id);
    if (idx >= 0) {
      this.state.virtualFiles[idx] = normalizedFile;
    } else {
      this.state.virtualFiles.push(normalizedFile);
    }
    this.saveState();
  }

  public saveVirtualFilesBatch(files: VirtualFile[]): void {
    if (!Array.isArray(files) || files.length === 0) return;
    // Cap batch to 150 items so all root files and active assets are preserved
    const capped = files.slice(0, 150).map(f => ({
      ...f,
      path: this.normalizeVirtualPath(f.path || ''),
    }));

    const incomingPathMap = new Map<string, VirtualFile>();
    let replacesPrimaryRootIndex = false;

    for (const nf of capped) {
      const key = `${nf.accountId}:${nf.path.toLowerCase()}`;
      incomingPathMap.set(key, nf);
      const lowerPath = nf.path.toLowerCase();
      if (lowerPath === '/public_html/index.html' || lowerPath === '/public_html/index.php') {
        replacesPrimaryRootIndex = true;
      }
    }

    this.state.virtualFiles = this.state.virtualFiles.filter(ef => {
      const efNorm = this.normalizeVirtualPath(ef.path || '').toLowerCase();
      const key = `${ef.accountId}:${efNorm}`;
      if (incomingPathMap.has(key)) return false;
      if (replacesPrimaryRootIndex && ef.id === 'vf-personal-html') return false;
      return true;
    });

    this.state.virtualFiles.push(...Array.from(incomingPathMap.values()));
    this.saveState();
  }

  public replaceDirectoryFilesFromDiskScan(accountId: string, dirPath: string, files: VirtualFile[]): void {
    const cleanDir = this.normalizeVirtualPath(dirPath).toLowerCase();
    const capped = (files || []).slice(0, 350).map(f => ({
      ...f,
      path: this.normalizeVirtualPath(f.path || ''),
    }));
    const incomingPathMap = new Map<string, VirtualFile>();
    for (const nf of capped) {
      incomingPathMap.set(`${nf.accountId}:${nf.path.toLowerCase()}`, nf);
    }

    // Remove any existing virtual files whose direct parent is cleanDir (eliminates ghost files from previous installs!)
    this.state.virtualFiles = this.state.virtualFiles.filter(ef => {
      if (ef.accountId !== accountId) return true;
      const efNorm = this.normalizeVirtualPath(ef.path || '').toLowerCase();
      const parent = efNorm.substring(0, efNorm.lastIndexOf('/')) || '/public_html';
      if (parent === cleanDir) return false;
      if (incomingPathMap.has(`${ef.accountId}:${efNorm}`)) return false;
      return true;
    });

    this.state.virtualFiles.push(...Array.from(incomingPathMap.values()));
    this.saveState();
  }

  public deleteVirtualFile(fileId: string): void {
    const target = this.state.virtualFiles.find(f => f.id === fileId);
    if (!target) {
      this.markDeleted(fileId);
      this.state.virtualFiles = this.state.virtualFiles.filter(f => f.id !== fileId);
      this.saveState(true, true);
      return;
    }

    const cleanPath = target.path.replace(/\\/g, '/');
    const cleanPathLower = cleanPath.toLowerCase();
    const isDir = target.type === 'directory';

    const idsToMark: string[] = [fileId];
    // Remove file and, if directory, all nested children recursively
    this.state.virtualFiles = this.state.virtualFiles.filter(f => {
      const fNorm = f.path.replace(/\\/g, '/').toLowerCase();
      if (isDir) {
        if (fNorm === cleanPathLower || fNorm.startsWith(cleanPathLower + '/')) {
          idsToMark.push(f.id);
          return false;
        }
        return true;
      }
      if (f.id === fileId || fNorm === cleanPathLower) {
        idsToMark.push(f.id);
        return false;
      }
      return true;
    });

    this.markDeleted(idsToMark);
    this.saveState(true, true);

    // Call server deletion endpoint so physical disk & vhostStore are cleaned up permanently!
    if (typeof window !== 'undefined') {
      fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: target.accountId,
          path: cleanPath,
          id: target.id,
          isDir,
        }),
      }).catch(() => {});
    }
  }

  public deleteVirtualFilesBatch(fileIds: string[]): void {
    const idSet = new Set(fileIds);
    const targetItems = this.state.virtualFiles.filter(f => idSet.has(f.id));
    if (targetItems.length === 0) return;

    const dirPaths = targetItems
      .filter(f => f.type === 'directory')
      .map(f => f.path.replace(/\\/g, '/').toLowerCase());
    const filePaths = new Set(targetItems.map(f => f.path.replace(/\\/g, '/').toLowerCase()));

    const idsToMark: string[] = [...fileIds];
    this.state.virtualFiles = this.state.virtualFiles.filter(f => {
      if (idSet.has(f.id)) {
        idsToMark.push(f.id);
        return false;
      }
      const fNorm = f.path.replace(/\\/g, '/').toLowerCase();
      if (filePaths.has(fNorm)) {
        idsToMark.push(f.id);
        return false;
      }
      for (const dir of dirPaths) {
        if (fNorm.startsWith(dir + '/')) {
          idsToMark.push(f.id);
          return false;
        }
      }
      return true;
    });

    this.markDeleted(idsToMark);
    this.saveState(true, true);

    if (typeof window !== 'undefined') {
      fetch('/api/files/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: targetItems.map(t => ({
            id: t.id,
            path: t.path,
            isDir: t.type === 'directory',
          })),
        }),
      }).catch(() => {});
    }
  }

  // --- DNS Records ---
  public getDnsRecords(accountId: string): DnsRecord[] {
    return this.state.dnsRecords.filter(d => d.accountId === accountId);
  }

  public saveDnsRecord(record: DnsRecord): void {
    const idx = this.state.dnsRecords.findIndex(d => d.id === record.id);
    if (idx >= 0) {
      this.state.dnsRecords[idx] = record;
    } else {
      this.state.dnsRecords.push(record);
    }
    this.saveState();
  }

  public deleteDnsRecord(id: string): void {
    this.markDeleted(id);
    this.state.dnsRecords = this.state.dnsRecords.filter(d => d.id !== id);
    this.saveState(true, true);
  }

  // --- Core Server Infrastructure Domains ---
  public getCoreServerDomains(): CoreServerDomainInfo[] {
    const primaryNode = this.getServerNodes().find(n => n.isPrimary) || this.getServerNodes()[0];
    const nodeIp = primaryNode?.ipAddress || '178.83.181.238';

    return [
      {
        id: 'core-dom-01',
        domain: 'karsacloud.biz.id',
        title: 'Portal Utama & Identitas Layanan',
        roleDescription: 'Apex domain resmi untuk portal informasi, katalog paket cloud hosting, registrasi pelanggan, dan konsultasi resmi.',
        category: 'apex_website',
        badge: 'APEX DOMAIN',
        badgeColor: 'sky',
        targetPort: 3000,
        engine: 'Node.js 22 + React 19 Engine',
        documentRoot: '/var/www/html (Public Portal)',
        sslStatus: 'active',
        sslProvider: "Let's Encrypt Wildcard (*.karsacloud.biz.id)",
        sslType: 'TLS 1.3 / HTTP/3 ALPN',
        sslExpires: '2027-01-01T00:00:00Z',
        ipAddress: nodeIp,
        dnsProvider: 'Cloudflare Anycast DDoS Mitigation',
        proxyStatus: 'active',
        caddyConfigured: true,
        reverseProxyRule: 'karsacloud.biz.id -> reverse_proxy localhost:3000',
        isLocked: true,
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'core-dom-02',
        domain: 'server.karsacloud.biz.id',
        title: 'Web Panel Admin & API Node Gateway',
        roleDescription: 'Endpoint utama kontrol server, API telemetri hardware, daemon service, manajemen vHost, database, dan Web Terminal SSH root.',
        category: 'admin_panel',
        badge: 'CONTROL CENTER',
        badgeColor: 'amber',
        targetPort: 3000,
        engine: 'Karsa Cloud PRO High-Perf Daemon',
        documentRoot: '/app/applet (System Core Root)',
        sslStatus: 'active',
        sslProvider: "Let's Encrypt Enterprise SSL",
        sslType: 'Dual TLS 1.3 + HTTP/2 Multiplex',
        sslExpires: '2027-01-01T00:00:00Z',
        ipAddress: nodeIp,
        dnsProvider: 'DNS A Record -> 178.83.181.238 (Auto-Sync)',
        proxyStatus: 'active',
        caddyConfigured: true,
        reverseProxyRule: 'server.karsacloud.biz.id -> reverse_proxy localhost:3000',
        isLocked: true,
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: 'core-dom-03',
        domain: 'client.karsacloud.biz.id',
        title: 'Portal Akses Mandiri Klien (cPanel SSO)',
        roleDescription: 'Gerbang masuk pelanggan mandiri untuk mengelola file manager web masing-masing, basis data phpMyAdmin, email webmail, dan billing faktur.',
        category: 'client_portal',
        badge: 'CLIENT GATEWAY',
        badgeColor: 'emerald',
        targetPort: 3000,
        engine: 'cPanel CloudPRO Multi-Tenant SSO',
        documentRoot: '/home/client/public_html',
        sslStatus: 'active',
        sslProvider: "Let's Encrypt Authority X3",
        sslType: 'TLS 1.3 Auto-Managed',
        sslExpires: '2027-01-01T00:00:00Z',
        ipAddress: nodeIp,
        dnsProvider: 'Cloudflare CNAME / A Record',
        proxyStatus: 'active',
        caddyConfigured: true,
        reverseProxyRule: 'client.karsacloud.biz.id -> reverse_proxy localhost:3000',
        isLocked: true,
        lastVerifiedAt: new Date().toISOString(),
      },
    ];
  }

  // --- Domains & Subdomains ---
  public getDomains(accountId?: string): DomainEntity[] {
    if (!this.state.domains) this.state.domains = [];

    let stateChanged = false;
    const validAccountIds = new Set(this.state.hostingAccounts.map(a => a.id));

    // 1. Self-heal legacy primary domain entries and re-attach subdomains whose parentDomain matches an active account
    const normalizedDomains: DomainEntity[] = [];
    for (const d of this.state.domains) {
      if (!d || !d.domain) continue;
      // Permanently drop websitepelanggan.my.id
      if (d.domain === 'websitepelanggan.my.id' || d.domain.endsWith('.websitepelanggan.my.id') || d.parentDomain === 'websitepelanggan.my.id') {
        stateChanged = true;
        continue;
      }
      let current = { ...d };

      // Fix legacy primary domain record that had 'rdm.karsacloud.biz.id'
      if (current.type === 'primary' && current.domain.toLowerCase() === 'rdm.karsacloud.biz.id') {
        const ownerAcc = this.state.hostingAccounts.find(a => a.id === current.accountId);
        const fixedPrimary =
          ownerAcc?.primaryDomain && ownerAcc.primaryDomain.toLowerCase() !== 'rdm.karsacloud.biz.id'
            ? ownerAcc.primaryDomain
            : 'karsacloud.biz.id';
        current = { ...current, domain: fixedPrimary };
        stateChanged = true;
      }

      // Segregate educational & school subdomains so they STRICTLY belong to acc-denbaguse-01 (denbaguse.my.id)
      // NEVER allow them to be attached to karsacloud.biz.id or duplicated to the main server domain!
      const denbagusePrefixes = [
        'siakad-madrasah', 'adm-madrasah', 'absensi-gtk', 'kartu-pelajar',
        'modul-ajar', 'rdm', 'cbt', 'elearning', 'panel'
      ];
      const curPrefix = (current.subdomainPrefix || current.domain.split('.')[0] || '').toLowerCase();
      if (denbagusePrefixes.includes(curPrefix)) {
        const denbaguseAcc = this.state.hostingAccounts.find(
          a => a.id === 'acc-denbaguse-01' || a.primaryDomain?.toLowerCase() === 'denbaguse.my.id'
        );
        if (denbaguseAcc) {
          const expectedFull = `${curPrefix}.${denbaguseAcc.primaryDomain}`;
          if (
            current.accountId !== denbaguseAcc.id ||
            current.parentDomain !== denbaguseAcc.primaryDomain ||
            current.domain !== expectedFull
          ) {
            current = {
              ...current,
              accountId: denbaguseAcc.id,
              parentDomain: denbaguseAcc.primaryDomain,
              domain: expectedFull,
              subdomainPrefix: curPrefix,
              documentRoot: curPrefix === 'panel' ? '/public_html' : `/public_html/${curPrefix}`,
            };
            stateChanged = true;
          }
        }
      }

      // Ensure subdomains dynamically match their owner account's primary domain
      if (current.type === 'subdomain') {
        const ownerAcc = this.state.hostingAccounts.find(a => a.id === current.accountId);
        if (ownerAcc) {
          const expectedParent = ownerAcc.primaryDomain.toLowerCase();
          const prefix = current.subdomainPrefix || current.domain.split('.')[0];
          const expectedFull = `${prefix}.${expectedParent}`;
          if (current.domain !== expectedFull || current.parentDomain !== expectedParent) {
            current = {
              ...current,
              domain: expectedFull,
              parentDomain: expectedParent,
              subdomainPrefix: prefix,
            };
            stateChanged = true;
          }
        }
      }

      // If this domain's accountId no longer exists, either adopt it to a matching account by parentDomain or drop it
      if (!validAccountIds.has(current.accountId)) {
        const matchingAcc = this.state.hostingAccounts.find(a => {
          const pDom = a.primaryDomain.toLowerCase();
          return (
            (current.type === 'subdomain' &&
              (current.parentDomain?.toLowerCase() === pDom ||
                current.domain.toLowerCase().endsWith(`.${pDom}`))) ||
            (current.type === 'primary' && current.domain.toLowerCase() === pDom)
          );
        });

        if (matchingAcc) {
          stateChanged = true;
          if (current.type === 'subdomain') {
            const pDom = matchingAcc.primaryDomain.toLowerCase();
            const prefix =
              current.subdomainPrefix ||
              current.domain.toLowerCase().slice(0, -(pDom.length + 1));
            current = {
              ...current,
              accountId: matchingAcc.id,
              parentDomain: matchingAcc.primaryDomain,
              subdomainPrefix: prefix,
              documentRoot: `/home/${matchingAcc.username}/public_html/${prefix}`,
            };
          } else {
            current = {
              ...current,
              accountId: matchingAcc.id,
            };
          }
        } else {
          // Drop orphaned domain record from deleted account so it never blocks creating new subdomains
          stateChanged = true;
          continue;
        }
      }

      // If a subdomain's parentDomain matches an existing account, ensure its accountId belongs to that account
      if (current.type === 'subdomain') {
        const parentOwner = this.state.hostingAccounts.find(a => {
          const pDom = a.primaryDomain.toLowerCase();
          return (
            current.parentDomain?.toLowerCase() === pDom ||
            current.domain.toLowerCase().endsWith(`.${pDom}`)
          );
        });
        if (parentOwner && current.accountId !== parentOwner.id) {
          stateChanged = true;
          const pDom = parentOwner.primaryDomain.toLowerCase();
          const prefix =
            current.subdomainPrefix ||
            current.domain.toLowerCase().slice(0, -(pDom.length + 1));
          current = {
            ...current,
            accountId: parentOwner.id,
            parentDomain: parentOwner.primaryDomain,
            subdomainPrefix: prefix,
            documentRoot: `/home/${parentOwner.username}/public_html/${prefix}`,
          };
        }
      }

      // Deduplicate by domain name + type
      const dupIdx = normalizedDomains.findIndex(
        nd => nd.domain.toLowerCase() === current.domain.toLowerCase()
      );
      if (dupIdx >= 0) {
        stateChanged = true;
        // Prefer subdomain/addon record or most recent record
        normalizedDomains[dupIdx] = current;
      } else {
        normalizedDomains.push(current);
      }
    }

    this.state.domains = normalizedDomains;

    if (accountId) {
      const acc = this.state.hostingAccounts.find(a => a.id === accountId);
      const existing = this.state.domains.filter(d => d.accountId === accountId);
      if (acc && !existing.some(d => d.type === 'primary')) {
        const autoPrimary: DomainEntity = {
          id: `dom-primary-${acc.id}`,
          accountId: acc.id,
          domain: acc.primaryDomain,
          type: 'primary',
          documentRoot: acc.documentRoot || `/home/${acc.username}/public_html`,
          phpVersion: acc.phpVersion || '8.2',
          sslStatus: acc.sslStatus === 'active' ? 'active' : 'pending',
          createdAt: acc.createdAt || new Date().toISOString(),
        };
        this.state.domains.push(autoPrimary);
        return [autoPrimary, ...existing];
      }
      return existing;
    }

    return this.state.domains;
  }

  public saveDomain(domain: DomainEntity): void {
    if (!this.state.domains) this.state.domains = [];
    const stamped = { ...domain, _updatedAt: Date.now() } as DomainEntity;
    const idx = this.state.domains.findIndex(
      d => d.id === stamped.id || d.domain.toLowerCase() === stamped.domain.toLowerCase()
    );
    if (idx >= 0) {
      this.state.domains[idx] = stamped;
    } else {
      this.state.domains.push(stamped);
    }
    this.saveState();
  }

  public deleteDomain(id: string): void {
    if (!this.state.domains) return;
    this.markDeleted(id);
    this.state.domains = this.state.domains.filter(d => d.id !== id);
    this.saveState(true, true);
  }

  // --- Databases ---
  public getDatabases(accountId: string): DatabaseEntity[] {
    return this.state.databases.filter(d => d.accountId === accountId);
  }

  public saveDatabase(db: DatabaseEntity): void {
    const idx = this.state.databases.findIndex(d => d.id === db.id);
    if (idx >= 0) {
      this.state.databases[idx] = db;
    } else {
      this.state.databases.push(db);
    }
    this.saveState();
  }

  public deleteDatabase(id: string): void {
    const dbObj = this.state.databases.find(d => d.id === id);
    if (dbObj && this.state.databaseTables && this.state.databaseTables[dbObj.dbName]) {
      delete this.state.databaseTables[dbObj.dbName];
    }
    this.markDeleted(id);
    this.state.databases = this.state.databases.filter(d => d.id !== id);
    this.saveState(true, true);
  }

  // --- Database Tables (phpMyAdmin Per-Database Storage) ---
  public getDatabaseTables(dbName: string): DatabaseTableEntity[] {
    if (!this.state.databaseTables) {
      this.state.databaseTables = {};
    }
    return this.state.databaseTables[dbName] || [];
  }

  public saveDatabaseTable(dbName: string, table: DatabaseTableEntity): void {
    if (!this.state.databaseTables) {
      this.state.databaseTables = {};
    }
    if (!this.state.databaseTables[dbName]) {
      this.state.databaseTables[dbName] = [];
    }
    const idx = this.state.databaseTables[dbName].findIndex(t => t.name.toLowerCase() === table.name.toLowerCase());
    if (idx >= 0) {
      this.state.databaseTables[dbName][idx] = table;
    } else {
      this.state.databaseTables[dbName].push(table);
    }

    // Recalculate database size
    const totalKb = this.state.databaseTables[dbName].reduce((acc, t) => acc + (t.sizeKb || 16), 0);
    const dbObj = this.state.databases.find(d => d.dbName === dbName);
    if (dbObj) {
      dbObj.sizeMb = Math.max(0.1, Number((totalKb / 1024).toFixed(2)));
    }

    this.saveState();
  }

  public deleteDatabaseTable(dbName: string, tableName: string): void {
    if (!this.state.databaseTables || !this.state.databaseTables[dbName]) return;
    this.state.databaseTables[dbName] = this.state.databaseTables[dbName].filter(
      t => t.name.toLowerCase() !== tableName.toLowerCase()
    );

    const totalKb = this.state.databaseTables[dbName].reduce((acc, t) => acc + (t.sizeKb || 16), 0);
    const dbObj = this.state.databases.find(d => d.dbName === dbName);
    if (dbObj) {
      dbObj.sizeMb = Math.max(0.1, Number((totalKb / 1024).toFixed(2)));
    }

    this.markDeleted(`dbtable-${dbName}-${tableName}`);
    this.saveState(true, true);
  }

  public clearDatabaseTables(dbName: string): void {
    if (!this.state.databaseTables) {
      this.state.databaseTables = {};
    }
    this.state.databaseTables[dbName] = [];
    const dbObj = this.state.databases.find(d => d.dbName === dbName);
    if (dbObj) {
      dbObj.sizeMb = 0.1;
    }
    this.saveState();
  }

  // --- Email Mailboxes ---
  public getEmails(accountId: string): EmailMailbox[] {
    return this.state.emailMailboxes.filter(m => m.accountId === accountId);
  }

  public saveEmail(mailbox: EmailMailbox): void {
    const idx = this.state.emailMailboxes.findIndex(m => m.id === mailbox.id);
    if (idx >= 0) {
      this.state.emailMailboxes[idx] = mailbox;
    } else {
      this.state.emailMailboxes.push(mailbox);
    }
    this.saveState();
  }

  public deleteEmail(id: string): void {
    this.markDeleted(id);
    this.state.emailMailboxes = this.state.emailMailboxes.filter(m => m.id !== id);
    this.saveState(true, true);
  }

  // --- Cron Jobs ---
  public getCronJobs(accountId: string): CronJobItem[] {
    return this.state.cronJobs.filter(c => c.accountId === accountId);
  }

  public saveCronJob(job: CronJobItem): void {
    const idx = this.state.cronJobs.findIndex(c => c.id === job.id);
    if (idx >= 0) {
      this.state.cronJobs[idx] = job;
    } else {
      this.state.cronJobs.push(job);
    }
    this.saveState();
  }

  public deleteCronJob(id: string): void {
    this.markDeleted(id);
    this.state.cronJobs = this.state.cronJobs.filter(c => c.id !== id);
    this.saveState(true, true);
  }

  // --- Backups ---
  public getBackups(accountId?: string): AccountBackup[] {
    if (!Array.isArray(this.state.backups)) {
      this.state.backups = [...INITIAL_STATE.backups];
    }
    const list = this.state.backups.map(b => ({
      ...b,
      sizeMb: Number(b?.sizeMb) || 50.0,
      createdAt: b?.createdAt || new Date().toISOString(),
    }));
    if (accountId) {
      return list.filter(b => b.accountId === accountId);
    }
    return list;
  }

  public saveBackup(backup: AccountBackup): void {
    if (!Array.isArray(this.state.backups)) {
      this.state.backups = [];
    }
    const idx = this.state.backups.findIndex(b => b.id === backup.id);
    if (idx >= 0) {
      this.state.backups[idx] = backup;
    } else {
      this.state.backups.unshift(backup);
    }
    this.saveState();
  }

  public deleteBackup(id: string): void {
    if (!Array.isArray(this.state.backups)) return;
    this.markDeleted(id);
    this.state.backups = this.state.backups.filter(b => b.id !== id);
    this.saveState(true, true);
  }

  // --- Invoices ---
  public getInvoices(userId?: string): Invoice[] {
    if (!Array.isArray(this.state.invoices)) {
      this.state.invoices = [...INITIAL_STATE.invoices];
    }
    const normalized = this.state.invoices.map(inv => ({
      ...inv,
      amount: Number(inv?.amount) || 350000,
      currency: inv?.currency || 'IDR',
      status: inv?.status || 'unpaid',
      dueDate: inv?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: inv?.createdAt || new Date().toISOString(),
      items:
        Array.isArray(inv?.items) && inv.items.length > 0
          ? inv.items
          : [
              {
                description: String((inv as any)?.description || 'Tagihan Otomatis Perpanjangan Cloud Hosting & Domain'),
                qty: 1,
                unitPrice: Number(inv?.amount) || 350000,
                amount: Number(inv?.amount) || 350000,
              },
            ],
    }));
    if (userId) {
      return normalized.filter(i => i.userId === userId || i.resellerId === userId);
    }
    return normalized;
  }

  public saveInvoice(invoice: Invoice): void {
    if (!Array.isArray(this.state.invoices)) {
      this.state.invoices = [];
    }
    const normalized: Invoice = {
      ...invoice,
      items:
        Array.isArray(invoice.items) && invoice.items.length > 0
          ? invoice.items
          : [
              {
                description: String(invoice.description || 'Tagihan Otomatis Layanan Cloud Hosting'),
                qty: 1,
                unitPrice: Number(invoice.amount) || 350000,
                amount: Number(invoice.amount) || 350000,
              },
            ],
    };
    const idx = this.state.invoices.findIndex(i => i.id === normalized.id);
    const stamped = { ...normalized, _updatedAt: Date.now() } as Invoice;
    if (idx >= 0) {
      this.state.invoices[idx] = stamped;
    } else {
      this.state.invoices.unshift(stamped);
    }
    this.saveState();
  }

  public createManualInvoice(invoice: Invoice, _actor?: any): Invoice {
    this.saveInvoice(invoice);
    return invoice;
  }

  public deleteInvoice(id: string): void {
    if (!Array.isArray(this.state.invoices)) return;
    this.markDeleted(id);
    this.state.invoices = this.state.invoices.filter(i => i.id !== id);
    this.saveState(true, true);
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public logAction(
    user: { id: string; name: string; role: any },
    action: string,
    category: AuditLog['category'],
    details: string,
    ipAddress = '182.253.110.42'
  ): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      category,
      ipAddress,
      details,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.saveState();
  }

  public addAuditLog(action: string, category: string, details: string): void {
    const user = this.state.users[0] || { id: 'usr-admin-01', name: 'Root Administrator', role: 'admin' };
    this.logAction(user, action, category as any, details);
  }

  // --- Firewall Rules ---
  public getFirewallRules(): FirewallRule[] {
    return this.state.firewallRules;
  }

  public saveFirewallRule(rule: FirewallRule): void {
    const idx = this.state.firewallRules.findIndex(r => r.id === rule.id);
    if (idx >= 0) {
      this.state.firewallRules[idx] = rule;
    } else {
      this.state.firewallRules.push(rule);
    }
    this.saveState();
  }

  public deleteFirewallRule(id: string): void {
    this.markDeleted(id);
    this.state.firewallRules = this.state.firewallRules.filter(r => r.id !== id);
    this.saveState(true, true);
  }

  // --- API Keys ---
  public getApiKeys(userId?: string): ApiKeyItem[] {
    if (userId) {
      return this.state.apiKeys.filter(k => k.userId === userId);
    }
    return this.state.apiKeys;
  }

  public saveApiKey(key: ApiKeyItem): void {
    this.state.apiKeys.unshift(key);
    this.saveState();
  }

  public deleteApiKey(id: string): void {
    this.markDeleted(id);
    this.state.apiKeys = this.state.apiKeys.filter(k => k.id !== id);
    this.saveState(true, true);
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    return this.state.notifications;
  }

  public addNotification(title: string, message: string, type: AppNotification['type'] = 'info'): void {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.state.notifications.unshift(notif);
    this.saveState();
  }

  public markNotificationAsRead(id: string): void {
    const n = this.state.notifications.find(x => x.id === id);
    if (n) {
      n.isRead = true;
      this.saveState();
    }
  }

  public markAllNotificationsRead(): void {
    this.state.notifications.forEach(n => { n.isRead = true; });
    this.saveState();
  }

  // --- VPS Management Methods ---
  public getVpsInstances(customerId?: string, resellerId?: string): VpsInstance[] {
    return this.state.vpsInstances.filter(v => {
      if (customerId && v.customerId !== customerId) return false;
      if (resellerId && v.resellerId !== resellerId) return false;
      return true;
    });
  }

  public getVpsById(id: string): VpsInstance | undefined {
    return this.state.vpsInstances.find(v => v.id === id);
  }

  public saveVpsInstance(vps: VpsInstance): void {
    const idx = this.state.vpsInstances.findIndex(v => v.id === vps.id);
    if (idx >= 0) {
      this.state.vpsInstances[idx] = vps;
    } else {
      this.state.vpsInstances.unshift(vps);
    }
    this.saveState();
  }

  public updateVpsStatus(id: string, status: VpsInstance['status']): void {
    const v = this.state.vpsInstances.find(x => x.id === id);
    if (v) {
      v.status = status;
      if (status === 'running') {
        v.liveCpuPct = +(Math.random() * 25 + 10).toFixed(1);
        v.liveRamMb = Math.round(v.ramMb * (0.3 + Math.random() * 0.3));
        v.uptime = 'Just started';
      } else if (status === 'stopped') {
        v.liveCpuPct = 0;
        v.liveRamMb = 0;
        v.uptime = 'Offline';
      }
      this.saveState();
    }
  }

  public deleteVpsInstance(id: string): void {
    const snapIds = this.state.vpsSnapshots.filter(s => s.vpsId === id).map(s => s.id);
    const ruleIds = this.state.vpsFirewallRules.filter(f => f.vpsId === id).map(f => f.id);
    this.markDeleted([id, ...snapIds, ...ruleIds]);
    this.state.vpsInstances = this.state.vpsInstances.filter(v => v.id !== id);
    this.state.vpsSnapshots = this.state.vpsSnapshots.filter(s => s.vpsId !== id);
    this.state.vpsFirewallRules = this.state.vpsFirewallRules.filter(f => f.vpsId !== id);
    this.saveState(true, true);
  }

  public getVpsSnapshots(vpsId?: string): VpsSnapshot[] {
    if (vpsId) {
      return this.state.vpsSnapshots.filter(s => s.vpsId === vpsId);
    }
    return this.state.vpsSnapshots;
  }

  public saveVpsSnapshot(snapshot: VpsSnapshot): void {
    this.state.vpsSnapshots.unshift(snapshot);
    this.saveState();
  }

  public deleteVpsSnapshot(id: string): void {
    this.markDeleted(id);
    this.state.vpsSnapshots = this.state.vpsSnapshots.filter(s => s.id !== id);
    this.saveState(true, true);
  }

  public getVpsFirewallRules(vpsId?: string): VpsFirewallRule[] {
    if (vpsId) {
      return this.state.vpsFirewallRules.filter(r => r.vpsId === vpsId);
    }
    return this.state.vpsFirewallRules;
  }

  public saveVpsFirewallRule(rule: VpsFirewallRule): void {
    this.state.vpsFirewallRules.unshift(rule);
    this.saveState();
  }

  public deleteVpsFirewallRule(id: string): void {
    this.markDeleted(id);
    this.state.vpsFirewallRules = this.state.vpsFirewallRules.filter(r => r.id !== id);
    this.saveState(true, true);
  }

  // --- IP Address Management ---
  public getIpAddresses(): IpAddressRecord[] {
    if (!this.state.ipAddresses || this.state.ipAddresses.length === 0) {
      this.state.ipAddresses = [...INITIAL_STATE.ipAddresses];
      this.saveState();
    }
    return this.state.ipAddresses;
  }

  public clearAllSampleIps(): void {
    this.state.ipAddresses = [];
    this.saveState();
  }

  public addIpAddress(ip: Omit<IpAddressRecord, "id" | "createdAt">): IpAddressRecord {
    const newRecord: IpAddressRecord = {
      ...ip,
      id: "ip-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    if (!this.state.ipAddresses) {
      this.state.ipAddresses = [];
    }
    this.state.ipAddresses.push(newRecord);
    this.saveState();
    return newRecord;
  }

  public updateIpAddress(updated: IpAddressRecord): void {
    const idx = (this.state.ipAddresses || []).findIndex(i => i.id === updated.id);
    if (idx >= 0) {
      this.state.ipAddresses[idx] = updated;
      this.saveState();
    }
  }

  public deleteIpAddress(id: string): void {
    this.markDeleted(id);
    this.state.ipAddresses = (this.state.ipAddresses || []).filter(i => i.id !== id);
    this.saveState(true, true);
  }

  public applyGlobalPublicIp(newPublicIp: string): { updatedServers: number; updatedAccounts: number; updatedDns: number } {
    const cleanIp = newPublicIp.trim();
    let updatedServers = 0;
    let updatedAccounts = 0;
    let updatedDns = 0;

    if (this.state.serverNodes.length > 0) {
      this.state.serverNodes[0].ipAddress = cleanIp;
      updatedServers = 1;
    }

    (this.state.nameserverConfigs || []).forEach(ns => {
      if (ns.isDefaultGlobal) {
        ns.ns1Ip = cleanIp;
        ns.ns2Ip = cleanIp;
      }
    });

    (this.state.hostingAccounts || []).forEach(acc => {
      acc.ipAddress = cleanIp;
      updatedAccounts++;
    });

    (this.state.resellerProfiles || []).forEach(res => {
      res.assignedIp = cleanIp;
    });

    (this.state.dnsRecords || []).forEach(dns => {
      if (dns.type === 'A') {
        dns.content = cleanIp;
        updatedDns++;
      } else if (dns.type === 'TXT' && dns.content.includes('ip4:')) {
        dns.content = dns.content.replace(/ip4:[0-9.]+/, `ip4:${cleanIp}`);
        updatedDns++;
      }
    });

    this.saveState();
    return { updatedServers, updatedAccounts, updatedDns };
  }

  public assignDedicatedIpToAccount(ipId: string, accountId: string): boolean {
    const ip = (this.state.ipAddresses || []).find(i => i.id === ipId);
    const account = this.state.hostingAccounts.find(a => a.id === accountId);
    if (!ip || !account) return false;

    ip.type = "dedicated";
    ip.status = "assigned";
    ip.assignedToType = "account";
    ip.assignedToId = account.id;
    ip.assignedToName = account.username + " (" + account.primaryDomain + ")";
    ip.assignedDomain = account.primaryDomain;
    ip.ptrRecord = "mail." + account.primaryDomain;

    account.ipAddress = ip.ip;

    this.state.dnsRecords.forEach(dns => {
      if (dns.accountId === account.id) {
        if (dns.type === "A") {
          dns.content = ip.ip;
        } else if (dns.type === "TXT" && dns.content.includes("ip4:")) {
          dns.content = dns.content.replace(/ip4:[0-9.]+/, "ip4:" + ip.ip);
        }
      }
    });

    this.saveState();
    return true;
  }

  public releaseIpAddress(ipId: string): void {
    const ip = (this.state.ipAddresses || []).find(i => i.id === ipId);
    if (!ip) return;

    if (ip.assignedToId && ip.assignedToType === "account") {
      const server = this.state.serverNodes.find(s => s.id === ip.serverId) || this.state.serverNodes[0];
      const account = this.state.hostingAccounts.find(a => a.id === ip.assignedToId);
      if (account && server) {
        account.ipAddress = server.ipAddress;
        this.state.dnsRecords.forEach(dns => {
          if (dns.accountId === account.id) {
            if (dns.type === "A") {
              dns.content = server.ipAddress;
            } else if (dns.type === "TXT" && dns.content.includes("ip4:")) {
              dns.content = dns.content.replace(/ip4:[0-9.]+/, "ip4:" + server.ipAddress);
            }
          }
        });
      }
    }

    ip.status = "available";
    ip.assignedToType = undefined;
    ip.assignedToId = undefined;
    ip.assignedToName = undefined;
    ip.assignedDomain = undefined;

    this.saveState();
  }

  // --- Private Nameservers & DNS Cluster ---
  public getNameserverConfigs(): PrivateNameserverConfig[] {
    if (!this.state.nameserverConfigs || this.state.nameserverConfigs.length === 0) {
      this.state.nameserverConfigs = [...(INITIAL_STATE.nameserverConfigs || [])];
    }
    return this.state.nameserverConfigs;
  }

  public getDefaultNameserverConfig(): PrivateNameserverConfig {
    const list = this.getNameserverConfigs();
    return list.find(n => n.isDefaultGlobal) || list[0] || INITIAL_STATE.nameserverConfigs[0];
  }

  public saveNameserverConfig(config: PrivateNameserverConfig): void {
    if (!this.state.nameserverConfigs) this.state.nameserverConfigs = [];
    const idx = this.state.nameserverConfigs.findIndex(n => n.id === config.id);
    if (config.isDefaultGlobal) {
      this.state.nameserverConfigs.forEach(n => { n.isDefaultGlobal = false; });
    }
    if (idx >= 0) {
      this.state.nameserverConfigs[idx] = config;
    } else {
      this.state.nameserverConfigs.unshift(config);
    }
    this.saveState();
  }

  public deleteNameserverConfig(id: string): void {
    if (!this.state.nameserverConfigs) return;
    this.markDeleted(id);
    this.state.nameserverConfigs = this.state.nameserverConfigs.filter(n => n.id !== id);
    if (this.state.nameserverConfigs.length > 0 && !this.state.nameserverConfigs.some(n => n.isDefaultGlobal)) {
      this.state.nameserverConfigs[0].isDefaultGlobal = true;
    }
    this.saveState(true, true);
  }

  public syncAllAccountsToNameserver(nsConfig: PrivateNameserverConfig): number {
    let count = 0;
    const accounts = this.state.hostingAccounts || [];
    accounts.forEach(acc => {
      // Find or update NS records for this account
      const existingNs = this.state.dnsRecords.filter(d => d.accountId === acc.id && d.type === 'NS');
      if (existingNs.length >= 2) {
        existingNs[0].content = nsConfig.ns1Host;
        existingNs[1].content = nsConfig.ns2Host;
        count++;
      } else {
        // Remove partial
        this.state.dnsRecords = this.state.dnsRecords.filter(d => !(d.accountId === acc.id && d.type === 'NS'));
        this.state.dnsRecords.push({
          id: `dns-ns1-${acc.id}-${Date.now()}`,
          accountId: acc.id,
          domain: acc.primaryDomain,
          type: 'NS',
          name: '@',
          content: nsConfig.ns1Host,
          ttl: nsConfig.defaultTtl || 86400,
        });
        this.state.dnsRecords.push({
          id: `dns-ns2-${acc.id}-${Date.now()}`,
          accountId: acc.id,
          domain: acc.primaryDomain,
          type: 'NS',
          name: '@',
          content: nsConfig.ns2Host,
          ttl: nsConfig.defaultTtl || 86400,
        });
        count++;
      }
    });
    this.saveState();
    return count;
  }

  // Cloudflare R2 & Media Optimizer Methods
  public getR2Configs(): CloudflareR2Config[] {
    return this.state.r2Configs || [];
  }

  public getR2ConfigForAccount(accountId: string): CloudflareR2Config {
    if (!this.state.r2Configs) this.state.r2Configs = [];
    const acc = this.state.hostingAccounts.find(a => a.id === accountId);
    const cleanDomain = (acc?.primaryDomain || 'website.my.id').toLowerCase().trim();
    const cleanSlug = (acc?.username || cleanDomain.replace(/[^a-z0-9]/g, '-')).toLowerCase();

    const specific = this.state.r2Configs.find(r => r.accountId === accountId);
    if (specific) {
      // If a non-root account accidentally had karsacloud.biz.id as its CDN domain, auto-bind to its own domain
      if (accountId !== 'acc-rdm-01' && acc && specific.publicCdnDomain.includes('karsacloud.biz.id')) {
        specific.publicCdnDomain = `https://media.${cleanDomain}`;
        specific.bucketName = `r2-${cleanSlug}-media`;
      }
      return specific;
    }

    if (acc) {
      const autoBoundConfig: CloudflareR2Config = {
        id: `r2-cfg-${acc.id}`,
        accountId: acc.id,
        bucketName: acc.id === 'acc-rdm-01' ? 'media-madrasah-karsacloud' : `r2-${cleanSlug}-media`,
        accountIdCloudflare: 'cf_acc_9837190f84a1e948',
        accessKeyId: `r2_key_${cleanSlug}_auto`,
        secretAccessKeyMasked: '********************************',
        publicCdnDomain: `https://media.${cleanDomain}`,
        autoWebpCompression: true,
        compressionQuality: 82,
        maxDimensionPx: 1920,
        stripExifGps: true,
        status: 'connected',
        lastSyncedAt: new Date().toISOString(),
      };
      this.state.r2Configs.push(autoBoundConfig);
      return autoBoundConfig;
    }

    return INITIAL_STATE.r2Configs[0];
  }

  public saveR2Config(config: CloudflareR2Config): void {
    if (!this.state.r2Configs) this.state.r2Configs = [];
    const idx = this.state.r2Configs.findIndex(
      r => r.id === config.id || r.accountId === config.accountId
    );
    if (idx >= 0) {
      this.state.r2Configs[idx] = config;
    } else {
      this.state.r2Configs.unshift(config);
    }
    this.saveState();
  }

  public getOptimizedMedia(accountId?: string): OptimizedMediaFile[] {
    const list = this.state.optimizedMedia || [];
    if (!accountId) return list;
    if (accountId === 'acc-rdm-01') {
      return list.filter(m => m.accountId === accountId || m.accountId === 'global');
    }
    return list.filter(m => m.accountId === accountId);
  }

  public addOptimizedMedia(item: OptimizedMediaFile): void {
    if (!this.state.optimizedMedia) this.state.optimizedMedia = [];
    this.state.optimizedMedia.unshift(item);
    this.saveState();
  }

  public deleteOptimizedMedia(id: string): void {
    if (!this.state.optimizedMedia) return;
    this.markDeleted(id);
    this.state.optimizedMedia = this.state.optimizedMedia.filter(m => m.id !== id);
    this.saveState(true, true);
  }

  // Karsa Cloud PRO Official Letterhead, Owner & Bank Account Config Methods
  public getLetterheadConfig(): CloudProLetterheadConfig {
    try {
      const raw = localStorage.getItem(LETTERHEAD_STORAGE_KEY);
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (
          !parsed.headerTitle ||
          parsed.headerTitle === 'CLOUD PRO ENTERPRISE SERVER' ||
          parsed.headerTitle === 'PLATFORM CLOUD PRO' ||
          parsed.headerTitle === 'CLOUD PRO ENTERPRISE' ||
          parsed.headerTitle === 'CLOUD PRO' ||
          parsed.headerTitle === 'Karsa Cloud'
        ) {
          parsed.headerTitle = 'KARSA CLOUD PRO';
        }
        if (
          !parsed.ownerTitle ||
          parsed.ownerTitle.includes('Server Cloud PRO') ||
          parsed.ownerTitle.includes('Platform Cloud PRO') ||
          parsed.ownerTitle === 'Pemilik & Root Administrator Karsa Cloud' ||
          parsed.ownerTitle === 'Pemilik & Root Administrator Cloud PRO'
        ) {
          parsed.ownerTitle = 'Pemilik & Root Administrator Karsa Cloud PRO';
        }
        if (
          !parsed.bank1Holder ||
          parsed.bank1Holder.includes('Server Cloud PRO') ||
          parsed.bank1Holder.includes('Platform Cloud PRO') ||
          parsed.bank1Holder === 'Jaenal Maskun (Karsa Cloud)' ||
          parsed.bank1Holder === 'Jaenal Maskun (Cloud PRO)'
        ) {
          parsed.bank1Holder = 'Jaenal Maskun (Karsa Cloud PRO)';
        }
        if (
          !parsed.bank2Holder ||
          parsed.bank2Holder === 'Jaenal Maskun' ||
          parsed.bank2Holder.includes('Server Cloud PRO')
        ) {
          parsed.bank2Holder = 'Jaenal Maskun (Karsa Cloud PRO)';
        }
        if (typeof parsed.footerNote === 'string') {
          parsed.footerNote = parsed.footerNote
            .replace(/Server Cloud PRO/g, 'Karsa Cloud PRO')
            .replace(/Platform Cloud PRO/g, 'Karsa Cloud PRO')
            .replace(/Karsa Cloud(?! PRO)/g, 'Karsa Cloud PRO');
        }
        if (typeof parsed.qrisInfo === 'string') {
          parsed.qrisInfo = parsed.qrisInfo
            .replace(/Nusantara Host/g, 'Karsa Cloud PRO')
            .replace(/Server Cloud PRO/g, 'Karsa Cloud PRO')
            .replace(/Karsa Cloud(?! PRO)/g, 'Karsa Cloud PRO');
        }
        return { ...DEFAULT_LETTERHEAD_CONFIG, ...(this.state.letterheadConfig || {}), ...parsed };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_LETTERHEAD_CONFIG, ...(this.state.letterheadConfig || {}) };
  }

  public saveLetterheadConfig(cfg: CloudProLetterheadConfig): void {
    this.state.letterheadConfig = cfg;
    try {
      localStorage.setItem(LETTERHEAD_STORAGE_KEY, JSON.stringify(cfg));
    } catch {
      // ignore
    }
    this.saveState();
  }

  // --- Support Tickets ---
  public getSupportTickets(filter?: { customerId?: string; resellerId?: string; role?: string }): SupportTicket[] {
    if (!Array.isArray(this.state.supportTickets)) {
      this.state.supportTickets = [...(INITIAL_STATE.supportTickets || [])];
    }
    const tickets = this.state.supportTickets;
    if (!filter) return tickets;
    if (filter.role === 'admin') return tickets;
    if (filter.role === 'reseller' && filter.resellerId) {
      return tickets.filter(t => t.resellerId === filter.resellerId || t.customerId === filter.customerId);
    }
    if (filter.customerId) {
      return tickets.filter(t => t.customerId === filter.customerId);
    }
    return tickets;
  }

  public getSupportTicketById(id: string): SupportTicket | undefined {
    return this.getSupportTickets().find(t => t.id === id || t.ticketNumber === id);
  }

  public saveSupportTicket(ticket: SupportTicket): void {
    if (!Array.isArray(this.state.supportTickets)) {
      this.state.supportTickets = [];
    }
    const idx = this.state.supportTickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      this.state.supportTickets[idx] = { ...ticket, updatedAt: new Date().toISOString() };
    } else {
      this.state.supportTickets.unshift({ ...ticket, updatedAt: new Date().toISOString() });
    }
    this.saveState(true, true);
  }

  public createSupportTicket(data: {
    subject: string;
    department: TicketDepartment;
    priority: TicketPriority;
    customerId: string;
    customerName: string;
    customerEmail: string;
    resellerId?: string;
    relatedDomain?: string;
    relatedService?: string;
    initialMessage: string;
    authorRole?: 'admin' | 'reseller' | 'customer';
  }): SupportTicket {
    const nowIso = new Date().toISOString();
    const id = `tik-${Date.now().toString().slice(-6)}`;
    const ticketNumber = `TIK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialMsg: TicketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ticketId: id,
      authorId: data.customerId,
      authorName: data.customerName,
      authorRole: data.authorRole || 'customer',
      authorEmail: data.customerEmail,
      message: data.initialMessage,
      isStaffReply: data.authorRole === 'admin' || data.authorRole === 'reseller',
      createdAt: nowIso,
    };

    const newTicket: SupportTicket = {
      id,
      ticketNumber,
      subject: data.subject,
      department: data.department,
      priority: data.priority,
      status: 'open',
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      resellerId: data.resellerId,
      assignedStaffId: 'usr-admin-01',
      assignedStaffName: 'Jaenal Maskun',
      relatedDomain: data.relatedDomain,
      relatedService: data.relatedService,
      messages: [initialMsg],
      lastReplyAt: nowIso,
      lastReplyBy: data.customerName,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (!Array.isArray(this.state.supportTickets)) {
      this.state.supportTickets = [];
    }
    this.state.supportTickets.unshift(newTicket);
    this.saveState(true, true);
    return newTicket;
  }

  public replySupportTicket(
    ticketId: string,
    reply: {
      authorId: string;
      authorName: string;
      authorRole: 'admin' | 'reseller' | 'customer';
      authorEmail?: string;
      message: string;
      isStaffReply: boolean;
      isInternalNote?: boolean;
      attachments?: TicketAttachment[];
    }
  ): SupportTicket | null {
    const ticket = this.getSupportTicketById(ticketId);
    if (!ticket) return null;

    const nowIso = new Date().toISOString();
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ticketId: ticket.id,
      authorId: reply.authorId,
      authorName: reply.authorName,
      authorRole: reply.authorRole,
      authorEmail: reply.authorEmail,
      message: reply.message,
      attachments: reply.attachments,
      isStaffReply: reply.isStaffReply,
      isInternalNote: reply.isInternalNote,
      createdAt: nowIso,
    };

    ticket.messages.push(newMsg);
    if (!reply.isInternalNote) {
      ticket.lastReplyAt = nowIso;
      ticket.lastReplyBy = reply.authorName;
      if (reply.isStaffReply) {
        ticket.status = 'answered';
      } else {
        ticket.status = 'customer_reply';
      }
    }
    ticket.updatedAt = nowIso;

    this.saveSupportTicket(ticket);
    return ticket;
  }

  public updateSupportTicketStatus(ticketId: string, status: TicketStatus): boolean {
    const ticket = this.getSupportTicketById(ticketId);
    if (!ticket) return false;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.saveSupportTicket(ticket);
    return true;
  }

  public updateSupportTicketPriority(ticketId: string, priority: TicketPriority): boolean {
    const ticket = this.getSupportTicketById(ticketId);
    if (!ticket) return false;
    ticket.priority = priority;
    ticket.updatedAt = new Date().toISOString();
    this.saveSupportTicket(ticket);
    return true;
  }

  public deleteSupportTicket(ticketId: string): void {
    this.markDeleted(ticketId);
    if (Array.isArray(this.state.supportTickets)) {
      this.state.supportTickets = this.state.supportTickets.filter(t => t.id !== ticketId && t.ticketNumber !== ticketId);
    }
    this.saveState(true, true);
  }
}

export const db = new StorageService();
export const storage = db;
