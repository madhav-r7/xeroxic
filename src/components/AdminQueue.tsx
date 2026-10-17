import React, { useState } from 'react';
import { PrintJob, User } from '../types';
import { updateJobStatus, deletePrintJob } from '../services/storage';
import {
  Printer,
  CheckCircle2,
  Clock,
  PackageCheck,
  Search,
  Play,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface AdminQueueProps {
  user: User;
  jobs: PrintJob[];
  onRefresh: () => void;
}

export const AdminQueue: React.FC<AdminQueueProps> = ({ jobs, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'processing' | 'ready' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    return job.status === filter;
  });

  const handleUpdateStatus = (jobId: string, newStatus: PrintJob['status'], note?: string) => {
    updateJobStatus(jobId, newStatus, note);
    onRefresh();

    let text = '';
    if (newStatus === 'processing') text = `Order ${jobId} status updated to Printing.`;
    if (newStatus === 'ready') text = `Order ${jobId} printed & ready. File purged from storage.`;
    if (newStatus === 'completed') text = `Order ${jobId} completed & automatically deleted from cloud database.`;

    setActionSuccessMsg(text);
    setTimeout(() => setActionSuccessMsg(''), 3500);

    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Permanently delete order ${jobId} and its files from the database and storage?`)) {
      deletePrintJob(jobId);
      onRefresh();
      setActionSuccessMsg(`Order ${jobId} deleted from database and storage.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(null);
      }
    }
  };

  // KPI Calculations
  const submittedCount = jobs.filter((j) => j.status === 'submitted').length;
  const processingCount = jobs.filter((j) => j.status === 'processing').length;
  const readyCount = jobs.filter((j) => j.status === 'ready').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const totalRevenue = jobs.reduce((acc, j) => acc + j.cost, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Operator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">
              Xerox Operator Dashboard
            </h1>
            <span className="text-xs bg-[#107c10]/15 text-[#107c10] font-semibold px-2 py-0.5 rounded-[3px] border border-[#107c10]/30">
              Shop Open
            </span>
          </div>
          <p className="text-xs text-[#605e5c] mt-0.5">
            Manage incoming student print orders, update printing status, and handle pickups
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="text-xs bg-white hover:bg-[#f3f2f1] text-[#242424] border border-[#8a8886] px-3.5 py-1.5 rounded-[2px] font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0067b8]" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {actionSuccessMsg && (
        <div className="mb-4 p-3 bg-[#dff6dd] text-[#107c10] border border-[#a2e6a0] rounded-[2px] text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccessMsg}</span>
          </div>
          <span className="text-[11px] font-normal">Student tracking updated</span>
        </div>
      )}

      {/* Operator KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border border-[#e1dfdd] p-3.5 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Queued Orders</div>
          <div className="text-2xl font-bold text-[#0067b8] mt-0.5">{submittedCount}</div>
          <div className="text-[10px] text-[#797775]">Awaiting print</div>
        </div>

        <div className="bg-white border border-[#e1dfdd] p-3.5 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Printing Now</div>
          <div className="text-2xl font-bold text-[#d83b01] mt-0.5">{processingCount}</div>
          <div className="text-[10px] text-[#797775]">Being printed</div>
        </div>

        <div className="bg-white border border-[#e1dfdd] p-3.5 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Ready for Pickup</div>
          <div className="text-2xl font-bold text-[#107c10] mt-0.5">{readyCount}</div>
          <div className="text-[10px] text-[#797775]">At Counter</div>
        </div>

        <div className="bg-white border border-[#e1dfdd] p-3.5 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Delivered Today</div>
          <div className="text-2xl font-bold text-[#323130] mt-0.5">{completedCount}</div>
          <div className="text-[10px] text-[#797775]">Collected by students</div>
        </div>

        <div className="bg-white border border-[#e1dfdd] p-3.5 rounded-[2px] shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Today's Revenue</div>
          <div className="text-2xl font-bold text-[#0067b8] mt-0.5">₹{totalRevenue}</div>
          <div className="text-[10px] text-[#797775]">Across {jobs.length} orders</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-[#e1dfdd] p-3 rounded-[2px] mb-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex space-x-1 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#0067b8] text-white font-semibold'
                : 'text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
              filter === 'submitted'
                ? 'bg-[#0067b8] text-white font-semibold'
                : 'text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            Queued ({submittedCount})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
              filter === 'processing'
                ? 'bg-[#0067b8] text-white font-semibold'
                : 'text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            Printing ({processingCount})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
              filter === 'ready'
                ? 'bg-[#107c10] text-white font-semibold'
                : 'text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-[#323130] text-white font-semibold'
                : 'text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            Delivered ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#797775] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Token, Roll No, File..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8]"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-[#e1dfdd] rounded-[2px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#605e5c] border-b border-[#edebe9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Token ID</th>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Document & Specs</th>
                <th className="py-3 px-4 font-semibold">Format & Paper</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edebe9] text-[#242424]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#797775]">
                    No print jobs match this filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#f3f2f1]/60 transition-colors">
                    {/* Token ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#0067b8]">
                      <div className="flex items-center space-x-1.5">
                        <span>{job.id}</span>
                        {job.isUrgent && (
                          <span className="text-[9px] bg-[#fff4ce] text-[#d83b01] font-bold px-1 py-0.5 rounded border border-[#f2c80f]">
                            URGENT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#797775] font-sans font-normal mt-0.5">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#242424]">{job.studentName}</div>
                      <div className="text-[11px] text-[#605e5c] font-mono">{job.studentRoll}</div>
                      <div className="text-[10px] text-[#797775] truncate max-w-[150px]">{job.department}</div>
                    </td>

                    {/* Document & Specs */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-medium text-[#242424] truncate max-w-[180px]" title={job.fileName}>
                          {job.fileName}
                        </span>
                        {job.fileUrl && (
                          <a
                            href={job.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0067b8] hover:text-[#004e8c] p-0.5 rounded"
                            title="Open / Download Student Document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-[#605e5c] mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-[#0067b8]">{job.pageCount} pgs</span>
                        <span>×</span>
                        <span className="font-semibold">{job.copies} copy</span>
                        <span>•</span>
                        <span className="capitalize">{job.colorMode === 'color' ? 'Color' : 'B&W'}</span>
                        <span>•</span>
                        <span>{job.sides === 'double' ? 'Duplex' : 'Single'}</span>
                        {job.paperType === 'photo' && (
                          <span className="text-[10px] bg-[#e6f2fb] text-[#0067b8] font-bold px-1.5 py-0.5 rounded border border-[#cbe4f9]">
                            PHOTO PAPER
                          </span>
                        )}
                      </div>
                      {job.instructions && (
                        <div className="text-[10px] text-[#d83b01] font-medium mt-1 truncate max-w-[200px]" title={job.instructions}>
                          Note: {job.instructions}
                        </div>
                      )}
                    </td>

                    {/* Format & Paper */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#242424]">{job.paperSize} • {job.sides === 'double' ? 'Double Sided' : 'Single'}</span>
                      <div className="text-[11px] text-[#797775]">
                        {job.paperType === 'photo' ? 'Photo Paper' : 'Plain Paper'} ({job.orientation})
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-bold text-[#242424]">
                      ₹{job.cost}.00
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {job.status === 'submitted' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e6f2fb] text-[#0067b8] border border-[#cbe4f9]">
                          <Clock className="w-3 h-3" />
                          <span>Queued</span>
                        </span>
                      )}
                      {job.status === 'processing' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fff4ce] text-[#797673] border border-[#f2c80f]">
                          <Printer className="w-3 h-3 text-[#0067b8] animate-pulse" />
                          <span className="text-[#323130]">Printing</span>
                        </span>
                      )}
                      {job.status === 'ready' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#dff6dd] text-[#107c10] border border-[#a2e6a0]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready for Pickup</span>
                        </span>
                      )}
                      {job.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f3f2f1] text-[#605e5c] border border-[#d2d0ce]">
                          <PackageCheck className="w-3 h-3" />
                          <span>Delivered</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {job.status === 'submitted' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'processing', 'Printing in progress')}
                            className="bg-[#0067b8] hover:bg-[#005da6] text-white px-2.5 py-1.5 rounded-[2px] font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                            title="Start Printing"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start Print</span>
                          </button>
                        )}

                        {job.status === 'processing' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'ready', 'Printing complete. Kept at Counter.')}
                            className="bg-[#107c10] hover:bg-[#0e690e] text-white px-2.5 py-1.5 rounded-[2px] font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                            title="Mark Ready for Pickup"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Mark Ready</span>
                          </button>
                        )}

                        {job.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'completed', 'Collected by student')}
                            className="bg-[#323130] hover:bg-[#201f1e] text-white px-2.5 py-1.5 rounded-[2px] font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                            title="Mark Handed Over"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Handed Over</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1.5 text-[#605e5c] hover:text-[#0067b8] hover:bg-[#e6f2fb] rounded-[2px] transition-colors"
                          title="View Order Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteJob(job.id, e)}
                          className="p-1.5 text-[#a19f9d] hover:text-[#d83b01] hover:bg-[#fdf3f2] rounded-[2px] transition-colors"
                          title="Delete from Database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Operator Job Inspection Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e1dfdd] rounded-[2px] shadow-2xl max-w-xl w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#edebe9]">
              <div>
                <span className="text-xs font-mono font-bold text-[#0067b8]">{selectedJob.id}</span>
                <h3 className="text-base font-semibold text-[#242424] mt-0.5">{selectedJob.fileName}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 text-[#605e5c] hover:text-[#242424] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Student info */}
              <div className="p-3 bg-[#f3f2f1] rounded-[2px] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#605e5c] block">Student Name:</span>
                  <span className="font-semibold text-[#242424]">{selectedJob.studentName}</span>
                </div>
                <div>
                  <span className="text-[#605e5c] block">Roll Number:</span>
                  <span className="font-semibold text-[#242424]">{selectedJob.studentRoll}</span>
                </div>
                <div>
                  <span className="text-[#605e5c] block">Department:</span>
                  <span className="text-[#242424]">{selectedJob.department}</span>
                </div>
                <div>
                  <span className="text-[#605e5c] block">Phone:</span>
                  <span className="text-[#242424] font-mono">{selectedJob.studentPhone}</span>
                </div>
              </div>

              {/* Print specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Pages:</span>
                  <span className="font-semibold">{selectedJob.pageCount} pages</span>
                </div>
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Copies:</span>
                  <span className="font-semibold">{selectedJob.copies} copy</span>
                </div>
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Color:</span>
                  <span className="font-semibold capitalize">{selectedJob.colorMode}</span>
                </div>
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Sides:</span>
                  <span className="font-semibold capitalize">{selectedJob.sides} sided</span>
                </div>
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Paper Size:</span>
                  <span className="font-semibold">{selectedJob.paperSize}</span>
                </div>
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Paper Type:</span>
                  <span className="font-semibold">{selectedJob.paperType === 'photo' ? 'Photo Paper (+₹15)' : 'Plain Paper'}</span>
                </div>
                <div className="p-2 border border-[#e1dfdd]">
                  <span className="text-[#605e5c] block">Payment:</span>
                  <span className="font-semibold capitalize">{selectedJob.paymentMethod === 'upi' ? 'UPI Online' : 'Pay at Counter'}</span>
                </div>
              </div>

              {selectedJob.fileUrl && (
                <div className="p-2.5 bg-[#e6f2fb]/50 border border-[#0067b8]/20 rounded-[2px] flex items-center justify-between">
                  <div>
                    <span className="text-[#0067b8] font-semibold block text-xs">Attached Student Document</span>
                    <span className="text-[11px] text-[#605e5c]">{selectedJob.fileName}</span>
                  </div>
                  <a
                    href={selectedJob.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-semibold rounded-[2px] shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open File</span>
                  </a>
                </div>
              )}

              {selectedJob.instructions && (
                <div className="p-3 bg-[#fff4ce]/60 border border-[#f2c80f] rounded-[2px]">
                  <span className="font-semibold text-[#d83b01] block mb-0.5">Note from Student:</span>
                  <p className="text-[#242424]">{selectedJob.instructions}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#edebe9]">
                <div>
                  <span className="text-[#605e5c] block text-[11px]">Total Amount:</span>
                  <span className="text-lg font-bold text-[#0067b8]">₹{selectedJob.cost}.00</span>
                </div>
                <div className="text-right">
                  <span className="text-[#605e5c] block text-[11px]">Pickup Counter:</span>
                  <span className="font-semibold text-[#242424]">{selectedJob.pickupCounter}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#edebe9] flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleDeleteJob(selectedJob.id, e)}
                className="text-xs text-[#d83b01] hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete from Database</span>
              </button>

              <div className="flex items-center space-x-2">
              {selectedJob.status === 'submitted' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedJob.id, 'processing', 'Printing in progress');
                    setSelectedJob(null);
                  }}
                  className="bg-[#0067b8] hover:bg-[#005da6] text-white px-4 py-2 rounded-[2px] font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Print</span>
                </button>
              )}
              {selectedJob.status === 'processing' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedJob.id, 'ready', 'Printing complete. Kept at Counter.');
                    setSelectedJob(null);
                  }}
                  className="bg-[#107c10] hover:bg-[#0e690e] text-white px-4 py-2 rounded-[2px] font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark Ready</span>
                </button>
              )}
              {selectedJob.status === 'ready' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedJob.id, 'completed', 'Collected by student');
                    setSelectedJob(null);
                  }}
                  className="bg-[#323130] hover:bg-[#201f1e] text-white px-4 py-2 rounded-[2px] font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Mark Handed Over</span>
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="px-3 py-2 border border-[#8a8886] hover:bg-[#f3f2f1] text-[#242424] font-semibold text-xs rounded-[2px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
