import React, { useState } from 'react';
import { PrintJob } from '../types';
import { Search } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">
            Completed Orders
          </h1>
          <p className="text-xs text-[#605e5c] mt-0.5">
            Record of printed assignments collected by students
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#797775] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search completed jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8]"
          />
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e1dfdd] p-4 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Delivered Orders</div>
          <div className="text-2xl font-bold text-[#242424] mt-0.5">{completedJobs.length}</div>
        </div>
        <div className="bg-white border border-[#e1dfdd] p-4 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Total Pages Processed</div>
          <div className="text-2xl font-bold text-[#0067b8] mt-0.5">{totalPagesPrinted} pages</div>
        </div>
        <div className="bg-white border border-[#e1dfdd] p-4 rounded-[2px] shadow-sm">
          <div className="text-[11px] font-semibold text-[#605e5c] uppercase">Settled Revenue</div>
          <div className="text-2xl font-bold text-[#107c10] mt-0.5">₹{totalRevenue}.00</div>
        </div>
      </div>

      {/* Archive Table */}
      <div className="bg-white border border-[#e1dfdd] rounded-[2px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f8] text-[#605e5c] border-b border-[#edebe9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Token ID</th>
                <th className="py-3 px-4 font-semibold">Student Name & Roll</th>
                <th className="py-3 px-4 font-semibold">Assignment File</th>
                <th className="py-3 px-4 font-semibold">Print Specifications</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Completion Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edebe9] text-[#242424]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#797775]">
                    No completed print jobs in archive yet.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-[#f3f2f1]/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#0067b8]">{job.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{job.studentName}</div>
                      <div className="text-[11px] text-[#605e5c]">{job.studentRoll}</div>
                    </td>
                    <td className="py-3 px-4 font-medium max-w-[200px] truncate" title={job.fileName}>
                      {job.fileName}
                    </td>
                    <td className="py-3 px-4 text-[#605e5c]">
                      {job.pageCount} pgs × {job.copies} set • {job.colorMode === 'color' ? 'Color' : 'B&W'} • {job.binding}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#107c10]">₹{job.cost}.00</td>
                    <td className="py-3 px-4 text-[#797775]">
                      {new Date(job.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
