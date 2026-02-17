import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, serverTimestamp, Timestamp } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { ChallengeType, ChallengeActivity, UserDoc, MetricUnit } from '../../types';
import {
  ArrowLeft,
  ImagePlus,
  Users,
  Trophy,
  Zap,
  Calendar,
  X,
  PlusCircle,
  HandHelping,
  Rocket
} from 'lucide-react';
import { differenceInCalendarDays, isAfter, parseISO } from 'date-fns';

interface CreateChallengeFormProps {
  user: UserDoc | null;
  onSuccess?: () => void;
}

type FormChallengeType = 'COLLECTIVE' | 'COMPETITIVE' | 'STREAK';

interface ActivityRow {
  id: string;
  name: string;
  targetMetric: string;
}

const typeMap: Record<FormChallengeType, ChallengeType> = {
  COLLECTIVE: 'CUMULATIVE',
  COMPETITIVE: 'WEEKLY',
  STREAK: 'DAILY',
};

const typeOptions: Array<{ id: FormChallengeType; label: string; icon: React.ReactNode }> = [
  { id: 'COLLECTIVE', label: 'COLLECTIVE', icon: <Users size={16} /> },
  { id: 'COMPETITIVE', label: 'COMPETITIVE', icon: <Trophy size={16} /> },
  { id: 'STREAK', label: 'STREAK', icon: <Zap size={16} /> },
];

const parseTargetMetric = (raw: string): { targetValue: number; metricUnit: MetricUnit } => {
  const trimmed = raw.trim();
  const numberMatch = trimmed.match(/\d+(?:\.\d+)?/);
  const targetValue = numberMatch ? Math.max(0, Math.round(Number(numberMatch[0]))) : 0;
  const unitText = trimmed
    .replace(/\d+(?:\.\d+)?/, '')
    .trim()
    .toLowerCase();

  if (unitText.includes('sec')) return { targetValue, metricUnit: 'seconds' };
  if (unitText.includes('min')) return { targetValue, metricUnit: 'minutes' };
  if (unitText.includes('hour')) return { targetValue, metricUnit: 'hours' };
  if (unitText.includes('km')) return { targetValue, metricUnit: 'km' };
  if (unitText.includes('step')) return { targetValue, metricUnit: 'steps' };
  if (unitText.includes('set')) return { targetValue, metricUnit: 'sets' };

  return { targetValue, metricUnit: 'reps' };
};

const makeExerciseId = (name: string, index: number): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return `${slug || 'activity'}-${index + 1}`;
};

const CreateChallengeForm: React.FC<CreateChallengeFormProps> = ({ user, onSuccess }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState<FormChallengeType>('COLLECTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState<ActivityRow[]>([{ id: crypto.randomUUID(), name: '', targetMetric: '' }]);
  const [socialGoodEnabled, setSocialGoodEnabled] = useState(true);
  const [causeDescription, setCauseDescription] = useState('');
  const [targetDonation, setTargetDonation] = useState('');

  const totalDurationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isAfter(start, end)) return 0;
    return differenceInCalendarDays(end, start) + 1;
  }, [startDate, endDate]);

  const addActivityRow = () => {
    setActivities((prev) => [...prev, { id: crypto.randomUUID(), name: '', targetMetric: '' }]);
  };

  const removeActivityRow = (id: string) => {
    setActivities((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
  };

  const updateActivity = (id: string, patch: Partial<ActivityRow>) => {
    setActivities((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const parsedActivities: ChallengeActivity[] = useMemo(() => {
    return activities
      .filter((row) => row.name.trim().length > 0 && row.targetMetric.trim().length > 0)
      .map((row, index) => {
        const { targetValue, metricUnit } = parseTargetMetric(row.targetMetric);
        return {
          activityId: `${makeExerciseId(row.name, index)}_${index}`,
          order: index + 1,
          exerciseId: makeExerciseId(row.name, index),
          exerciseName: row.name.trim(),
          tier_1: 'General',
          tier_2: 'General',
          metricUnit,
          targetValue,
        };
      });
  }, [activities]);

  const isValid =
    title.trim().length >= 3 &&
    description.trim().length >= 5 &&
    !!startDate &&
    !!endDate &&
    !isAfter(parseISO(startDate), parseISO(endDate)) &&
    parsedActivities.length === activities.length;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId) return;

      const challengeData = {
        groupId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        type: typeMap[formType],
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl || undefined,
        startDate: Timestamp.fromDate(parseISO(startDate)),
        endDate: Timestamp.fromDate(parseISO(endDate)),
        participants: [user.uid],
        challengeAdmins: [user.uid],
        activities: parsedActivities,
        socialGood: socialGoodEnabled
          ? {
              enabled: true,
              causeDescription: causeDescription.trim() || undefined,
              targetAmount: targetDonation ? Number(targetDonation.replace(/[^\d.]/g, '')) || 0 : undefined,
            }
          : { enabled: false },
      };

      const docRef = await addDoc(collection(db, 'challenges'), challengeData);
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', groupId] });
      onSuccess?.();
      navigate(`/groups/${groupId}`);
    },
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28 font-display">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-[#e8e4df] dark:border-white/10">
        <div className="h-16 flex items-center justify-between px-1">
          <button onClick={() => navigate(-1)} className="p-2 text-primary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">New Challenge</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="pt-4 space-y-4">
        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4">
          <div className="border border-dashed border-[#f1cda7] rounded-xl p-6 text-center min-h-[290px] flex flex-col items-center justify-center gap-4">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Challenge cover" className="w-full h-28 object-cover rounded-lg border border-[#eadfd2]" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ImagePlus size={24} />
              </div>
            )}

            <div>
              <p className="text-[34px] leading-none font-black text-slate-900 dark:text-white">Upload Challenge Cover</p>
              <p className="mt-2 text-lg text-[#8f7f72]">Make your challenge stand out with a great image</p>
            </div>

            <label className="mt-2 bg-primary text-white rounded-xl px-7 py-3 text-lg font-black cursor-pointer shadow-[0_8px_18px_rgba(238,123,23,0.25)]">
              Choose Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCoverImageUrl(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>
        </section>

        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4 space-y-2">
          <label className="text-sm font-black uppercase tracking-wide text-primary">Challenge Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 30 Day Summer Shred"
            className="w-full h-14 px-4 rounded-xl bg-[#eceae8] dark:bg-[#3a2a1f] border border-transparent outline-none text-base text-slate-900 dark:text-white placeholder:text-[#a9a09a]"
          />
        </section>

        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4 space-y-2">
          <label className="text-sm font-black uppercase tracking-wide text-primary">Challenge Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the goals, rules, and motivation for this challenge..."
            className="w-full h-32 p-4 rounded-xl bg-[#eceae8] dark:bg-[#3a2a1f] border border-transparent outline-none resize-none text-base text-slate-900 dark:text-white placeholder:text-[#a9a09a]"
          />
        </section>

        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4 space-y-3">
          <label className="text-sm font-black uppercase tracking-wide text-primary">Challenge Type</label>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map((option) => {
              const selected = formType === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setFormType(option.id)}
                  className={`h-20 rounded-xl border text-[11px] font-black tracking-wide flex flex-col items-center justify-center gap-1 ${
                    selected
                      ? 'border-primary bg-[#fff3e8] text-primary'
                      : 'border-[#e6e2de] dark:border-white/10 bg-[#eceae8] dark:bg-[#3a2a1f] text-[#95908b]'
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">Start Date</p>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#eceae8] dark:bg-[#3a2a1f] border border-transparent outline-none text-sm dark:text-white"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">End Date</p>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#eceae8] dark:bg-[#3a2a1f] border border-transparent outline-none text-sm dark:text-white"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              </div>
            </div>
          </div>

          <div className="h-12 bg-[#efeae4] dark:bg-[#3a2a1f] border border-[#eadfd2] dark:border-white/10 rounded-xl px-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Calendar size={14} className="text-primary" />
            <span>
              Total Duration: <span className="text-primary font-black">{totalDurationDays} Days</span>
            </span>
          </div>
        </section>

        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-black uppercase tracking-wide text-primary">Activities & Goals</p>

          {activities.map((activity, index) => (
            <div key={activity.id} className="relative bg-[#eceae8] dark:bg-[#3a2a1f] border border-[#e4dfd9] dark:border-white/10 rounded-xl p-3">
              {activities.length > 1 && (
                <button
                  onClick={() => removeActivityRow(activity.id)}
                  className="absolute right-2 -top-2 w-6 h-6 rounded-full bg-[#d9d4ce] text-slate-700 flex items-center justify-center"
                  aria-label={`Remove activity ${index + 1}`}
                >
                  <X size={14} />
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wide text-[#7e7770]">Activity Name</p>
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(e) => updateActivity(activity.id, { name: e.target.value })}
                    placeholder="e.g. Pushups"
                    className="w-full h-10 px-3 rounded-lg bg-[#f5f3f1] dark:bg-[#4b382b] border border-transparent outline-none text-sm dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wide text-[#7e7770]">Target Metric</p>
                  <input
                    type="text"
                    value={activity.targetMetric}
                    onChange={(e) => updateActivity(activity.id, { targetMetric: e.target.value })}
                    placeholder="e.g. 50 Reps"
                    className="w-full h-10 px-3 rounded-lg bg-[#f5f3f1] dark:bg-[#4b382b] border border-transparent outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addActivityRow}
            className="w-full h-14 border border-dashed border-[#f1cda7] rounded-xl flex items-center justify-center gap-2 text-primary font-black"
          >
            <PlusCircle size={16} />
            Add Another Activity
          </button>
        </section>

        <section className="bg-[#f3f1ee] dark:bg-[#2d1f15] border border-[#eadfd2] dark:border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandHelping size={18} className="text-primary" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Support a Cause</h3>
            </div>
            <button
              onClick={() => setSocialGoodEnabled((v) => !v)}
              className={`w-12 h-7 rounded-full px-1 flex items-center ${socialGoodEnabled ? 'bg-primary justify-end' : 'bg-[#d5cec7] justify-start'}`}
              aria-label="Toggle support a cause"
            >
              <span className="w-5 h-5 rounded-full bg-white" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wide text-primary">Cause Description</label>
            <input
              type="text"
              value={causeDescription}
              onChange={(e) => setCauseDescription(e.target.value)}
              placeholder="e.g. Tree Planting Initiative"
              className="w-full h-12 px-3 rounded-xl bg-[#eceae8] dark:bg-[#3a2a1f] border border-transparent outline-none text-sm dark:text-white"
              disabled={!socialGoodEnabled}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wide text-primary">Target Total Donation ($)</label>
            <input
              type="text"
              value={targetDonation}
              onChange={(e) => setTargetDonation(e.target.value)}
              placeholder="$ 1000"
              className="w-full h-12 px-3 rounded-xl bg-[#eceae8] dark:bg-[#3a2a1f] border border-transparent outline-none text-sm dark:text-white"
              disabled={!socialGoodEnabled}
            />
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-[#eadfd2] dark:border-white/10 p-3 safe-area-bottom">
        <div className="mobile-container">
          <button
            onClick={() => createMutation.mutate()}
            disabled={!isValid || createMutation.isPending}
            className={`w-full h-14 rounded-xl text-white text-lg font-black flex items-center justify-center gap-2 ${
              isValid ? 'bg-primary' : 'bg-[#d7cfc7]'
            }`}
          >
            {createMutation.isPending ? (
              'Launching...'
            ) : (
              <>
                <span>Launch Challenge</span>
                <Rocket size={18} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateChallengeForm;
