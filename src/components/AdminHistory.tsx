import React, { useState } from 'react';
import { PrintJob } from '../types';
import { Search, PackageCheck } from 'lucide-react';

interface AdminHistoryProps {
  jobs: PrintJob[];
}

export const AdminHistory: React.FC<AdminHistoryProps> = ({ jobs }) => {
  const [search, setSearch] = useState('');
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  const filtered = completedJobs.filter(
    (j) =>
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.studentName.toLowerCase().includes(search.toLowerCase()) ||
      j.studentRoll.toLowerCase().includes(search.toLowerCase()) ||
      j.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPagesPrinted = completedJobs.reduce((acc, j) => acc + j.pageCount * j.copies, 0);
  const totalRevenue = completedJobs.reduce((acc, j) => acc + j.cost, 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 text-[1.03em] space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-aubergine-ink tracking-tight">
            Completed Orders
          </h1>
          <p className="text-xs text-warm-ash mt-0.5">
            Record of printed assignments collected by students
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID (e.g. A001), Roll No, File..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-outline/30 rounded-full focus:ring-2 focus:ring-espresso focus:outline-none"
          />
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper-white ring-1 ring-black/[0.06] p-4 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Delivered Orders</div>
          <div className="text-2xl font-bold text-aubergine-ink mt-0.5">{completedJobs.length}</div>
        </div>
        <div className="bg-paper-white ring-1 ring-black/[0.06] p-4 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Total Pages Processed</div>
          <div className="text-2xl font-bold text-espresso mt-0.5">{totalPagesPrinted} pages</div>
        </div>
        <div className="bg-paper-white ring-1 ring-black/[0.06] p-4 rounded-[20px] shadow-card">
          <div className="text-[11px] font-semibold text-warm-ash uppercase">Settled Revenue</div>
          <div className="text-2xl font-bold text-status-ready mt-0.5">₹{totalRevenue}.00</div>
        </div>
      </div>

      {/* Archive Table */}
      <div className="bg-paper-white ring-1 ring-black/[0.06] rounded-[20px] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-linen text-warm-ash border-b border-bone">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Student Name & Roll</th>
                <th className="py-3 px-4 font-semibold">Assignment File</th>
                <th className="py-3 px-4 font-semibold">Print Specifications</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Collection Status & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone text-aubergine-ink">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone">
                    No completed print jobs in archive yet.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-linen/50">
                    <td className="py-3 px-4 font-mono font-bold text-espresso">{job.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-aubergine-ink">{job.studentName}</div>
                      <div className="text-[11px] text-warm-ash">{job.studentRoll}</div>
                    </td>
                    <td className="py-3 px-4 font-medium max-w-[200px] truncate text-aubergine-ink" title={job.fileName}>
                      {job.fileName}
                    </td>
                    <td className="py-3 px-4 text-warm-ash">
                      {job.pageCount} pgs × {job.copies} set • {job.colorMode === 'color' ? 'Color' : 'B&W'} • {job.sides === 'double' ? 'Duplex' : 'Single'}
                    </td>
                    <td className="py-3 px-4 font-bold text-status-ready">₹{job.cost}.00</td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 font-semibold text-status-completed text-xs">
                        <PackageCheck className="w-3.5 h-3.5 text-status-ready" />
                        <span>Collected</span>
                      </div>
                      <div className="text-[11px] text-stone mt-0.5">
                        {new Date(job.collectedAt || job.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
