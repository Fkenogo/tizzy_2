import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDoc, GroupDoc } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports as they are reported missing from 'firebase/firestore'
import { collection, addDoc, serverTimestamp } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { ChevronLeft, Camera, Shield, Users, Trophy, Info, Rocket, X, Check } from 'lucide-react';

interface CreateGroupScreenProps {
  user: UserDoc | null;
}

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Rules State
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowMemberChallenges, setAllowMemberChallenges] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newGroup: Omit<GroupDoc, 'id'> = {
        name: name.trim(),
        description: desc.trim(),
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
        createdBy: user.uid,
        createdAt: serverTimestamp() as any,
        members: [user.uid],
        admins: [user.uid],
        rules: {
          visibility: isPrivate ? "private" : "invite-only",
          allowMemberChallenges,
          requireChallengeApproval: requireApproval
        },
        inviteCode,
        inviteLink: `/join/${inviteCode}`,
        lastActivityAt: serverTimestamp() as any,
        status: "active"
      };
      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      return docRef.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      if (id) navigate(`/groups/${id}`);
    }
  });

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display overflow-x-hidden">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-[#ead9cd] dark:border-white/5 px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white active:scale-90 transition-transform shadow-sm"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-[0.2em] text-primary uppercase">Start a Tribe</h1>
            <p className="text-[#a16b45] font-bold text-[10px] uppercase mt-0.5">Community Creation</p>
          </div>
          <button className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 text-[#a16b45] active:scale-90 transition-transform shadow-sm">
            <Info size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-40">
        <div className="max-w-xl mx-auto px-6 py-8 space-y-12">
          
          {/* Section 1: Identity */}
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Define Your <span className="text-primary italic">Vibe.</span>
              </h2>
              <p className="text-slate-500 font-medium text-sm">Every great movement starts with a name and a vision.</p>
            </div>

            {/* Image Picker */}
            <div className="relative group" onClick={handleImageClick}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <div className="w-full aspect-video rounded-[48px] border-4 border-dashed border-primary/20 bg-primary/5 dark:bg-primary/10 flex flex-col items-center justify-center gap-4 overflow-hidden group-active:scale-[0.98] transition-all cursor-pointer relative shadow-inner">
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      className="absolute inset-0 size-full object-cover" 
                      alt="Preview" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white text-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        Change Photo
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="size-16 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Camera size={32} strokeWidth={3} />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-sm font-black text-primary uppercase tracking-widest">Upload Cover Photo</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Tap to browse gallery</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] px-2 block">Tribe Callsign</label>
                <input
                  className="w-full h-20 px-8 bg-white dark:bg-slate-800 border-2 border-[#fef0e4] dark:border-white/5 rounded-[32px] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-xl text-slate-900 dark:text-white placeholder:text-slate-300"
                  placeholder="e.g. Iron Elite"
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] px-2 block">The Mission</label>
                <textarea
                  className="w-full min-h-[160px] p-8 bg-white dark:bg-slate-800 border-2 border-[#fef0e4] dark:border-white/5 rounded-[32px] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-300 leading-relaxed text-base"
                  placeholder="Describe your community goals and rules..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Section 2: Access Control */}
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
             <div className="flex items-center gap-3 px-1">
               <div className="size-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                 <Shield size={20} strokeWidth={3} />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Security & Governance</h3>
             </div>

             <div className="bg-white dark:bg-slate-800 rounded-[48px] p-4 border-2 border-[#fef0e4] dark:border-white/5 shadow-sm space-y-2">
                {[
                  { 
                    id: 'private', 
                    label: 'Invite Only', 
                    desc: 'Hide from search results', 
                    icon: <Shield size={22} />, 
                    state: isPrivate, 
                    setter: setIsPrivate 
                  },
                  { 
                    id: 'memberChallenges', 
                    label: 'Decentralized Challenges', 
                    desc: 'Let members start events', 
                    icon: <Trophy size={22} />, 
                    state: allowMemberChallenges, 
                    setter: setAllowMemberChallenges 
                  },
                  { 
                    id: 'approval', 
                    label: 'Entry Gatekeeper', 
                    desc: 'Admins review all join requests', 
                    icon: <Users size={22} />, 
                    state: requireApproval, 
                    setter: setRequireApproval 
                  },
                ].map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => item.setter(!item.state)}
                    className="flex items-center justify-between p-6 rounded-[32px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`size-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${item.state ? 'bg-primary text-white scale-105' : 'bg-slate-50 dark:bg-white/5 text-slate-400 opacity-60'}`}>
                        {item.icon}
                      </div>
                      <div className="space-y-0.5 text-left">
                        <p className={`font-black uppercase text-sm tracking-tight transition-colors ${item.state ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className={`size-8 rounded-xl flex items-center justify-center border-2 transition-all ${item.state ? 'bg-primary border-primary text-white' : 'border-slate-100 dark:border-white/10 text-transparent'}`}>
                       <Check size={18} strokeWidth={4} />
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Tips Card */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-[40px] p-8 border border-primary/10 flex gap-6 items-center">
             <div className="size-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary shadow-xl shrink-0">
               <Info size={28} />
             </div>
             <div className="space-y-1">
               <p className="font-black text-primary uppercase text-xs tracking-widest">Senior Lead Tip</p>
               <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                 Tribes with specific focus (e.g. "Morning Cardio") grow 3x faster than generic ones. Be specific!
               </p>
             </div>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-slate-900/95 border-t border-[#ead9cd] dark:border-white/5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div className="max-w-xl mx-auto w-full">
          <button
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale group"
          >
            {createMutation.isPending ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="uppercase tracking-widest text-sm">Deploying Tribe...</span>
              </>
            ) : (
              <>
                <span>Establish Tribe</span>
                <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateGroupScreen;