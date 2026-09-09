import React, { useState, useEffect, useMemo } from 'react';
import { EntryApplication, ApplicationStatus, AdminLog } from '../../types/application.ts';
import { storageService } from '../../services/storageService.ts';
import { authService } from '../../services/authService.ts';
import { auditService } from '../../services/auditService.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  LogOut,
  ShieldCheck,
  FileText,
  Save,
  X,
  AlertTriangle,
  ArrowUpDown,
  History,
  Plane,
  Building,
  UserCheck,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { PlansManagement } from './PlansManagement.tsx';
import { PaymentsManagement } from './PaymentsManagement.tsx';

interface Props {
  onLogout: () => void;
  onGoToSite: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout, onGoToSite }) => {
  const { t } = useLanguage();
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<'applications' | 'payments' | 'plans' | 'logs'>('applications');
  const [applications, setApplications] = useState<EntryApplication[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'earliest' | 'arrival'>('latest');

  // Sensitive data reveal state (audit logged)
  const [showFullSensitive, setShowFullSensitive] = useState(false);

  // Selected for Details / Edit Modal
  const [selectedApp, setSelectedApp] = useState<EntryApplication | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<EntryApplication | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, auditLogs] = await Promise.all([
        storageService.getAllApplications(),
        auditService.getLogs(),
      ]);
      setApplications(apps);
      setLogs(auditLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Statistics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    let todayCount = 0;
    let weekCount = 0;
    let pendingCount = 0;
    let completedCount = 0;

    applications.forEach((app) => {
      const createdDate = new Date(app.createdAt);
      if (app.createdAt.startsWith(todayStr)) {
        todayCount++;
      }
      if (createdDate >= oneWeekAgo) {
        weekCount++;
      }
      if (app.status === 'New' || app.status === 'Processing') {
        pendingCount++;
      }
      if (app.status === 'Completed') {
        completedCount++;
      }
    });

    return {
      today: todayCount,
      week: weekCount,
      total: applications.length,
      pending: pendingCount,
      completed: completedCount,
    };
  }, [applications]);

  // Unique nationalities for dropdown
  const uniqueNationalities = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.personalInfo.nationality) set.add(a.personalInfo.nationality);
    });
    return Array.from(set).sort();
  }, [applications]);

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    let list = [...applications];

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }

    // Nationality filter
    if (nationalityFilter !== 'ALL') {
      list = list.filter((a) => a.personalInfo.nationality === nationalityFilter);
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((a) => {
        const appId = a.applicationId.toLowerCase();
        const surname = a.personalInfo.surname.toLowerCase();
        const givenName = a.personalInfo.givenName.toLowerCase();
        const fullName = `${surname} ${givenName}`;
        const passport = a.passportInfo.passportNumber.toLowerCase();
        const email = a.contactInfo.email.toLowerCase();
        const phone = a.contactInfo.phoneNumber.toLowerCase();
        return (
          appId.includes(term) ||
          surname.includes(term) ||
          givenName.includes(term) ||
          fullName.includes(term) ||
          passport.includes(term) ||
          email.includes(term) ||
          phone.includes(term)
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'earliest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'arrival') {
        return new Date(a.travelInfo.arrivalDate).getTime() - new Date(b.travelInfo.arrivalDate).getTime();
      }
      return 0;
    });

    return list;
  }, [applications, statusFilter, nationalityFilter, searchTerm, sortBy]);

  // Sensitive reveal handler
  const handleToggleSensitive = async () => {
    const nextState = !showFullSensitive;
    setShowFullSensitive(nextState);
    if (nextState) {
      await auditService.logAction(
        'VIEW_SENSITIVE_DATA',
        'BATCH',
        'Admin revealed unmasked passport and contact fields on dashboard',
        currentUser?.email
      );
      // reload audit logs
      const updatedLogs = await auditService.getLogs();
      setLogs(updatedLogs);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    await storageService.updateApplicationAdmin(appId, { status: newStatus });
    await auditService.logAction(
      'CHANGE_STATUS',
      appId,
      `Status changed to ${newStatus}`,
      currentUser?.email
    );
    loadData();
    if (selectedApp && selectedApp.applicationId === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Note Save Handler
  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNote(true);
    try {
      await storageService.updateApplicationAdmin(selectedApp.applicationId, {
        adminNotes: noteInput,
      });
      await auditService.logAction(
        'EDIT_APPLICATION',
        selectedApp.applicationId,
        `Admin note updated: "${noteInput.substring(0, 30)}..."`,
        currentUser?.email
      );
      setSelectedApp((prev) => (prev ? { ...prev, adminNotes: noteInput } : null));
      loadData();
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Handler
  const handleDeleteApp = async (appId: string) => {
    await storageService.deleteApplication(appId);
    await auditService.logAction(
      'DELETE_APPLICATION',
      appId,
      'Application deleted from database',
      currentUser?.email
    );
    setDeleteConfirmId(null);
    if (selectedApp?.applicationId === appId) {
      setSelectedApp(null);
    }
    loadData();
  };

  // CSV Export Handler
  const handleExportCSV = async () => {
    if (filteredApplications.length === 0) {
      alert('当前筛选条件下没有可导出的申请数据。');
      return;
    }

    const headers = [
      'Application ID',
      'Surname',
      'Given Name',
      'Date of Birth',
      'Nationality',
      'Passport Country',
      'Passport Number',
      'Passport Issue Date',
      'Passport Expiry Date',
      'Gender',
      'Arrival Date',
      'Departure Date',
      'Arrival Method',
      'Flight Number',
      'Arrival Airport',
      'Purpose',
      'Accommodation',
      'Address',
      'City',
      'State',
      'Email',
      'Phone',
      'Status',
      'Created At',
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredApplications.map((app) => [
      escapeCsv(app.applicationId),
      escapeCsv(app.personalInfo.surname),
      escapeCsv(app.personalInfo.givenName),
      escapeCsv(app.personalInfo.dateOfBirth),
      escapeCsv(app.personalInfo.nationality),
      escapeCsv(app.passportInfo.passportCountry),
      escapeCsv(app.passportInfo.passportNumber),
      escapeCsv(app.passportInfo.issueDate),
      escapeCsv(app.passportInfo.expiryDate),
      escapeCsv(app.personalInfo.gender),
      escapeCsv(app.travelInfo.arrivalDate),
      escapeCsv(app.travelInfo.departureDate),
      escapeCsv(app.travelInfo.arrivalMethod),
      escapeCsv(app.travelInfo.flightNumber),
      escapeCsv(app.travelInfo.arrivalAirport),
      escapeCsv(app.travelInfo.purpose),
      escapeCsv(app.accommodation.accommodationName),
      escapeCsv(app.accommodation.address),
      escapeCsv(app.accommodation.city),
      escapeCsv(app.accommodation.state),
      escapeCsv(app.contactInfo.email),
      escapeCsv(`${app.contactInfo.phoneCountryCode} ${app.contactInfo.phoneNumber}`),
      escapeCsv(app.status),
      escapeCsv(app.createdAt),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MEA_Applications_Export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Audit log
    await auditService.logAction(
      'EXPORT_APPLICATIONS',
      'BATCH',
      `Exported ${filteredApplications.length} records to CSV under filter ${statusFilter}/${nationalityFilter}`,
      currentUser?.email
    );
    const updatedLogs = await auditService.getLogs();
    setLogs(updatedLogs);
  };

  // Open Details Modal
  const openDetails = async (app: EntryApplication) => {
    setSelectedApp(app);
    setEditFormData(JSON.parse(JSON.stringify(app)));
    setNoteInput(app.adminNotes || '');
    setIsEditing(false);
    await auditService.logAction(
      'VIEW_APPLICATION',
      app.applicationId,
      `Admin opened full view for ${app.applicationId}`,
      currentUser?.email
    );
    const updatedLogs = await auditService.getLogs();
    setLogs(updatedLogs);
  };

  // Save Full Application Edits
  const handleSaveAppEdit = async () => {
    if (!editFormData) return;
    await storageService.updateApplicationAdmin(editFormData.applicationId, {
      personalInfo: editFormData.personalInfo,
      passportInfo: editFormData.passportInfo,
      travelInfo: editFormData.travelInfo,
      accommodation: editFormData.accommodation,
      contactInfo: editFormData.contactInfo,
    });
    await auditService.logAction(
      'EDIT_APPLICATION',
      editFormData.applicationId,
      'Full application fields edited by admin',
      currentUser?.email
    );
    setSelectedApp(editFormData);
    setIsEditing(false);
    loadData();
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Admin Profile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{t.adminPortal}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Role: Admin
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                已登录管理员：{currentUser?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="admin-site-btn"
              onClick={onGoToSite}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
            >
              前台网站
            </button>
            <button
              id="admin-logout-btn"
              onClick={async () => {
                await authService.logout();
                onLogout();
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.adminLogout}</span>
            </button>
          </div>
        </div>

        {/* Top Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {/* Today */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.adminStatsToday}</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">今日新接收</span>
          </div>

          {/* This Week */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.adminStatsWeek}</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.week}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">近 7 日接收</span>
          </div>

          {/* Total */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.adminStatsTotal}</span>
              <Users className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">数据库全量</span>
          </div>

          {/* Pending */}
          <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.adminStatsPending}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
            <span className="text-[11px] text-amber-700/80 mt-1 block">New & Processing</span>
          </div>

          {/* Completed */}
          <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.adminStatsCompleted}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">{stats.completed}</p>
            <span className="text-[11px] text-emerald-700/80 mt-1 block">已完成整理</span>
          </div>
        </div>

        {/* Tab switcher: Applications, Payments, Plans, Audit Logs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            id="tab-applications"
            onClick={() => setActiveTab('applications')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tabApplications} ({filteredApplications.length})</span>
          </button>
          <button
            id="tab-payments"
            onClick={() => setActiveTab('payments')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>支付管理 & 财务统计</span>
          </button>
          <button
            id="tab-plans"
            onClick={() => setActiveTab('plans')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'plans'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>服务套餐定价</span>
          </button>
          <button
            id="tab-logs"
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-blue-900 text-blue-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.tabAuditLogs} ({logs.length})</span>
          </button>
        </div>

        {/* Applications Tab Content */}
        {activeTab === 'applications' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Filter and Action Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-search-input"
                    type="text"
                    value={searchTerm}
                    placeholder={t.searchPlaceholder}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Sensitive Data Unmask Toggle */}
                  <button
                    id="admin-toggle-sensitive-btn"
                    onClick={handleToggleSensitive}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      showFullSensitive
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={showFullSensitive ? t.btnMaskFull : t.btnShowFull}
                  >
                    {showFullSensitive ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t.btnMaskFull}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t.btnShowFull}</span>
                      </>
                    )}
                  </button>

                  {/* Export CSV Button */}
                  <button
                    id="admin-export-csv-btn"
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{t.btnExport}</span>
                  </button>
                </div>
              </div>

              {/* Secondary Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">{t.filterStatus}:</span>
                  <select
                    id="admin-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">全部状态 (All)</option>
                    <option value="New">新申请 (New)</option>
                    <option value="Processing">处理中 (Processing)</option>
                    <option value="Completed">已处理 (Completed)</option>
                    <option value="Cancelled">已取消 (Cancelled)</option>
                  </select>
                </div>

                {/* Nationality Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">{t.filterNationality}:</span>
                  <select
                    id="admin-nationality-filter"
                    value={nationalityFilter}
                    onChange={(e) => setNationalityFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">全部国籍 (All)</option>
                    {uniqueNationalities.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-1.5 sm:ml-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">{t.sortOption}:</span>
                  <select
                    id="admin-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="latest">{t.sortLatest}</option>
                    <option value="earliest">{t.sortEarliest}</option>
                    <option value="arrival">{t.sortArrival}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">{t.colAppId}</th>
                    <th className="py-3 px-4">{t.colName}</th>
                    <th className="py-3 px-4">{t.colPassportCountry}</th>
                    <th className="py-3 px-4">{t.colPassportNo}</th>
                    <th className="py-3 px-4">{t.colArrivalDate}</th>
                    <th className="py-3 px-4">{t.colCreatedAt}</th>
                    <th className="py-3 px-4">{t.colStatus}</th>
                    <th className="py-3 px-4 text-right">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        {t.noRecords}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* Application ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                          {app.applicationId}
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                          {app.personalInfo.surname} {app.personalInfo.givenName}
                        </td>

                        {/* Passport Country */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {app.passportInfo.passportCountry}
                        </td>

                        {/* Passport Number (Masked / Unmasked) */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                          {showFullSensitive ? (
                            <span className="text-amber-900 font-semibold">
                              {app.passportInfo.passportNumber}
                            </span>
                          ) : (
                            <span>{storageService.maskPassport(app.passportInfo.passportNumber)}</span>
                          )}
                        </td>

                        {/* Arrival Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                          {app.travelInfo.arrivalDate}
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>

                        {/* Status Select & Payment Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app.applicationId, e.target.value as ApplicationStatus)
                              }
                              className={`px-2 py-1 rounded-md text-xs font-semibold border focus:outline-none block w-full ${
                                app.status === 'New'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : app.status === 'Processing'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : app.status === 'Completed'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}
                            >
                              <option value="New">{t.statusNew}</option>
                              <option value="Processing">{t.statusProcessing}</option>
                              <option value="Completed">{t.statusCompleted}</option>
                              <option value="Cancelled">{t.statusCancelled}</option>
                            </select>

                            {/* Payment Status Tag */}
                            <div className="flex items-center gap-1">
                              {app.paymentStatus === 'paid' && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  ✓ 已付 {app.currency || 'MYR'} {app.amount || 49}
                                </span>
                              )}
                              {app.paymentStatus === 'refunded' && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  ↺ 已退款
                                </span>
                              )}
                              {(!app.paymentStatus || app.paymentStatus === 'pending') && (
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  待支付
                                </span>
                              )}
                              {app.paymentStatus === 'failed' && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  扣款失败
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                          <button
                            id={`view-detail-${app.applicationId}`}
                            onClick={() => openDetails(app)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            详情 / 编辑
                          </button>
                          <button
                            id={`del-app-${app.applicationId}`}
                            onClick={() => setDeleteConfirmId(app.applicationId)}
                            className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="删除申请"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Management Tab Content */}
        {activeTab === 'payments' && <PaymentsManagement />}

        {/* Plans Management Tab Content */}
        {activeTab === 'plans' && <PlansManagement />}

        {/* Audit Logs Tab Content */}
        {activeTab === 'logs' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
              {t.auditLogNotice}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">{t.colTime}</th>
                    <th className="py-3 px-4">{t.colAdmin}</th>
                    <th className="py-3 px-4">{t.colAction}</th>
                    <th className="py-3 px-4">关联申请</th>
                    <th className="py-3 px-4">{t.colDetails}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {log.adminEmail}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-900 whitespace-nowrap">
                        {log.applicationId || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Application Details & Editing Modal */}
      {selectedApp && editFormData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  申请详情档案
                </span>
                <h3 className="text-lg font-bold font-mono text-blue-950">
                  {selectedApp.applicationId}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>编辑资料</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveAppEdit}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存修改</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Internal Notes Section */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2">
                <label className="font-bold text-blue-950 block text-xs uppercase tracking-wider">
                  {t.adminNotesTitle}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    placeholder={t.adminNotesPlaceholder}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-lg border border-blue-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNote}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {savingNote ? '保存中...' : t.btnSaveNotes}
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>个人信息 (Personal Information)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.fieldSurname}</span>
                    {isEditing ? (
                      <input
                        value={editFormData.personalInfo.surname}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              surname: e.target.value.toUpperCase(),
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 mt-1 font-semibold"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{selectedApp.personalInfo.surname}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldGivenName}</span>
                    {isEditing ? (
                      <input
                        value={editFormData.personalInfo.givenName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              givenName: e.target.value.toUpperCase(),
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 mt-1 font-semibold"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{selectedApp.personalInfo.givenName}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldDob}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalInfo.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldGender}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalInfo.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldNationality}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalInfo.nationality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldBirthCountry}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.personalInfo.birthCountry}</span>
                  </div>
                </div>
              </div>

              {/* Passport Information */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>护照信息 (Passport Information)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.fieldPassportCountry}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.passportInfo.passportCountry}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldPassportNumber}</span>
                    <span className="font-mono font-bold text-blue-950 text-sm">
                      {selectedApp.passportInfo.passportNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldPassportIssueDate}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.passportInfo.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldPassportExpiryDate}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.passportInfo.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" />
                  <span>旅行信息 (Travel Information)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.fieldArrivalDate}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.travelInfo.arrivalDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldDepartureDate}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.travelInfo.departureDate || '未填'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldArrivalMethod}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.travelInfo.arrivalMethod}</span>
                  </div>
                  {selectedApp.travelInfo.arrivalMethod === 'Flight' && (
                    <>
                      <div>
                        <span className="text-slate-400 block">{t.fieldFlightNumber}</span>
                        <span className="font-mono font-bold text-slate-800">{selectedApp.travelInfo.flightNumber || '-'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block">{t.fieldArrivalAirport}</span>
                        <span className="font-semibold text-slate-800">{selectedApp.travelInfo.arrivalAirport || '-'}</span>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-slate-400 block">{t.fieldPurpose}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.travelInfo.purpose}</span>
                  </div>
                </div>
              </div>

              {/* Accommodation Information */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>住宿信息 (Accommodation)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.fieldAccomType}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.accommodation.accommodationType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldAccomName}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.accommodation.accommodationName}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">{t.fieldAddress}</span>
                    <span className="font-semibold text-slate-800 whitespace-pre-line">{selectedApp.accommodation.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldCity} · {t.fieldState}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.accommodation.city}, {selectedApp.accommodation.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldAccomPhone}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.accommodation.contactPhone || '未提供'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>联系信息 (Contact Information)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.fieldEmail}</span>
                    <span className="font-semibold text-slate-800">{selectedApp.contactInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.fieldPhoneNumber}</span>
                    <span className="font-semibold text-slate-800">
                      {selectedApp.contactInfo.phoneCountryCode} {selectedApp.contactInfo.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Service Package Details */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>支付与服务套餐 (Payment & Service Details)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">选购套餐</span>
                    <span className="font-bold text-slate-900">{selectedApp.planName || 'Standard Service'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">收费金额</span>
                    <span className="font-bold text-slate-900">
                      {selectedApp.currency || 'MYR'} {(selectedApp.amount || 49).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">支付状态</span>
                    <div>
                      {selectedApp.paymentStatus === 'paid' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          已支付 (Paid)
                        </span>
                      )}
                      {selectedApp.paymentStatus === 'refunded' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          已退款 (Refunded)
                        </span>
                      )}
                      {(!selectedApp.paymentStatus || selectedApp.paymentStatus === 'pending') && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                          待支付 (Pending)
                        </span>
                      )}
                      {selectedApp.paymentStatus === 'failed' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          扣款失败 (Failed)
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedApp.paymentId && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block">Stripe 凭据 / Payment Intent ID</span>
                      <span className="font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                        {selectedApp.paymentId}
                      </span>
                    </div>
                  )}
                  {selectedApp.paidAt && (
                    <div>
                      <span className="text-slate-400 block">支付入账时间</span>
                      <span className="text-slate-700">{new Date(selectedApp.paidAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                创建时间：{new Date(selectedApp.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">确认删除申请记录</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              您确定要永久删除申请编号为 <strong className="font-mono text-slate-900">{deleteConfirmId}</strong> 的记录吗？该操作将自动计入审计日志并无法撤回。
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteApp(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
