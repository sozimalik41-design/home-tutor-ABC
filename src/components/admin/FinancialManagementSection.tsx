import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  User, 
  GraduationCap, 
  Search, 
  Filter,
  X,
  FileText,
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { TutorSalaryRecord, StudentFeeRecord, Tutor, Student } from '../../types';
import { financialService } from '../../services/financialService';
import { tutorService } from '../../services/tutorService';
import { studentService } from '../../services/studentService';

export const FinancialManagementSection: React.FC = () => {
  const [activeFinanceTab, setActiveFinanceTab] = useState<'salaries' | 'tuition_fees'>('salaries');
  
  const [salaries, setSalaries] = useState<TutorSalaryRecord[]>([]);
  const [fees, setFees] = useState<StudentFeeRecord[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [metrics, setMetrics] = useState({
    totalSalariesAmount: 0,
    totalSalariesPaid: 0,
    totalSalariesPending: 0,
    totalFeesInvoiced: 0,
    totalFeesCollected: 0,
    totalFeesOutstanding: 0,
    netOperatingBalance: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [deleteSalaryConfirmId, setDeleteSalaryConfirmId] = useState<string | null>(null);

  // Salary Form
  const [salaryForm, setSalaryForm] = useState<{
    tutorId: string;
    billingPeriod: string;
    amount: number;
    paymentFrequency: 'monthly' | 'per_class' | 'hourly';
    classesCount: number;
    dueDate: string;
    paidDate?: string;
    status: 'pending' | 'paid' | 'cancelled';
    paymentMethod: string;
    notes: string;
  }>({
    tutorId: '',
    billingPeriod: 'October 2026',
    amount: 2000,
    paymentFrequency: 'monthly',
    classesCount: 16,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'Bank Transfer',
    notes: ''
  });

  // Fee Form
  const [feeForm, setFeeForm] = useState<{
    studentId: string;
    billingPeriod: string;
    amount: number;
    amountPaid: number;
    dueDate: string;
    paidDate?: string;
    status: 'pending' | 'paid' | 'overdue' | 'partial';
    paymentMethod: string;
    notes: string;
  }>({
    studentId: '',
    billingPeriod: 'October 2026',
    amount: 2500,
    amountPaid: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'Online Banking',
    notes: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salRes, feeRes, tutRes, stdRes, computedMetrics] = await Promise.all([
        financialService.getTutorSalaries(),
        financialService.getStudentFees(),
        tutorService.getTutors(),
        studentService.getStudents(),
        financialService.calculateMetrics()
      ]);

      setSalaries(salRes.records);
      setFees(feeRes.records);
      setTutors(tutRes.tutors);
      setStudents(stdRes.students);
      setMetrics(computedMetrics);

      if (tutRes.tutors.length > 0) {
        setSalaryForm(prev => ({ ...prev, tutorId: prev.tutorId || tutRes.tutors[0].id }));
      }
      if (stdRes.students.length > 0) {
        setFeeForm(prev => ({ ...prev, studentId: prev.studentId || stdRes.students[0].id }));
      }
    } catch (e) {
      console.warn('Error loading financial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    const tutor = tutors.find(t => t.id === salaryForm.tutorId);

    const res = await financialService.saveTutorSalary({
      ...salaryForm,
      tutorName: tutor ? tutor.name : 'Tutor'
    });

    if (res.success) {
      setActionMessage({ type: 'success', text: 'Tutor compensation record saved.' });
      setIsSalaryModalOpen(false);
      loadData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to save salary record.' });
    }
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === feeForm.studentId);

    const res = await financialService.saveStudentFee({
      ...feeForm,
      studentName: student ? student.fullName : 'Student'
    });

    if (res.success) {
      setActionMessage({ type: 'success', text: 'Student tuition fee invoice recorded.' });
      setIsFeeModalOpen(false);
      loadData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to save tuition record.' });
    }
  };

  const handleMarkSalaryPaid = async (record: TutorSalaryRecord) => {
    await financialService.saveTutorSalary({
      ...record,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    });
    setActionMessage({ type: 'success', text: `Tutor salary payout for ${record.tutorName} marked as Paid.` });
    loadData();
  };

  const handleRecordStudentPayment = async (record: StudentFeeRecord) => {
    await financialService.saveStudentFee({
      ...record,
      amountPaid: record.amount,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    });
    setActionMessage({ type: 'success', text: `Tuition fee for ${record.studentName} marked as Paid in Full.` });
    loadData();
  };

  const handleDeleteSalary = async (id: string) => {
    const res = await financialService.deleteTutorSalary(id);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Tutor salary record deleted successfully.' });
      setDeleteSalaryConfirmId(null);
      loadData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to delete salary record.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Salary & Tuition Financial Ledgers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict separation between Tutor Compensation / Salary Payouts and Student Tuition Fee Charges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSalaryModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Record Tutor Salary</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeeModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#F5F3FF] hover:bg-[#DDD6FE]/50 text-[#4C1D95] border border-[#DDD6FE] font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Student Invoice</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Financial Overview Cards (Derived from saved records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Student Tuition Collected */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Student Tuition Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            ${metrics.totalFeesCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            From ${metrics.totalFeesInvoiced.toLocaleString()} total invoiced
          </p>
        </div>

        {/* Student Fees Outstanding */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Outstanding Student Fees</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
            ${metrics.totalFeesOutstanding.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Pending / partial parent payments
          </p>
        </div>

        {/* Tutor Salaries Paid */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tutor Compensation Paid</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            ${metrics.totalSalariesPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Disbursed to verified home tutors
          </p>
        </div>

        {/* Net Operating Balance */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Net Platform Cashflow</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-2xl font-extrabold tabular-nums ${metrics.netOperatingBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ${metrics.netOperatingBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Tuition Collected minus Salaries Paid
          </p>
        </div>
      </div>

      {/* Ledger Tab Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFinanceTab('salaries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeFinanceTab === 'salaries'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#00FF48]" />
          <span>Tutor Salary Records ({salaries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceTab('tuition_fees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeFinanceTab === 'tuition_fees'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-[#00FF48]" />
          <span>Student Tuition Invoices ({fees.length})</span>
        </button>
      </div>

      {/* 1. TUTOR SALARIES TABLE */}
      {activeFinanceTab === 'salaries' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tutor Compensation & Salary Disbursement Ledger
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Pending Payouts: ${metrics.totalSalariesPending.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tutor Name</th>
                  <th className="px-4 py-3">Billing Cycle</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Paid Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaries.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {record.tutorName}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {record.billingPeriod}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 tabular-nums">
                      ${record.amount}
                      <span className="text-[10px] font-normal text-slate-400 block">
                        ({record.classesCount} sessions)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.dueDate}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.paidDate || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        record.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {record.paymentMethod || 'Bank Transfer'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {record.status !== 'paid' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkSalaryPaid(record)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteSalaryConfirmId(record.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Salary Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. STUDENT TUITION INVOICES TABLE */}
      {activeFinanceTab === 'tuition_fees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Student Tuition Fee Billing & Collection Ledger
            </h3>
            <span className="text-[11px] text-amber-700 font-mono font-semibold">
              Outstanding Balance: ${metrics.totalFeesOutstanding.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Billing Cycle</th>
                  <th className="px-4 py-3">Invoiced Fee</th>
                  <th className="px-4 py-3">Paid Amount</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((record) => {
                  const balance = record.amount - record.amountPaid;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {record.studentName}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {record.billingPeriod}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 tabular-nums">
                        ${record.amount}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-800 tabular-nums">
                        ${record.amountPaid}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums">
                        {balance > 0 ? (
                          <span className="text-amber-700">${balance}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">$0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {record.dueDate}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          record.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                          record.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {record.status !== 'paid' ? (
                          <button
                            type="button"
                            onClick={() => handleRecordStudentPayment(record)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#00FF48] hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            Clear Balance
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Tutor Salary */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Tutor Salary Disbursement</h3>
              <button onClick={() => setIsSalaryModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Tutor <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={salaryForm.tutorId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, tutorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                >
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (${t.salaryAmount}/{t.salaryFrequency})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Billing Period <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={salaryForm.billingPeriod}
                    onChange={(e) => setSalaryForm({ ...salaryForm, billingPeriod: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Salary Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={salaryForm.amount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={salaryForm.dueDate}
                    onChange={(e) => setSalaryForm({ ...salaryForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={salaryForm.status}
                    onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <input
                  type="text"
                  value={salaryForm.paymentMethod}
                  onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}
                  placeholder="e.g. Bank Transfer (Meezan Bank)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#00FF48] hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
                >
                  Save Salary Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Student Fee Invoice */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Issue Student Tuition Fee Invoice</h3>
              <button onClick={() => setIsFeeModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={feeForm.studentId}
                  onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.gradeLevel})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Billing Period <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={feeForm.billingPeriod}
                    onChange={(e) => setFeeForm({ ...feeForm, billingPeriod: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Invoiced Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount Paid ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={feeForm.amountPaid}
                    onChange={(e) => setFeeForm({ ...feeForm, amountPaid: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#00FF48] hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Salary Confirmation Modal */}
      {deleteSalaryConfirmId && (
        <div className="fixed inset-0 bg-[#3B0764]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DDD6FE] space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#1F2937]">Delete Salary Record?</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Are you sure you want to delete this tutor compensation record? The ledger metrics will recalculate immediately.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteSalaryConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSalary(deleteSalaryConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
