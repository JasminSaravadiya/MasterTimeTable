import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { parse, addMinutes, isBefore, format } from 'date-fns';

const API_URL = 'http://localhost:8000/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MasterGrid() {
  const { currentConfig } = useStore();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [subjects, setSubjects] = useState([]); // Global fetch for dropdowns
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string, semId: number} | null>(null);

  useEffect(() => {
    if (!currentConfig) navigate('/');
    fetchBaseData();
    fetchAllocations();
  }, [currentConfig]);

  const fetchBaseData = async () => {
    const [b, s, sub, fac, rm] = await Promise.all([
      axios.get(`${API_URL}/branches`),
      axios.get(`${API_URL}/semesters`),
      axios.get(`${API_URL}/subjects`),
      axios.get(`${API_URL}/faculties`),
      axios.get(`${API_URL}/rooms`)
    ]);
    setBranches(b.data);
    setSemesters(s.data);
    setSubjects(sub.data);
    setFaculties(fac.data);
    setRooms(rm.data);
  };

  const fetchAllocations = async () => {
    const res = await axios.get(`${API_URL}/allocations`);
    setAllocations(res.data.filter((a: any) => a.config_id === currentConfig?.id));
  };

  // Generate Y-Axis Tiemslots
  const generateTimeslots = () => {
    if (!currentConfig) return [];
    const slots = [];
    const start = parse(currentConfig.start_time, 'HH:mm:ss', new Date());
    const end = parse(currentConfig.end_time, 'HH:mm:ss', new Date());
    let current = start;

    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm:ss'));
      current = addMinutes(current, currentConfig.slot_duration_minutes);
    }
    return slots;
  };
  const timeslots = generateTimeslots();

  // Find allocation helper
  const getAllocationsForCell = (day: string, time: string, semId: number) => {
    return allocations.filter((a: any) => a.day_of_week === day && a.start_time === time && a.semester_id === semId);
  };

  const handleCellClick = (day: string, time: string, semId: number) => {
    setSelectedCell({ day, time, semId });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-300 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {currentConfig?.name}
          </h1>
          <p className="text-sm text-slate-400">
            {currentConfig?.start_time} - {currentConfig?.end_time} • {currentConfig?.slot_duration_minutes}m slots
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition">↩ Undo</button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition">↪ Redo</button>
          <button onClick={() => navigate('/configure')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition shadow border border-slate-600">⚙ Settings</button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white shadow-lg shadow-blue-500/30 transition">Export &rarr;</button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto relative p-4 custom-scrollbar">
        <div className="inline-block min-w-full rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm overflow-hidden shadow-2xl">
          
          <table className="w-full border-collapse">
            {/* Table Header: Branches and Semesters */}
            <thead className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
              <tr>
                <th className="border-r border-slate-700 p-3 min-w-[120px] bg-slate-900 z-30 sticky left-0 shadow-sm" rowSpan={2}>Day / Time</th>
                {branches.map((b: any) => {
                  const sems = semesters.filter((s: any) => s.branch_id === b.id);
                  if (sems.length === 0) return null;
                  return (
                    <th key={b.id} colSpan={sems.length} className="border-r border-slate-700 p-3 text-center font-bold text-emerald-400 uppercase tracking-widest text-sm bg-slate-800">
                      {b.name}
                    </th>
                  );
                })}
              </tr>
              <tr>
                {branches.map((b: any) => {
                  const sems = semesters.filter((s: any) => s.branch_id === b.id);
                  return sems.map((s: any) => (
                    <th key={s.id} className="border-r border-slate-700 p-2 text-center text-sm font-semibold text-slate-300 bg-slate-800/80 min-w-[200px]">
                      {s.name}
                    </th>
                  ));
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {DAYS.map((day) => (
                <React.Fragment key={day}>
                  {/* Day Row Header */}
                  <tr>
                    <td colSpan={100} className="bg-slate-900/80 p-2 font-bold text-blue-400 sticky left-0 z-10 border-y border-slate-700/50 shadow-inner block w-full text-center">
                      {day}
                    </td>
                  </tr>
                  {/* Timeslot Rows */}
                  {timeslots.map((time) => (
                    <tr key={`${day}-${time}`} className="group hover:bg-slate-800/30 transition">
                      <td className="border border-slate-700/50 p-3 text-sm font-medium text-slate-400 sticky left-0 bg-slate-900 z-10 whitespace-nowrap text-center group-hover:bg-slate-800 shadow-[1px_0_0_0_#334155]">
                        {time.slice(0, 5)}
                      </td>
                      
                      {/* Cells for each Sem */}
                      {branches.map((b: any) => {
                        const sems = semesters.filter((s: any) => s.branch_id === b.id);
                        return sems.map((s: any) => {
                          const cellAllocs = getAllocationsForCell(day, time, s.id);
                          
                          return (
                            <td 
                              key={`${day}-${time}-${s.id}`} 
                              className="border border-slate-700/50 p-2 relative min-h-[80px] cursor-pointer hover:bg-slate-700/40 transition align-top"
                              onClick={() => handleCellClick(day, time, s.id)}
                            >
                              <div className="flex flex-col gap-1 w-full h-full">
                                {cellAllocs.length === 0 ? (
                                  <div className="w-full h-full min-h-[60px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-slate-500 font-bold text-xl">+</span>
                                  </div>
                                ) : (
                                  // Split batches horizontally logic handled by flex row if many, or col if full scale
                                  <div className={`flex gap-1 w-full h-full ${cellAllocs.length > 1 ? 'flex-row' : 'flex-col'}`}>
                                    {cellAllocs.map((a: any) => (
                                      <div key={a.id} className="bg-blue-900/40 border border-blue-500/50 rounded-lg p-2 flex-1 shadow flex flex-col justify-center min-w-[80px]">
                                        <div className="font-bold text-blue-100 text-xs truncate" title={(subjects.find((sub:any)=>sub.id===a.subject_id) as any)?.name}>
                                          {(subjects.find((sub:any)=>sub.id===a.subject_id) as any)?.name || `Sub ${a.subject_id}`}
                                        </div>
                                        <div className="text-emerald-400 text-xs mt-1 truncate">
                                          {(faculties.find((f:any)=>f.id===a.faculty_id) as any)?.name}
                                        </div>
                                        <div className="flex justify-between mt-1 items-center">
                                          <span className="text-slate-400 text-[10px] bg-slate-800 px-1 rounded">
                                            {(rooms.find((r:any)=>r.id===a.room_id) as any)?.name}
                                          </span>
                                          {a.batch_name && <span className="text-blue-300 text-[10px] font-bold">{a.batch_name}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        });
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* Allocation Modal */}
      {isModalOpen && selectedCell && (
        <AllocationModal 
          cell={selectedCell} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchAllocations(); }}
        />
      )}
    </div>
  );
}

// Subcomponent for Allocation
function AllocationModal({ cell, onClose, onSuccess }: { cell: any, onClose: any, onSuccess: any }) {
  const { currentConfig } = useStore();
  const [formData, setFormData] = useState({
    subject_id: '',
    faculty_id: '',
    room_id: '',
    duration_minutes: currentConfig?.slot_duration_minutes || 60,
    batch_name: ''
  });

  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch contextual mapped data for this semester
  useEffect(() => {
    const loadContextualData = async () => {
      const [sub, fac, rm] = await Promise.all([
        axios.get(`${API_URL}/subjects`), // Ideally filtered by semester_id
        axios.get(`${API_URL}/mappings/faculty/${cell.semId}`),
        axios.get(`${API_URL}/rooms`) // Optionally mapped rooms
      ]);
      setSubjects(sub.data.filter((s:any) => s.semester_id === cell.semId));
      setFaculties(fac.data);
      setRooms(rm.data);
    };
    loadContextualData();
  }, [cell]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post(`${API_URL}/allocations`, {
        config_id: currentConfig?.id,
        semester_id: cell.semId,
        subject_id: parseInt(formData.subject_id),
        faculty_id: parseInt(formData.faculty_id),
        room_id: parseInt(formData.room_id),
        day_of_week: cell.day,
        start_time: cell.time,
        duration_minutes: formData.duration_minutes,
        batch_name: formData.batch_name || undefined
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to allocate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-md border border-slate-600 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all scale-100">
        <h2 className="text-2xl font-bold mb-2 text-white">Allocate Slot</h2>
        <p className="text-slate-400 mb-6 text-sm">{cell.day} @ {cell.time.slice(0, 5)} (Semester ID: {cell.semId})</p>
        
        {errorMsg && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Subject</label>
            <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              value={formData.subject_id} onChange={(e) => setFormData({...formData, subject_id: e.target.value})}>
              <option value="">Select subject...</option>
              {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.name} ({s.weekly_hours}h/w)</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Faculty (Mapped to Semester)</label>
            <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              value={formData.faculty_id} onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}>
              <option value="">Select mapped faculty...</option>
              {faculties.map((f:any) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Room</label>
              <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
                <option value="">Room...</option>
                {rooms.map((r:any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Duration (mins)</label>
              <input type="number" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}/>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Batch (Optional Split)</label>
            <input type="text" placeholder="e.g. Batch A" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              value={formData.batch_name} onChange={(e) => setFormData({...formData, batch_name: e.target.value})}/>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition disabled:opacity-50">
              {loading ? 'Checking...' : 'Allocate Slot &rarr;'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
