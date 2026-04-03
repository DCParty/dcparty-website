'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clapperboard, Clock, ChevronRight, Loader2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

interface Project {
  id: string;
  name: string;
  clientName: string;
  platform: string;
  format: string;
  duration: number;
  videoType: string;
  status: string;
  createdTime: string;
}

const STATUS_COLOR: Record<string, string> = {
  '草稿中': 'bg-gray-100 text-gray-600',
  '待客戶審核': 'bg-yellow-100 text-yellow-700',
  '製作中': 'bg-blue-100 text-blue-700',
  '已完成': 'bg-green-100 text-green-700',
};

const PLATFORMS = ['Meta (FB/IG)', 'YouTube', 'TikTok', 'LINE', '其他'];
const FORMATS = ['9:16 直版', '16:9 橫版', '1:1 正方'];

export default function ScriptListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    clientName: '',
    platform: 'Meta (FB/IG)',
    format: '9:16 直版',
    duration: 15,
    videoType: '',
  });

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.id) router.push(`/script/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <BrandLogo theme="dark" />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> 建立新專案
        </button>
      </header>

      {/* 新建 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-5">建立新腳本專案</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">專案名稱 *</label>
                <input
                  autoFocus
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="例如：春季促銷 15s 影片"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">客戶名稱</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  placeholder="例如：Lumina 台灣"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">平台</label>
                  <select
                    value={form.platform}
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">格式</label>
                  <select
                    value={form.format}
                    onChange={e => setForm({ ...form, format: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {FORMATS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">目標長度（秒）</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">影片類型</label>
                <input
                  type="text"
                  value={form.videoType}
                  onChange={e => setForm({ ...form, videoType: e.target.value })}
                  placeholder="例如：對話類型影片 (口播/短劇)"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-slate-400 hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || creating}
                className="flex-1 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                建立並進入編輯
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 內容 */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black mb-1">腳本專案</h1>
          <p className="text-slate-400 text-sm">管理所有廣告腳本與分鏡表</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> 載入中...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-2xl">
            <Clapperboard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-4">還沒有任何專案</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> 建立第一個專案
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => router.push(`/script/${project.id}`)}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl px-5 py-4 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-slate-800 group-hover:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                  <Clapperboard className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold truncate">{project.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[project.status] || 'bg-gray-100 text-gray-600'}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {project.clientName && <span>{project.clientName}</span>}
                    {project.clientName && <span>·</span>}
                    <span>{project.platform}</span>
                    <span>·</span>
                    <span>{project.format}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{project.duration}s</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
