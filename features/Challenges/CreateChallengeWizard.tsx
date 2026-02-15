import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports as they are reported missing from 'firebase/firestore'
import { collection, addDoc, serverTimestamp, Timestamp, getDocs, query, orderBy } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { ChallengeType, ChallengeActivity, UserDoc, CatalogExercise } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Info, 
  Rocket, 
  Calendar as CalendarIcon,
  X,
  Trophy,
  Dumbbell,
  Clock,
  Target,
  Layout
} from 'lucide-react';
import { parseISO, isAfter } from 'date-fns';

interface CreateChallengeWizardProps { user: UserDoc | null; }

const CreateChallengeWizard: React.FC<CreateChallengeWizardProps> = ({ user }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  // Form State
  const [type, setType] = useState<ChallengeType>('DAILY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState<ChallengeActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Exercises for Step 3
  const { data: catalog, isLoading: loadingCatalog } = useQuery({
    queryKey: ['catalogExercises'],
    queryFn: async () => {
      const q = query(collection(db, 'catalogExercises'), orderBy('name'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CatalogExercise));
    }
  });

  const filteredCatalog = catalog?.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId) return;
      const challengeData = {
        groupId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        type,
        title,
        description,
        coverImageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800', 
        startDate: Timestamp.fromDate(parseISO(startDate)),
        endDate: Timestamp.fromDate(parseISO(endDate || startDate)),
        participants: [user.uid],
        challengeAdmins: [user.uid],
        activities
      };
      const docRef = await addDoc(collection(db, 'challenges'), challengeData);
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', groupId] });
      navigate(`/groups/${groupId}`);
    }
  });

  const addActivity = (ex: CatalogExercise) => {
    if (activities.some(a => a.exerciseId === ex.id)) return;
    const newAct: ChallengeActivity = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      metricUnit: ex.metricUnit,
      targetValue: ex.metricUnit === 'km' ? 5 : 50,
      order: activities.length
    };
    setActivities([...activities, newAct]);
    setSearchQuery('');
  };

  const updateTarget = (id: string, val: number) => {
    setActivities(prev => prev.map(a => a.exerciseId === id ? { ...a, targetValue: Math.max(0, val) } : a));
  };

  const removeActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.exerciseId !== id));
  };

  // Validations
  const isValidStep1 = title.trim().length >= 3 && description.trim().length >= 5;
  const isValidStep2 = !!startDate && (type === 'DAILY' || (!!endDate && isAfter(parseISO(endDate), parseISO(startDate))));
  const isValidStep3 = activities.length > 0;

  const nextStep = () => {
    if (step === 1 && !isValidStep1) return;
    if (step === 2 && !isValidStep2) return;
    if (step === 3 && !isValidStep3) return;
    setStep(s => s + 1);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-slate-900 dark:text-white" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Forge Challenge</h1>
            <p className="text-primary font-bold text-[10px] uppercase tracking-widest mt-0.5">Stage {step} of 4</p>
          </div>
          <div className="w-10"></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{step === 4 ? 'Ready for deployment' : 'Construction Status'}</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_15px_rgba(255,106,0,0.3)]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 overflow-y-auto no-scrollbar pb-32">
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Mission Type</h2>
              <p className="text-slate-500 font-medium">Define the core format of your community challenge.</p>
            </div>

            <div className="grid gap-4">
              {[
                { id: 'DAILY', label: 'Daily Grind', desc: 'Goals reset every 24 hours', icon: <Clock size={24} /> },
                { id: 'WEEKLY', label: 'Weekly Sprint', desc: 'Cumulative target over 7 days', icon: <Trophy size={24} /> },
                { id: 'CUMULATIVE', label: 'Epic Milestone', desc: 'Total sum for the entire duration', icon: <Rocket size={24} /> },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setType(t.id as ChallengeType)}
                  className={`p-6 rounded-[32px] border-4 text-left flex items-center gap-5 transition-all active:scale-[0.98] ${
                    type === t.id 
                    ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/20 translate-y-[-4px]' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white hover:border-primary/20'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${type === t.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tight text-xl leading-none">{t.label}</p>
                    <p className={`text-xs font-medium mt-1.5 ${type === t.id ? 'text-white/70' : 'text-slate-500'}`}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] px-2">Challenge Callsign</label>
                <input 
                  type="text" 
                  className="w-full h-20 px-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[32px] font-black text-xl text-slate-900 dark:text-white focus:border-primary/50 outline-none shadow-sm transition-all"
                  placeholder="e.g. Morning Fire"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] px-2">Mission Briefing</label>
                <textarea 
                  className="w-full h-40 p-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[32px] font-medium text-slate-700 dark:text-slate-300 focus:border-primary/50 outline-none resize-none shadow-sm transition-all"
                  placeholder="Why should the tribe join this battle?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Timeline</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Schedule the deployment and conclusion.</p>
            </div>

            <div className="grid gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] px-2">Deployment Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-20 px-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[32px] font-black text-lg outline-none focus:border-primary/50 transition-all text-slate-900 dark:text-white"
                  />
                  <CalendarIcon className="absolute right-8 top-1/2 -translate-y-1/2 text-primary opacity-30" size={24} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] px-2">Conclusion Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full h-20 px-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[32px] font-black text-lg outline-none focus:border-primary/50 transition-all text-slate-900 dark:text-white"
                  />
                  <CalendarIcon className="absolute right-8 top-1/2 -translate-y-1/2 text-primary opacity-30" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-[40px] p-8 border border-primary/10 flex gap-6">
              <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20">
                <Info size={28} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Intelligence Note</p>
                <p className="text-xs font-medium text-[#a16b45] leading-relaxed">
                  Daily challenges are best for building habits. Cumulative challenges are great for monthly goals like "100km total".
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Directives</h2>
              <p className="text-slate-500 font-medium">Select the exercises and set the targets.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search exercise catalog..."
                className="w-full h-18 pl-14 pr-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[28px] font-medium outline-none focus:border-primary/50 shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery && (
              <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl max-h-72 overflow-y-auto no-scrollbar ring-8 ring-slate-900/5">
                {loadingCatalog ? (
                  <div className="p-8 text-center text-primary font-black uppercase tracking-widest text-xs animate-pulse">Scanning Catalog...</div>
                ) : filteredCatalog?.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No records found</div>
                ) : (
                  filteredCatalog?.map(ex => (
                    <button 
                      key={ex.id} 
                      onClick={() => addActivity(ex)}
                      className="w-full px-8 py-5 flex items-center justify-between hover:bg-primary/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
                          <Dumbbell size={22} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight">{ex.name}</span>
                          <span className="text-[10px] font-black text-[#a16b45] uppercase tracking-widest">{ex.category}</span>
                        </div>
                      </div>
                      <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Plus size={20} strokeWidth={3} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="space-y-6">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Active Targets ({activities.length})</label>
              {activities.length === 0 ? (
                <div className="h-56 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[48px] flex flex-col items-center justify-center text-slate-400 gap-4 group">
                  <div className="size-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layout size={32} strokeWidth={1} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Deploy your first directive</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {activities.map((act) => (
                    <div key={act.exerciseId} className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Target size={24} />
                          </div>
                          <p className="font-black text-slate-900 dark:text-white uppercase text-base tracking-tight">{act.exerciseName}</p>
                        </div>
                        <button onClick={() => removeActivity(act.exerciseId)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                          <X size={24} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-5">
                        <div className="flex-1 relative">
                          <input 
                            type="number" 
                            className="w-full h-16 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 text-2xl font-black text-primary focus:border-primary outline-none transition-all"
                            value={act.targetValue}
                            onChange={e => updateTarget(act.exerciseId, parseInt(e.target.value) || 0)}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.metricUnit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Review & Deploy</h2>
              <p className="text-slate-500 font-medium">Verify mission details before community-wide launch.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[56px] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5">
              <div className="h-64 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" className="size-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="space-y-2">
                    <span className="bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/20">{type} MISSION</span>
                    <h3 className="text-3xl font-black text-white leading-tight tracking-tight">{title || 'Awaiting Callsign...'}</h3>
                  </div>
                </div>
              </div>
              <div className="p-10 space-y-12">
                <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">Window Opens</p>
                     <p className="font-black text-slate-900 dark:text-white text-lg">{startDate}</p>
                   </div>
                   <div className="w-px h-10 bg-slate-200 dark:bg-white/10"></div>
                   <div className="space-y-1 text-right">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">Window Closes</p>
                     <p className="font-black text-slate-900 dark:text-white text-lg">{endDate || 'Ongoing'}</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Operational Directives</p>
                  <div className="grid gap-3">
                    {activities.map(act => (
                      <div key={act.exerciseId} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="size-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                             <Dumbbell size={22} />
                          </div>
                          <span className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight">{act.exerciseName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-black text-xl leading-none">{act.targetValue}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">{act.metricUnit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 px-2">
                  <p className="text-xs font-medium text-[#a16b45] leading-relaxed italic opacity-80">
                    "{description || 'No briefing provided.'}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Nav Actions */}
      <footer className="p-6 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-white/5 flex gap-4 sticky bottom-0 z-50">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="flex-1 h-20 rounded-[32px] border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-500 dark:text-white font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm"
          >
            Previous
          </button>
        )}
        <button 
          onClick={() => step < 4 ? nextStep() : createMutation.mutate()}
          disabled={
            (step === 1 && !isValidStep1) || 
            (step === 2 && !isValidStep2) || 
            (step === 3 && !isValidStep3) ||
            createMutation.isPending
          }
          className={`flex-[2] h-20 bg-primary text-white rounded-[32px] font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale`}
        >
          {step === 4 ? (
            <>{createMutation.isPending ? 'Syncing...' : 'Initiate Launch'} <Rocket size={24} className="fill-white" /></>
          ) : (
            <>Advance Phase <ChevronRight size={24} strokeWidth={3} /></>
          )}
        </button>
      </footer>
    </div>
  );
};

export default CreateChallengeWizard;