import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:8000/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ExportPreview() {
  const { currentConfig } = useStore();
  const navigate = useNavigate();

  const [allocations, setAllocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [filterType, setFilterType] = useState('all'); // all, semester, faculty, room
  const [filterId, setFilterId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [alloc, b, s, sub, fac, rm] = await Promise.all([
      axios.get(`${API_URL}/allocations`),
      axios.get(`${API_URL}/branches`),
      axios.get(`${API_URL}/semesters`),
      axios.get(`${API_URL}/subjects`),
      axios.get(`${API_URL}/faculties`),
      axios.get(`${API_URL}/rooms`)
    ]);
    if (currentConfig) {
      setAllocations(alloc.data.filter((a:any) => a.config_id === currentConfig.id));
    }
    setBranches(b.data);
    setSemesters(s.data);
    setSubjects(sub.data);
    setFaculties(fac.data);
    setRooms(rm.data);
  };

  const getFilteredData = () => {
    let filtered = allocations;
    if (filterType === 'semester' && filterId) {
      filtered = allocations.filter((a:any) => String(a.semester_id) === filterId);
    } else if (filterType === 'faculty' && filterId) {
      filtered = allocations.filter((a:any) => String(a.faculty_id) === filterId);
    } else if (filterType === 'room' && filterId) {
      filtered = allocations.filter((a:any) => String(a.room_id) === filterId);
    }

    return filtered.map((a:any) => {
      const sem = semesters.find((s:any) => s.id === a.semester_id);
      const branch = branches.find((b:any) => b.id === (sem as any)?.branch_id);
      return {
        Day: a.day_of_week,
        StartTime: a.start_time,
        DurationMins: a.duration_minutes,
        Branch: (branch as any)?.name,
        Semester: (sem as any)?.name,
        Subject: (subjects.find((sub:any) => sub.id === a.subject_id) as any)?.name,
        Faculty: (faculties.find((f:any) => f.id === a.faculty_id) as any)?.name,
        Room: (rooms.find((r:any) => r.id === a.room_id) as any)?.name,
        Batch: a.batch_name || 'All'
      };
    });
  };

  const exportData = getFilteredData();

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, `${currentConfig?.name || 'Master'}_Timetable.xlsx`);
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      {/* Sidebar Controls */}
      <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-xl z-10">
        <h2 className="text-2xl font-black text-slate-800 mb-8 border-b pb-4">Export Options</h2>
        
        <div className="flex flex-col gap-6 flex-1">
          <label className="flex flex-col gap-2">
            <span className="font-bold text-sm text-slate-500 uppercase tracking-widest">Filter By</span>
            <select className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              value={filterType} onChange={(e) => {setFilterType(e.target.value); setFilterId('');}}>
              <option value="all">Master (All Data)</option>
              <option value="semester">Specific Semester</option>
              <option value="faculty">Specific Faculty</option>
              <option value="room">Specific Room</option>
            </select>
          </label>

          {filterType === 'semester' && (
            <select className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={filterId} onChange={(e) => setFilterId(e.target.value)}>
              <option value="">Select Semester...</option>
              {semesters.map((s:any) => <option key={s.id} value={s.id}>{s.name} (Branch {s.branch_id})</option>)}
            </select>
          )}

          {filterType === 'faculty' && (
            <select className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={filterId} onChange={(e) => setFilterId(e.target.value)}>
              <option value="">Select Faculty...</option>
              {faculties.map((f:any) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )}

          {filterType === 'room' && (
            <select className="p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={filterId} onChange={(e) => setFilterId(e.target.value)}>
              <option value="">Select Room...</option>
              {rooms.map((r:any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
        </div>

        <button onClick={handleExportExcel} className="mt-8 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all flex justify-between items-center group">
          <span>Download Excel</span>
          <span className="group-hover:translate-x-1 transition-transform">&darr;</span>
        </button>

        <button onClick={() => navigate('/grid')} className="mt-4 px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all">
          &larr; Back to Grid
        </button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
            Preview Data Grid
          </h1>
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
            {exportData.length} records matching '{filterType}'
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 shadow-sm z-10">
              <tr>
                {['Day', 'Start', 'Dur(m)', 'Branch', 'Sem', 'Subject', 'Faculty', 'Room', 'Batch'].map(header => (
                  <th key={header} className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 italic font-medium">No records to preview.</td>
                </tr>
              ) : (
                exportData.map((row:any, idx:number) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{row.Day}</td>
                    <td className="p-4 text-slate-600">{row.StartTime.slice(0,5)}</td>
                    <td className="p-4 text-slate-600">{row.DurationMins}</td>
                    <td className="p-4 font-medium text-blue-600">{row.Branch}</td>
                    <td className="p-4 text-slate-600">{row.Semester}</td>
                    <td className="p-4 font-medium text-slate-800">{row.Subject}</td>
                    <td className="p-4 text-emerald-600 font-semibold">{row.Faculty}</td>
                    <td className="p-4 font-mono text-slate-500 text-sm bg-slate-100 rounded px-2 py-1 mx-2">{row.Room}</td>
                    <td className="p-4 text-slate-600">{row.Batch}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
