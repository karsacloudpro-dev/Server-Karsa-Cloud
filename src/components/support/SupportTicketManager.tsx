import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  User as UserIcon,
  Shield,
  Trash2,
  X,
  Globe,
  Tag,
  Zap,
  Check,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { db } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import {
  SupportTicket,
  TicketDepartment,
  TicketPriority,
  TicketStatus,
} from '../../types';

export const SupportTicketManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast, confirmAction } = useServer();

  // State
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    db.getSupportTickets({
      role: currentUser?.role,
      customerId: currentUser?.id,
      resellerId: currentUser?.resellerId,
    })
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modals & Active View
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState('');
  const [newDepartment, setNewDepartment] = useState<TicketDepartment>('technical');
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium');
  const [newRelatedDomain, setNewRelatedDomain] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Reply Form State
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Domains for selection
  const accounts = db.getHostingAccounts();
  const availableDomains = useMemo(() => {
    const list: string[] = [];
    accounts.forEach(a => {
      if (a.primaryDomain) list.push(a.primaryDomain);
      const subs = db.getDomains(a.id);
      subs.forEach(s => {
        if (s.domain && !list.includes(s.domain)) list.push(s.domain);
      });
    });
    return list;
  }, [accounts]);

  const reloadTickets = () => {
    const updated = db.getSupportTickets({
      role: currentUser?.role,
      customerId: currentUser?.id,
      resellerId: currentUser?.resellerId,
    });
    setTickets([...updated]);
    if (activeTicket) {
      const refreshedActive = updated.find(t => t.id === activeTicket.id);
      if (refreshedActive) setActiveTicket(refreshedActive);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open' || t.status === 'customer_reply').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const answered = tickets.filter(t => t.status === 'answered').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const critical = tickets.filter(t => t.priority === 'critical' || t.priority === 'high').length;
    return { total, open, inProgress, answered, closed, critical };
  }, [tickets]);

  // Filtered List
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Status tab
      if (selectedStatusTab === 'open' && t.status !== 'open' && t.status !== 'customer_reply') return false;
      if (selectedStatusTab === 'in_progress' && t.status !== 'in_progress') return false;
      if (selectedStatusTab === 'answered' && t.status !== 'answered') return false;
      if (selectedStatusTab === 'closed' && t.status !== 'closed') return false;

      // Department filter
      if (selectedDepartment !== 'all' && t.department !== selectedDepartment) return false;

      // Priority filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = t.ticketNumber.toLowerCase().includes(q);
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchCust = t.customerName.toLowerCase().includes(q);
        const matchDomain = (t.relatedDomain || '').toLowerCase().includes(q);
        if (!matchNumber && !matchSubject && !matchCust && !matchDomain) return false;
      }

      return true;
    });
  }, [tickets, selectedStatusTab, selectedDepartment, selectedPriority, searchQuery]);

  // Canned Responses / Templates
  const cannedTemplates = [
    {
      title: 'DNS Propagasi',
      text: 'Halo, perubahan dan konfigurasi DNS Record memerlukan waktu propagasi jaringan berkisar 15 menit hingga 24 jam. Anda dapat memantau status resolusi IP secara berkala.',
    },
    {
      title: 'SSL Let’s Encrypt',
      text: 'Sertifikat SSL Let’s Encrypt telah diverifikasi aktif di server. Seluruh lalu lintas website kini dienkripsi menggunakan HTTPS dengan protokol TLS 1.3.',
    },
    {
      title: 'Kapasitas Kuota Disk',
      text: 'Alokasi penyimpanan SSD NVMe akun Anda telah disesuaikan dengan kebutuhan. Silakan periksa sisa kuota pada menu Disk Usage & Cleaner.',
    },
    {
      title: 'Restorasi Cadangan Berhasil',
      text: 'Berkas cadangan website dan database telah berhasil dipulihkan secara otomatis. Sistem telah menyinkronkan seluruh modul dan aset ke direktori aktif.',
    },
  ];

  // Handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      showToast('error', 'Form Belum Lengkap', 'Judul tiket dan isi pesan tidak boleh kosong.');
      return;
    }

    setIsSubmittingNew(true);
    try {
      const created = db.createSupportTicket({
        subject: newSubject.trim(),
        department: newDepartment,
        priority: newPriority,
        customerId: currentUser?.id || 'usr-cust-02',
        customerName: currentUser?.name || 'Pelanggan Karsa Cloud',
        customerEmail: currentUser?.email || 'user@karsacloud.biz.id',
        resellerId: currentUser?.resellerId,
        relatedDomain: newRelatedDomain || undefined,
        initialMessage: newMessage.trim(),
        authorRole: currentUser?.role || 'customer',
      });

      showToast('success', 'Tiket Berhasil Dibuat!', `Nomor Tiket: ${created.ticketNumber}`);
      setNewSubject('');
      setNewMessage('');
      setNewRelatedDomain('');
      setIsCreateModalOpen(false);
      reloadTickets();
      setActiveTicket(created);
    } catch {
      showToast('error', 'Gagal Membuat Tiket', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'reseller';
      const updated = db.replySupportTicket(activeTicket.id, {
        authorId: currentUser?.id || 'usr-anon',
        authorName: currentUser?.name || 'User Support',
        authorRole: currentUser?.role || 'customer',
        authorEmail: currentUser?.email,
        message: replyText.trim(),
        isStaffReply: isStaff,
        isInternalNote: isStaff ? isInternalNote : false,
      });

      if (updated) {
        showToast('success', 'Balasan Terkirim', 'Pesan berhasil ditambahkan ke thread tiket.');
        setReplyText('');
        setIsInternalNote(false);
        setActiveTicket({ ...updated });
        reloadTickets();
      }
    } catch {
      showToast('error', 'Gagal Mengirim Balasan', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!activeTicket) return;
    const ok = db.updateSupportTicketStatus(activeTicket.id, status);
    if (ok) {
      showToast('success', 'Status Diperbarui', `Tiket ${activeTicket.ticketNumber} diubah ke ${status}.`);
      setActiveTicket({ ...activeTicket, status });
      reloadTickets();
    }
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    if (!activeTicket) return;
    const ok = db.updateSupportTicketPriority(activeTicket.id, priority);
    if (ok) {
      showToast('success', 'Prioritas Diperbarui', `Prioritas diubah ke ${priority}.`);
      setActiveTicket({ ...activeTicket, priority });
      reloadTickets();
    }
  };

  const handleDeleteTicket = (ticket: SupportTicket) => {
    confirmAction({
      title: `Hapus Tiket ${ticket.ticketNumber}?`,
      message: `Tiket "${ticket.subject}" akan dihapus permanen dari riwayat bantuan. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Tiket',
      isDanger: true,
      onConfirm: () => {
        db.deleteSupportTicket(ticket.id);
        if (activeTicket?.id === ticket.id) setActiveTicket(null);
        showToast('info', 'Tiket Dihapus', `Tiket ${ticket.ticketNumber} telah dihapus.`);
        reloadTickets();
      },
    });
  };

  // Badges Helpers
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Terbuka
          </span>
        );
      case 'customer_reply':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Balasan Klien
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Diproses
          </span>
        );
      case 'answered':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Terjawab
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Tertunda
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <Check className="h-3 w-3 text-slate-500" />
            Selesai
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            <AlertCircle className="h-3 w-3 text-rose-600" />
            Darurat
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            Tinggi
          </span>
        );
      case 'medium':
        return (
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
            Sedang
          </span>
        );
      case 'low':
        return (
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Rendah
          </span>
        );
    }
  };

  const getDepartmentLabel = (dep: TicketDepartment) => {
    switch (dep) {
      case 'technical':
        return 'Bantuan Teknis (Hosting/Server)';
      case 'billing':
        return 'Pembayaran & Tagihan';
      case 'server_network':
        return 'Jaringan, Tunnel & Cloud';
      case 'domain_ssl':
        return 'Domain, DNS & SSL';
      case 'general':
        return 'Pertanyaan Umum';
    }
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. METRICS CARDS                                                    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tiket</span>
            <MessageSquare className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          <div className="mt-0.5 text-[10px] text-slate-500">Seluruh riwayat</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Perlu Respon</span>
            <LifeBuoy className="h-4 w-4 animate-spin text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-200">{stats.open}</div>
          <div className="mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-400">Tiket Terbuka / Balasan Klien</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diproses</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900 dark:text-amber-200">{stats.inProgress}</div>
          <div className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-400">Dalam Penanganan Tim</div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Terjawab</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-900 dark:text-indigo-200">{stats.answered}</div>
          <div className="mt-0.5 text-[10px] text-indigo-700 dark:text-indigo-400">Menunggu Respon Klien</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Selesai</span>
            <Check className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.closed}</div>
          <div className="mt-0.5 text-[10px] text-slate-500">Tiket Ditutup</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Prioritas Kritis</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900 dark:text-rose-200">{stats.critical}</div>
          <div className="mt-0.5 text-[10px] text-rose-700 dark:text-rose-400">Tinggi &amp; Darurat</div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. ACTIONS & FILTERS HEADER                                         */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-sky-500" />
              <span>Tiket Bantuan &amp; Helpdesk 24/7</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Layanan bantuan terpadu untuk masalah server, domain, database, backup, dan penagihan Karsa Cloud.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reloadTickets}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Muat Ulang</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-blue-500 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Tiket Baru</span>
            </button>
          </div>
        </div>

        {/* Tab Filter Status */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-slate-800">
          {[
            { id: 'all', label: 'Semua Tiket', count: stats.total },
            { id: 'open', label: 'Terbuka / Butuh Respon', count: stats.open },
            { id: 'in_progress', label: 'Sedang Diproses', count: stats.inProgress },
            { id: 'answered', label: 'Terjawab', count: stats.answered },
            { id: 'closed', label: 'Selesai / Ditutup', count: stats.closed },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedStatusTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedStatusTab === tab.id
                    ? 'bg-sky-800/80 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nomor tiket (TIK-...), judul masalah, domain, atau nama pelanggan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">Semua Departemen</option>
              <option value="technical">Bantuan Teknis</option>
              <option value="domain_ssl">Domain, DNS &amp; SSL</option>
              <option value="server_network">Jaringan &amp; Cloud</option>
              <option value="billing">Tagihan &amp; Pembayaran</option>
              <option value="general">Umum</option>
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="critical">Darurat (Critical)</option>
              <option value="high">Tinggi (High)</option>
              <option value="medium">Sedang (Medium)</option>
              <option value="low">Rendah (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. TICKETS LIST TABLE                                               */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Nomor Tiket &amp; Judul</th>
                <th className="px-5 py-3.5">Pelanggan &amp; Domain</th>
                <th className="px-5 py-3.5">Departemen</th>
                <th className="px-5 py-3.5">Prioritas</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Pembaruan Terakhir</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">
                    <LifeBuoy className="h-8 w-8 mx-auto text-slate-300 mb-2 opacity-50" />
                    Tidak ada tiket bantuan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => setActiveTicket(ticket)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <MessageSquare className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {ticket.ticketNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({ticket.messages.length} pesan)
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                            {ticket.subject}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {ticket.customerName}
                      </div>
                      {ticket.relatedDomain ? (
                        <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400 flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3" />
                          <span>{ticket.relatedDomain}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">Layanan Umum</div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {getDepartmentLabel(ticket.department).split('(')[0]}
                      </span>
                    </td>

                    <td className="px-5 py-4">{getPriorityBadge(ticket.priority)}</td>

                    <td className="px-5 py-4">{getStatusBadge(ticket.status)}</td>

                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      <div>{new Date(ticket.lastReplyAt).toLocaleDateString('id-ID')}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        Oleh: {ticket.lastReplyBy}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveTicket(ticket)}
                          className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
                        >
                          Buka
                        </button>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'reseller') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(ticket)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 cursor-pointer"
                            title="Hapus Tiket"
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

      {/* =================================================================== */}
      {/* 4. TICKET DETAIL THREAD DRAWER / MODAL                              */}
      {/* =================================================================== */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2.5 py-0.5 rounded-md">
                    {activeTicket.ticketNumber}
                  </span>
                  {getStatusBadge(activeTicket.status)}
                  {getPriorityBadge(activeTicket.priority)}
                  <span className="text-xs text-slate-500 font-medium">
                    &bull; {getDepartmentLabel(activeTicket.department)}
                  </span>
                </div>
                <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white truncate">
                  {activeTicket.subject}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>Pelanggan: <strong className="text-slate-800 dark:text-slate-200">{activeTicket.customerName}</strong> ({activeTicket.customerEmail})</span>
                  {activeTicket.relatedDomain && (
                    <span>Domain: <code className="text-sky-600 dark:text-sky-400 font-mono font-bold">{activeTicket.relatedDomain}</code></span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Status Bar for Staff */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'reseller') && (
              <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Atur Status:</span>
                  <select
                    value={activeTicket.status}
                    onChange={e => handleStatusChange(e.target.value as TicketStatus)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="open">Terbuka (Open)</option>
                    <option value="in_progress">Dalam Proses (In Progress)</option>
                    <option value="answered">Terjawab (Answered)</option>
                    <option value="on_hold">Tertunda (On Hold)</option>
                    <option value="closed">Selesai (Closed)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Prioritas:</span>
                  <select
                    value={activeTicket.priority}
                    onChange={e => handlePriorityChange(e.target.value as TicketPriority)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="critical">Darurat (Critical)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTicket.messages.map((msg, index) => {
                const isMe = msg.authorId === currentUser?.id;
                const isStaff = msg.isStaffReply;

                return (
                  <div
                    key={msg.id || index}
                    className={`rounded-2xl p-4 border transition-all ${
                      msg.isInternalNote
                        ? 'border-amber-300 bg-amber-50/80 dark:border-amber-800/80 dark:bg-amber-950/40'
                        : isStaff
                        ? 'border-sky-200 bg-sky-50/50 dark:border-sky-800/60 dark:bg-sky-950/30'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100/80 pb-2 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isStaff ? 'bg-sky-600 text-white' : 'bg-slate-700 text-white'
                          }`}
                        >
                          {msg.authorName ? msg.authorName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {msg.authorName}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                isStaff
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {msg.authorRole === 'admin'
                                ? 'Root Staff'
                                : msg.authorRole === 'reseller'
                                ? 'Reseller Support'
                                : 'Pelanggan'}
                            </span>
                            {msg.isInternalNote && (
                              <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[9px] font-black text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                                Catatan Internal Staff
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Canned Templates (For Staff) */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'reseller') && (
              <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Templat Balasan Cepat:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cannedTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(prev => (prev ? `${prev}\n\n${tmpl.text}` : tmpl.text))}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    >
                      + {tmpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Form Footer */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ketik balasan Anda untuk tiket bantuan ini..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {(currentUser?.role === 'admin' || currentUser?.role === 'reseller') && (
                      <label className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={e => setIsInternalNote(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-semibold text-[11px]">Catatan Internal (Hanya Terlihat oleh Staff)</span>
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {activeTicket.status !== 'closed' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange('closed')}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Tutup Tiket
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSubmittingReply ? 'Mengirim...' : 'Kirim Balasan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. CREATE NEW TICKET MODAL                                          */}
      {/* =================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-sky-500" />
                  <span>Buka Tiket Bantuan Baru</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Tim teknisi Karsa Cloud akan merespons pertanyaan dan kendala Anda secepatnya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subjek / Judul Masalah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="Contoh: Kendala SSL pada domain siakad-madrasah.denbaguse.my.id"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departemen Tujuan
                  </label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value as TicketDepartment)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="technical">Bantuan Teknis (Hosting/Server)</option>
                    <option value="domain_ssl">Domain, DNS &amp; SSL</option>
                    <option value="server_network">Jaringan, Tunnel &amp; Cloud</option>
                    <option value="billing">Tagihan &amp; Pembayaran</option>
                    <option value="general">Pertanyaan Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="low">Rendah (Pertanyaan Umum)</option>
                    <option value="medium">Sedang (Kendala Normal)</option>
                    <option value="high">Tinggi (Layanan Terganggu)</option>
                    <option value="critical">Darurat / Kritis (Sistem Utama Down)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Domain / Layanan Terkait (Opsional)
                </label>
                <select
                  value={newRelatedDomain}
                  onChange={e => setNewRelatedDomain(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="">-- Pilih Domain Terkait (Jika Ada) --</option>
                  {availableDomains.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Lengkap Kendala <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Jelaskan secara rinci kendala yang Anda hadapi, pesan error yang muncul, atau langkah yang telah dilakukan..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-blue-500 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmittingNew ? 'Membuat Tiket...' : 'Kirim Tiket Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
