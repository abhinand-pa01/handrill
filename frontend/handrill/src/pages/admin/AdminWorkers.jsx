import { useState } from 'react';
import { Search, Plus, X, Check, Wifi, WifiOff, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar';
import Avatar from '../../components/ui/Avatar';
import ServiceIcon from '../../components/ui/ServiceIcon';
import Modal from '../../components/ui/Modal';
import StarRating from '../../components/ui/StarRating';
import { KERALA_CITIES } from '../../data/mockData';

const ADD_STEPS = ['Personal', 'Work Profile', 'Set Password'];

const EMPTY_FORM = {
  name:'', email:'', phone:'', location:'Thrissur', bio:'', experience:1,
  languages:'Malayalam', workStartTime:'09:00', workEndTime:'18:00',
  idProof:false, specializations:[], password:'', confirmPassword:'',
};

function OnlineBadge({ online }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${online ? 'bg-emerald-50' : 'bg-slate-50'}`}>
      {online ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-slate-400" />}
      <span className={`text-xs font-medium font-body ${online ? 'text-emerald-600' : 'text-slate-500'}`}>
        {online ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

export default function AdminWorkers() {
  const { workers, services, addWorker, updateWorker, deleteWorker } = useApp();
  const { registerDemoWorker } = useAuth();

  const [search, setSearch]             = useState('');
  const [onlineFilter, setOnlineFilter] = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [expandedId, setExpandedId]     = useState(null);

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addStep, setAddStep]   = useState(0);
  const [addForm, setAddForm]   = useState(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const [showAddPwd, setShowAddPwd] = useState(false);

  // Edit modal
  const [editModal, setEditModal]   = useState(false);
  const [editForm, setEditForm]     = useState(null);
  const [editError, setEditError]   = useState('');
  const [showEditPwd, setShowEditPwd] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = workers.filter(w => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      w.name.toLowerCase().includes(q) ||
      (w.profile.location || '').toLowerCase().includes(q) ||
      (w.email || '').toLowerCase().includes(q);
    const matchOnline = onlineFilter === 'All' ||
      (onlineFilter === 'Online'  && w.profile.online) ||
      (onlineFilter === 'Offline' && !w.profile.online);
    return matchSearch && matchOnline;
  });

  // ─── Add Worker ────────────────────────────────────────────────────────────
  function setAdd(field) { return e => { setAddForm(p => ({ ...p, [field]: e.target.value })); setAddError(''); }; }
  function toggleAddSpec(id) {
    setAddForm(p => ({
      ...p,
      specializations: p.specializations.includes(id)
        ? p.specializations.filter(s => s !== id)
        : [...p.specializations, id],
    }));
  }

  function canNextAdd() {
    if (addStep === 0) return addForm.name.trim() && addForm.email.trim();
    if (addStep === 1) return true;
    if (addStep === 2) {
      if (!addForm.password || addForm.password.length < 6) return false;
      if (addForm.password !== addForm.confirmPassword) return false;
      return true;
    }
    return true;
  }

  function handleAddNext() {
    setAddError('');
    if (addStep === 2) {
      if (addForm.password.length < 6) { setAddError('Password must be at least 6 characters'); return; }
      if (addForm.password !== addForm.confirmPassword) { setAddError('Passwords do not match'); return; }
      // Check duplicate email
      if (workers.find(w => w.email === addForm.email.trim())) {
        setAddError('A worker with this email already exists'); return;
      }
      const newWorker = addWorker({ ...addForm, email: addForm.email.trim(), name: addForm.name.trim() });
      // Register password so the worker can log in
      registerDemoWorker(addForm.email.trim(), addForm.password);
      setAddModal(false); setAddStep(0); setAddForm(EMPTY_FORM);
      return;
    }
    setAddStep(s => s + 1);
  }

  // ─── Edit Worker ───────────────────────────────────────────────────────────
  function openEdit(worker) {
    setEditForm({
      name:            worker.name,
      email:           worker.email,
      phone:           worker.phone || '',
      location:        worker.profile.location || 'Thrissur',
      bio:             worker.profile.bio || '',
      experience:      worker.profile.experience || 1,
      languages:       worker.profile.languages || 'Malayalam',
      workStartTime:   worker.profile.workStartTime || '09:00',
      workEndTime:     worker.profile.workEndTime || '18:00',
      idProof:         worker.profile.idProof || false,
      specializations: worker.profile.specializations || [],
      newPassword:     '',
      confirmPassword: '',
    });
    setEditError('');
    setSelectedWorker(worker);
    setEditModal(true);
  }

  function setEdit(field) { return e => { setEditForm(p => ({ ...p, [field]: e.target.value })); setEditError(''); }; }
  function toggleEditSpec(id) {
    setEditForm(p => ({
      ...p,
      specializations: p.specializations.includes(id)
        ? p.specializations.filter(s => s !== id)
        : [...p.specializations, id],
    }));
  }

  function handleSaveEdit() {
    setEditError('');
    if (!editForm.name.trim() || !editForm.email.trim()) { setEditError('Name and email are required'); return; }
    if (editForm.newPassword) {
      if (editForm.newPassword.length < 6) { setEditError('New password must be at least 6 characters'); return; }
      if (editForm.newPassword !== editForm.confirmPassword) { setEditError('Passwords do not match'); return; }
    }
    updateWorker(selectedWorker.id, {
      name:          editForm.name.trim(),
      email:         editForm.email.trim(),
      phone:         editForm.phone,
      location:      editForm.location,
      bio:           editForm.bio,
      experience:    editForm.experience,
      languages:     editForm.languages,
      workStartTime: editForm.workStartTime,
      workEndTime:   editForm.workEndTime,
      idProof:       editForm.idProof,
      specializations: editForm.specializations,
      ...(editForm.newPassword ? { password: editForm.newPassword } : {}),
    });
    if (editForm.newPassword) {
      registerDemoWorker(editForm.email.trim(), editForm.newPassword);
    }
    setEditModal(false);
    setSelectedWorker(null);
  }

  // ─── Delete Worker ─────────────────────────────────────────────────────────
  function handleDelete() {
    if (deleteTarget) {
      deleteWorker(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="Workers" rightSlot={
        <button
          onClick={() => { setAddModal(true); setAddStep(0); setAddForm(EMPTY_FORM); setAddError(''); }}
          className="flex items-center gap-1.5 bg-brand-blue text-white px-3 py-1.5 rounded-lg text-sm font-semibold font-body"
        >
          <Plus size={14} />Add Worker
        </button>
      } />

      {/* Search + filter */}
      <div className="bg-white border-b border-border sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search workers, locations, emails..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-10 text-sm" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={14} /></button>}
          </div>
          <div className="flex gap-1.5">
            {['All','Online','Offline'].map(f => (
              <button key={f} onClick={() => setOnlineFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium font-body transition-all ${onlineFilter===f ? 'bg-brand-blue text-white' : 'bg-bg text-secondary hover:bg-slate-100'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <p className="text-xs text-muted font-body">{filtered.length} worker{filtered.length !== 1 ? 's' : ''}</p>

        {filtered.map(worker => {
          const myServices = services.filter(s => (worker.profile.specializations || []).includes(s.id));
          const isExpanded = expandedId === worker.id;
          return (
            <div key={worker.id} className="card overflow-hidden">
              {/* Main row */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar name={worker.name} size="lg" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${worker.profile.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display font-semibold text-primary">{worker.name}</p>
                        <p className="text-xs text-secondary font-body">{worker.profile.location} · {worker.profile.experience} yrs · {worker.email}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <OnlineBadge online={worker.profile.online} />
                        <div className="bg-brand-blue text-white px-2 py-0.5 rounded-lg">
                          <p className="font-display font-bold text-xs">{worker.profile.performanceScore}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <StarRating rating={worker.profile.averageRating} size={12} />
                      <span className="text-xs text-secondary font-body ml-0.5">{worker.profile.averageRating}</span>
                      <span className="text-muted text-xs mx-1">·</span>
                      <span className="text-xs text-secondary font-body">{worker.profile.totalJobsCompleted} jobs</span>
                      <span className="text-muted text-xs mx-1">·</span>
                      <span className="text-xs text-secondary font-body">{worker.profile.activeJobCount} active</span>
                    </div>
                    {myServices.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {myServices.slice(0, 3).map(s => (
                          <div key={s.id} className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ backgroundColor: s.color + '15' }}>
                            <ServiceIcon name={s.icon} size={10} style={{ color: s.color }} />
                            <span className="text-xs font-body" style={{ color: s.color }}>{s.name}</span>
                          </div>
                        ))}
                        {myServices.length > 3 && <span className="text-xs text-muted font-body self-center">+{myServices.length-3}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action row */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button onClick={() => openEdit(worker)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-brand-blue rounded-lg text-xs font-semibold font-body hover:bg-blue-100 transition-colors">
                    <Pencil size={13} />Edit
                  </button>
                  <button onClick={() => setExpandedId(isExpanded ? null : worker.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-bg text-secondary rounded-lg text-xs font-semibold font-body hover:bg-slate-100 transition-colors">
                    {isExpanded ? <><ChevronUp size={13} />Less</> : <><ChevronDown size={13} />Details</>}
                  </button>
                  <button onClick={() => setDeleteTarget(worker)}
                    className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border bg-bg/50 space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-body">
                    {[
                      { l:'Phone',      v: worker.phone || 'Not set' },
                      { l:'Languages',  v: worker.profile.languages },
                      { l:'Work Hours', v: `${worker.profile.workStartTime} – ${worker.profile.workEndTime}` },
                      { l:'ID Proof',   v: worker.profile.idProof ? 'Verified' : 'Not verified' },
                    ].map(i => (
                      <div key={i.l} className="bg-white rounded-xl p-2.5">
                        <p className="text-muted">{i.l}</p>
                        <p className="font-semibold text-primary mt-0.5">{i.v}</p>
                      </div>
                    ))}
                  </div>
                  {worker.profile.bio && (
                    <p className="text-xs text-secondary font-body bg-white rounded-xl p-3 italic">{worker.profile.bio}</p>
                  )}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs text-amber-700 font-body">
                      Workers control their own online/offline status from their Home or Profile screen.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-display font-semibold text-primary">No workers found</p>
            <p className="text-sm text-secondary font-body mt-1">Try a different search or add a new worker</p>
          </div>
        )}
      </div>

      {/* ── Add Worker Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Worker" size="md">
        <div className="p-5">
          {/* Step indicator */}
          <div className="flex gap-2 mb-5">
            {ADD_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${i < addStep ? 'bg-emerald-500 text-white' : i===addStep ? 'bg-brand-blue text-white' : 'bg-slate-100 text-muted'}`}>
                  {i < addStep ? <Check size={11} /> : i+1}
                </div>
                <span className={`text-xs font-body ${i===addStep ? 'text-brand-blue font-medium' : 'text-muted'} hidden sm:inline`}>{s}</span>
                {i < ADD_STEPS.length-1 && <div className={`flex-1 h-0.5 mx-1 ${i < addStep ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>

          {addError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 font-body">{addError}</p>
            </div>
          )}

          {/* Step 0: Personal */}
          {addStep === 0 && (
            <div className="space-y-3">
              {[{l:'Full Name',field:'name',type:'text',ph:'Rajesh Kumar'},
                {l:'Email Address',field:'email',type:'email',ph:'rajesh@example.com'},
                {l:'Phone',field:'phone',type:'tel',ph:'+91 98765 43210'},
              ].map(f => (
                <div key={f.field}>
                  <label className="label">{f.l}</label>
                  <input type={f.type} className="input-field" placeholder={f.ph} value={addForm[f.field]} onChange={setAdd(f.field)} />
                </div>
              ))}
              <div>
                <label className="label">City</label>
                <select className="input-field" value={addForm.location} onChange={setAdd('location')}>
                  {KERALA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 1: Work Profile */}
          {addStep === 1 && (
            <div className="space-y-3">
              <div>
                <label className="label">Bio (optional)</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Brief description..." value={addForm.bio} onChange={setAdd('bio')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Experience (yrs)</label>
                  <input type="number" className="input-field" min="0" max="40" value={addForm.experience}
                    onChange={e => setAddForm(p => ({...p, experience: parseInt(e.target.value)||1}))} />
                </div>
                <div>
                  <label className="label">Languages</label>
                  <input type="text" className="input-field" placeholder="Malayalam, English" value={addForm.languages} onChange={setAdd('languages')} />
                </div>
                <div>
                  <label className="label">Work Start</label>
                  <input type="time" className="input-field" value={addForm.workStartTime} onChange={setAdd('workStartTime')} />
                </div>
                <div>
                  <label className="label">Work End</label>
                  <input type="time" className="input-field" value={addForm.workEndTime} onChange={setAdd('workEndTime')} />
                </div>
              </div>
              <div>
                <label className="label">Specializations</label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map(s => (
                    <button key={s.id} type="button" onClick={() => toggleAddSpec(s.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left ${addForm.specializations.includes(s.id) ? 'border-brand-blue bg-blue-50' : 'border-border bg-white hover:border-slate-300'}`}>
                      <ServiceIcon name={s.icon} size={14} style={{ color: s.color }} />
                      <span className="text-xs font-body font-medium text-primary">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Set Password */}
          {addStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-brand-blue font-body mb-0.5">Setting login credentials</p>
                <p className="text-xs text-secondary font-body">
                  The worker will use <strong>{addForm.email}</strong> and this password to log in.
                </p>
              </div>
              <div>
                <label className="label">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type={showAddPwd ? 'text' : 'password'} className="input-field pr-10"
                    placeholder="Min. 6 characters" value={addForm.password} onChange={setAdd('password')} />
                  <button type="button" onClick={() => setShowAddPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    {showAddPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type={showAddPwd ? 'text' : 'password'} className={`input-field pr-10 ${addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'ring-2 ring-red-300 border-transparent' : ''}`}
                    placeholder="Repeat password" value={addForm.confirmPassword} onChange={setAdd('confirmPassword')} />
                  {addForm.confirmPassword && addForm.password === addForm.confirmPassword && (
                    <Check size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>
              {/* Summary */}
              <div className="card p-3 space-y-1.5 text-xs font-body">
                {[{l:'Name',v:addForm.name},{l:'Email',v:addForm.email},{l:'City',v:addForm.location},{l:'Experience',v:`${addForm.experience} yrs`}].map(i => (
                  <div key={i.l} className="flex justify-between">
                    <span className="text-muted">{i.l}</span>
                    <span className="font-semibold text-primary">{i.v}</span>
                  </div>
                ))}
                {addForm.specializations.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Services</span>
                    <span className="font-semibold text-primary text-right max-w-[60%]">
                      {services.filter(s => addForm.specializations.includes(s.id)).map(s => s.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            {addStep > 0 && <button onClick={() => setAddStep(s => s-1)} className="btn-secondary px-5">Back</button>}
            <button onClick={handleAddNext} disabled={!canNextAdd()} className="btn-primary flex-1">
              {addStep < ADD_STEPS.length-1 ? 'Next' : 'Create Worker'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Worker Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title={`Edit — ${selectedWorker?.name}`} size="md">
        {editForm && (
          <div className="p-5 space-y-3">
            {editError && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-body">{editError}</p>
              </div>
            )}

            {[{l:'Full Name',field:'name',type:'text'},{l:'Email',field:'email',type:'email'},{l:'Phone',field:'phone',type:'tel'}].map(f => (
              <div key={f.field}>
                <label className="label">{f.l}</label>
                <input type={f.type} className="input-field" value={editForm[f.field]} onChange={setEdit(f.field)} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <select className="input-field" value={editForm.location} onChange={setEdit('location')}>
                  {KERALA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Experience (yrs)</label>
                <input type="number" className="input-field" min="0" max="40" value={editForm.experience}
                  onChange={e => setEditForm(p => ({...p, experience: parseInt(e.target.value)||1}))} />
              </div>
              <div>
                <label className="label">Work Start</label>
                <input type="time" className="input-field" value={editForm.workStartTime} onChange={setEdit('workStartTime')} />
              </div>
              <div>
                <label className="label">Work End</label>
                <input type="time" className="input-field" value={editForm.workEndTime} onChange={setEdit('workEndTime')} />
              </div>
            </div>
            <div>
              <label className="label">Languages</label>
              <input type="text" className="input-field" value={editForm.languages} onChange={setEdit('languages')} />
            </div>
            <div>
              <label className="label">Bio (optional)</label>
              <textarea className="input-field resize-none" rows={2} value={editForm.bio} onChange={setEdit('bio')} />
            </div>

            {/* Specializations */}
            <div>
              <label className="label">Specializations</label>
              <div className="grid grid-cols-2 gap-2">
                {services.map(s => (
                  <button key={s.id} type="button" onClick={() => toggleEditSpec(s.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${editForm.specializations.includes(s.id) ? 'border-brand-blue bg-blue-50' : 'border-border bg-white'}`}>
                    <ServiceIcon name={s.icon} size={12} style={{ color: s.color }} />
                    <span className="text-xs font-body font-medium text-primary">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Change password section */}
            <div className="border-t border-border pt-3">
              <label className="label">New Password (leave blank to keep current)</label>
              <div className="relative mb-2">
                <input type={showEditPwd ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="New password (optional)" value={editForm.newPassword} onChange={setEdit('newPassword')} />
                <button type="button" onClick={() => setShowEditPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showEditPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {editForm.newPassword && (
                <input type={showEditPwd ? 'text' : 'password'} className="input-field"
                  placeholder="Confirm new password" value={editForm.confirmPassword} onChange={setEdit('confirmPassword')} />
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary flex-1">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Worker">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={deleteTarget?.name} size="md" />
            <div>
              <p className="font-display font-semibold text-primary">{deleteTarget?.name}</p>
              <p className="text-sm text-secondary font-body">{deleteTarget?.email}</p>
            </div>
          </div>
          <p className="text-sm text-secondary font-body">
            Are you sure you want to remove this worker? All their booking history will remain but they will no longer appear in the workers list.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Remove Worker</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
