import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// @ts-ignore
// @ts-ignore
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
// @ts-ignore
import { CSS } from '@dnd-kit/utilities';

const API_URL = 'http://localhost:8000/api';

// --- Subcomponent for Draggable Faculty ---
function SortableFacultyItem({ id, name, onRemove }: { id: string, name: string, onRemove: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-slate-700 p-3 rounded-lg mb-2 shadow flex justify-between cursor-grab active:cursor-grabbing border border-slate-600 hover:border-blue-400">
      <span className="font-semibold text-slate-200">{name}</span>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(id); }} className="text-red-400 hover:text-red-300 text-sm z-10 pointer-events-auto">
          ✕
        </button>
      )}
    </div>
  );
}

export default function Configuration() {
  const { currentConfig } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'branches'|'semesters'|'faculties'|'rooms'|'mapping'>('branches');

  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Data Loading
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [b, s, f, r] = await Promise.all([
      axios.get(`${API_URL}/branches`),
      axios.get(`${API_URL}/semesters`),
      axios.get(`${API_URL}/faculties`),
      axios.get(`${API_URL}/rooms`)
    ]);
    setBranches(b.data);
    setSemesters(s.data);
    setFaculties(f.data);
    setRooms(r.data);
  };

  // Generic additions
  const handleAdd = async (type: string, payload: any) => {
    await axios.post(`${API_URL}/${type}`, payload);
    fetchData();
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col p-4">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-8 border-b border-slate-700 pb-4">
          Config Data
        </h2>
        
        <nav className="flex flex-col gap-2 flex-grow">
          {['branches', 'semesters', 'faculties', 'rooms', 'mapping'].map((tab) => (
            <button key={tab} 
              className={`text-left px-4 py-3 rounded-xl transition font-semibold tracking-wide ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              onClick={() => setActiveTab(tab as any)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        
        <button className="mt-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition" onClick={() => navigate('/grid')}>
          Go to Grid &rarr;
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {activeTab === 'branches' && (
          <SimpleCrud title="Branches" data={branches} onAdd={(name: string) => handleAdd('branches', { name })} />
        )}
        
        {activeTab === 'semesters' && (
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Semesters</h1>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              handleAdd('semesters', { name: e.target.name.value, branch_id: parseInt(e.target.branch_id.value) });
              e.target.reset();
            }} className="flex gap-4 mb-8">
              <select name="branch_id" required className="bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                <option value="">Select Branch</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input name="name" placeholder="Semester Name" required className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500"/>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold transition">Add</button>
            </form>
            <div className="grid grid-cols-2 gap-4">
              {semesters.map((s: any) => (
                <div key={s.id} className="bg-slate-800 p-4 border border-slate-700 rounded-xl">
                  {s.name} <span className="text-sm text-slate-500 ml-2">(Branch ID: {s.branch_id})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faculties' && (
          <SimpleCrud title="Faculties" data={faculties} onAdd={(name: string) => handleAdd('faculties', { name })} />
        )}

        {activeTab === 'rooms' && (
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Rooms</h1>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              handleAdd('rooms', { name: e.target.name.value, capacity: parseInt(e.target.capacity.value) });
              e.target.reset();
            }} className="flex gap-4 mb-8">
              <input name="name" placeholder="Room Name (e.g., L-101)" required className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500"/>
              <input name="capacity" type="number" placeholder="Capacity" required className="w-32 bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500"/>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold transition">Add</button>
            </form>
            <div className="grid grid-cols-3 gap-4">
              {rooms.map((r: any) => (
                <div key={r.id} className="bg-slate-800 p-4 border border-slate-700 rounded-xl flex justify-between">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-emerald-400 text-sm py-1 px-2 bg-emerald-400/10 rounded-full">{r.capacity} seats</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <MappingInterface branches={branches} semesters={semesters} allFaculties={faculties} />
        )}

      </div>
    </div>
  );
}

// Reusable basic CRUD
const SimpleCrud = ({ title, data, onAdd }: { title: string, data: any[], onAdd: any }) => (
  <div className="max-w-2xl">
    <h1 className="text-3xl font-bold mb-6 text-white border-b border-slate-700 pb-4">{title}</h1>
    <form onSubmit={(e: any) => {
      e.preventDefault();
      onAdd(e.target.name.value);
      e.target.reset();
    }} className="flex gap-4 mb-8">
      <input name="name" placeholder={`New ${title} name...`} required className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"/>
      <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold shadow-lg transition">Add</button>
    </form>
    <div className="flex flex-col gap-2">
      {data.map((item: any) => (
        <div key={item.id} className="bg-slate-800 p-4 border border-slate-700 rounded-lg text-lg font-medium tracking-wide">
          {item.name}
        </div>
      ))}
    </div>
  </div>
);

// Drag-and-Drop Mapping UI
const MappingInterface = ({ branches, semesters, allFaculties }: { branches: any[], semesters: any[], allFaculties: any[] }) => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [mappedFaculties, setMappedFaculties] = useState<any[]>([]);

  const filteredSemesters = semesters.filter((s:any) => String(s.branch_id) === String(selectedBranch));

  useEffect(() => {
    if (selectedSemester) {
      axios.get(`${API_URL}/mappings/faculty/${selectedSemester}`).then(res => {
        setMappedFaculties(res.data);
      });
    } else {
      setMappedFaculties([]);
    }
  }, [selectedSemester]);

  const availableFaculties = allFaculties.filter(
    (f:any) => !mappedFaculties.find((mf) => mf.id === f.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (over && over.id === 'mapped-zone') {
      // Find faculty in available
      const faculty = availableFaculties.find((f:any) => 'available-'+f.id === active.id);
      if (faculty && selectedSemester) {
        // Map it via API
        await axios.post(`${API_URL}/mappings/faculty`, {
          semester_id: parseInt(selectedSemester),
          faculty_id: faculty.id
        });
        setMappedFaculties([...mappedFaculties, faculty]);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Mapping: Assign Faculties to Semesters</h1>
      
      <div className="flex gap-4 mb-8">
        <select value={selectedBranch} onChange={(e) => {setSelectedBranch(e.target.value); setSelectedSemester('');}} 
          className="bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 w-64">
          <option value="">Select Branch...</option>
          {branches.map((b:any) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        
        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} disabled={!selectedBranch}
          className="bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 w-64 disabled:opacity-50">
          <option value="">Select Semester...</option>
          {filteredSemesters.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {selectedSemester ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-8 flex-1 min-h-0">
            {/* Global Available View */}
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-slate-300">Available Global Faculties</h2>
              <div className="flex-1 overflow-y-auto pr-2">
                <SortableContext items={availableFaculties.map((f:any) => 'available-'+f.id)} strategy={verticalListSortingStrategy}>
                  {availableFaculties.map((f:any) => (
                    <SortableFacultyItem key={`available-${f.id}`} id={`available-${f.id}`} name={f.name} onRemove={null} />
                  ))}
                </SortableContext>
                {availableFaculties.length === 0 && <p className="text-slate-500 italic">All faculties assigned here.</p>}
              </div>
            </div>

            {/* Dropzone Mapped View */}
            <DroppableZone id="mapped-zone" mappedFaculties={mappedFaculties} />
          </div>
        </DndContext>
      ) : (
        <div className="flex-1 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center text-slate-500">
          Select a Branch and Semester to begin mapping faculties.
        </div>
      )}
    </div>
  );
};

// Custom Droppable Zone Component
// @ts-ignore
import { useDroppable } from '@dnd-kit/core';
const DroppableZone = ({ id, mappedFaculties }: { id: string, mappedFaculties: any[] }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={`flex-1 border-2 rounded-2xl p-6 flex flex-col transition ${isOver ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Allocated to Semester</h2>
      <div className="flex-1 overflow-y-auto pr-2">
        {mappedFaculties.map(f => (
          <div key={`mapped-${f.id}`} className="bg-emerald-900/40 p-3 rounded-lg mb-2 border border-emerald-600 text-emerald-100 flex justify-between">
            {f.name}
            <span className="text-xs text-emerald-400/60 uppercase font-bold tracking-wider">Mapped</span>
          </div>
        ))}
        {mappedFaculties.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-center">
            Drag faculties here from the left list.
          </div>
        )}
      </div>
    </div>
  );
};
