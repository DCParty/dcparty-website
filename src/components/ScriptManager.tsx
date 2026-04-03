'use client';

import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Plus, Trash2, Video, FileText, CheckCircle, Cpu, Save, Clock,
  X, Image as ImageIcon, MessageSquare, Check, XCircle, Eye, EyeOff,
  Type, ArrowUp, ArrowDown, DollarSign, Copy, GitBranch, Clapperboard,
  FolderPlus, Link as LinkIcon, Download, Sparkles, Code,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shot {
  id: string;
  shotCode: string;
  isAlternative: boolean;
  linkedAudio: boolean;
  duration: number;
  image: string | null;
  shotSize: string;
  cameraMovement: string;
  transition: string;
  visual: string;
  onScreenText: string;
  prompt: string;
  aiTool: string;
  vo: string;
  audio: string;
  clientFeedback: string;
  approvalStatus: string;
}

interface Scene {
  id: string;
  name: string;
  shots: Shot[];
}

interface AiTool {
  id: string;
  name: string;
  cost: number;
}

interface Project {
  id: string;
  name: string;
  clientName: string;
  platform: string;
  format: string;
  duration: number;
  videoType: string;
  status: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const shotSizes = ['大特寫 (ECU)', '特寫 (CU)', '中景 (MS)', '全身 (FS)', '過肩鏡頭 (OTS)', '空拍 (Aerial)'];
const cameraMoves = ['固定鏡頭 (Static)', '緩慢推進 (Zoom In)', '緩慢拉出 (Zoom Out)', '平移 (Pan)', '跟拍 (Tracking)', '手持晃動 (Handheld)'];
const transitions = ['硬切 (Cut)', '淡入淡出 (Dissolve)', '動態模糊 (Motion Blur)', '遮罩轉場 (Mask)', '黑畫面 (Fade to Black)'];

const DEFAULT_AI_TOOLS: AiTool[] = [
  { id: 't0', name: '無 (真人拍攝)', cost: 0 },
  { id: 't1', name: 'Seedance 2.0', cost: 1.0 },
  { id: 't2', name: 'Kling 2.0', cost: 0.8 },
  { id: 't3', name: 'Kling 3.0 (高畫質)', cost: 1.2 },
  { id: 't4', name: 'Runway Gen-4', cost: 1.5 },
  { id: 't5', name: 'HeyGen', cost: 2.0 },
  { id: 't6', name: 'Midjourney v6.1', cost: 0.5 },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  projectData?: Project;
}

const ScriptManager = ({ projectId, projectData }: Props) => {
  const [roleView, setRoleView] = useState<'internal' | 'client'>('internal');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [project, setProject] = useState<Project>(
    projectData ?? {
      id: projectId,
      name: '載入中...',
      clientName: '',
      platform: '',
      format: '',
      duration: 15,
      videoType: '',
      status: '草稿中',
    }
  );

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showAiImportModal, setShowAiImportModal] = useState(false);
  const [scriptJsonInput, setScriptJsonInput] = useState('');
  const [aiToolsConfig, setAiToolsConfig] = useState<AiTool[]>(DEFAULT_AI_TOOLS);

  // ── Load shots from API ──────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/shots`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setScenes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load shots', err);
        setLoading(false);
      });
  }, [projectId]);

  // ── Debounced PATCH ──────────────────────────────────────────────────────

  const debouncedPatch = useDebouncedCallback(
    async (shotId: string, field: string, value: unknown) => {
      try {
        await fetch(`/api/shots/${shotId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value }),
        });
      } catch (err) {
        console.error('PATCH failed', err);
      }
    },
    500
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProject({ ...project, [e.target.name]: e.target.value });

  const handleSceneNameChange = (sceneId: string, newName: string) => {
    setScenes(scenes.map(s => s.id === sceneId ? { ...s, name: newName } : s));
    // Sync all shots in this scene
    const scene = scenes.find(s => s.id === sceneId);
    scene?.shots.forEach(shot => {
      debouncedPatch(shot.id, 'scene_name', newName);
    });
  };

  const handleShotChange = (sceneId: string, shotId: string, field: string, value: unknown) => {
    setScenes(prev => prev.map(s =>
      s.id !== sceneId ? s : {
        ...s,
        shots: s.shots.map(sh => sh.id === shotId ? { ...sh, [field]: value } : sh),
      }
    ));
    debouncedPatch(shotId, field, value);
  };

  // Cloudinary direct upload
  const handleImageUpload = async (
    sceneId: string,
    shotId: string,
    event: React.ChangeEvent<HTMLInputElement> | null
  ) => {
    if (!event) {
      handleShotChange(sceneId, shotId, 'image', null);
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    handleShotChange(sceneId, shotId, 'image', localUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', 'scriptmanager/shots');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      ).then(r => r.json());
      handleShotChange(sceneId, shotId, 'image', res.secure_url);
    } catch (err) {
      console.error('Cloudinary upload failed', err);
    } finally {
      URL.revokeObjectURL(localUrl);
    }
  };

  const downloadAllImages = () => {
    const allImages = scenes.flatMap(s =>
      s.shots
        .filter(shot => shot.image)
        .map(shot => ({
          url: shot.image!,
          filename: `${s.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')}_Shot${shot.shotCode}.jpg`,
        }))
    );
    if (allImages.length === 0) {
      alert('目前系統中沒有任何參考圖片可供下載。');
      return;
    }
    alert(`即將為您下載 ${allImages.length} 張參考圖片...\n（瀏覽器可能會詢問是否允許下載多個檔案，請選擇允許）`);
    allImages.forEach((img, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.url;
        a.download = img.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 300);
    });
  };

  const addScene = async () => {
    const sceneIndex = scenes.length;
    const tempId = `scene-${sceneIndex}`;
    setScenes(prev => [...prev, { id: tempId, name: '', shots: [] }]);
  };

  const removeScene = (sceneId: string) => {
    if (!window.confirm('確定要刪除整個場景及其包含的所有分鏡嗎？')) return;
    const scene = scenes.find(s => s.id === sceneId);
    // Archive all shots in scene
    scene?.shots.forEach(shot => {
      fetch(`/api/shots/${shot.id}`, { method: 'DELETE' }).catch(console.error);
    });
    setScenes(scenes.filter(s => s.id !== sceneId));
  };

  const getNextShotIndex = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    return scene ? scene.shots.length : 0;
  };

  const addShotToScene = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const sceneIndex = scenes.findIndex(s => s.id === sceneId);
    const shotIndex = getNextShotIndex(sceneId);

    const tempShot: Shot = {
      id: 'temp-' + Date.now(),
      shotCode: String(shotIndex + 1),
      isAlternative: false,
      linkedAudio: false,
      duration: 3,
      image: null,
      shotSize: '中景 (MS)',
      cameraMovement: '固定鏡頭 (Static)',
      transition: '硬切 (Cut)',
      visual: '',
      onScreenText: '',
      prompt: '',
      aiTool: 'Seedance 2.0',
      vo: '',
      audio: '',
      clientFeedback: '',
      approvalStatus: 'pending',
    };

    setScenes(prev => prev.map(s =>
      s.id === sceneId ? { ...s, shots: [...s.shots, tempShot] } : s
    ));

    try {
      const res = await fetch('/api/shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sceneIndex,
          sceneName: scene.name,
          shotIndex,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setScenes(prev => prev.map(s =>
          s.id === sceneId
            ? { ...s, shots: s.shots.map(sh => sh.id === tempShot.id ? { ...sh, id: data.id } : sh) }
            : s
        ));
      }
    } catch (err) {
      console.error('Failed to create shot', err);
    }
  };

  const duplicateShot = (sceneId: string, shotIndex: number) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        const shotToCopy = scene.shots[shotIndex];
        let newShotCode = shotToCopy.shotCode;
        if (!newShotCode.includes('A') && !newShotCode.includes('B') && !newShotCode.includes('C')) {
          const newShots = [...scene.shots];
          newShots[shotIndex] = { ...newShots[shotIndex], shotCode: newShotCode + 'A' };
          newShotCode = newShotCode + 'B';
          const newShot: Shot = {
            ...shotToCopy,
            id: 'temp-' + Date.now(),
            shotCode: newShotCode,
            isAlternative: true,
            approvalStatus: 'pending',
            clientFeedback: '',
          };
          newShots.splice(shotIndex + 1, 0, newShot);
          return { ...scene, shots: newShots };
        } else {
          newShotCode = newShotCode + ' (備案)';
          const newShot: Shot = {
            ...shotToCopy,
            id: 'temp-' + Date.now(),
            shotCode: newShotCode,
            isAlternative: true,
            approvalStatus: 'pending',
            clientFeedback: '',
          };
          const newShots = [...scene.shots];
          newShots.splice(shotIndex + 1, 0, newShot);
          return { ...scene, shots: newShots };
        }
      }
      return scene;
    }));
  };

  const removeShot = async (sceneId: string, shotId: string) => {
    setScenes(scenes.map(scene =>
      scene.id === sceneId ? { ...scene, shots: scene.shots.filter(s => s.id !== shotId) } : scene
    ));
    if (!shotId.startsWith('temp-')) {
      await fetch(`/api/shots/${shotId}`, { method: 'DELETE' }).catch(console.error);
    }
  };

  const moveScene = (index: number, direction: 'up' | 'down') => {
    const newScenes = [...scenes];
    if (direction === 'up' && index > 0)
      [newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]];
    else if (direction === 'down' && index < scenes.length - 1)
      [newScenes[index + 1], newScenes[index]] = [newScenes[index], newScenes[index + 1]];
    setScenes(newScenes);
  };

  const moveShot = (sceneId: string, index: number, direction: 'up' | 'down') => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        const newShots = [...scene.shots];
        if (direction === 'up' && index > 0)
          [newShots[index - 1], newShots[index]] = [newShots[index], newShots[index - 1]];
        else if (direction === 'down' && index < scene.shots.length - 1)
          [newShots[index + 1], newShots[index]] = [newShots[index], newShots[index + 1]];
        return { ...scene, shots: newShots };
      }
      return scene;
    }));
  };

  // Force save all shot indices to Notion
  const forceSaveAll = async () => {
    setSaving(true);
    try {
      for (let si = 0; si < scenes.length; si++) {
        const scene = scenes[si];
        for (let shi = 0; shi < scene.shots.length; shi++) {
          const shot = scene.shots[shi];
          if (shot.id.startsWith('temp-')) continue;
          await fetch(`/api/shots/${shot.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'shot_index', value: shi }),
          });
          await fetch(`/api/shots/${shot.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'scene_index', value: si }),
          });
          await fetch(`/api/shots/${shot.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'scene_name', value: scene.name }),
          });
          await new Promise(r => setTimeout(r, 350));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const applyAiScript = async () => {
    let parsedScenes: Scene[];
    try {
      parsedScenes = JSON.parse(scriptJsonInput);
      if (!Array.isArray(parsedScenes)) {
        alert('JSON 格式錯誤：必須是包含場景的 Array。');
        return;
      }
    } catch {
      alert('JSON 解析失敗，請檢查語法。');
      return;
    }

    setScenes(parsedScenes);
    setShowAiImportModal(false);

    // 寫入 Notion（bulk）
    try {
      const res = await fetch('/api/shots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, scenes: parsedScenes }),
      });
      const data = await res.json();
      if (data.ok) {
        // 重新從 Notion 載入以取得真實 ID
        const fresh = await fetch(`/api/projects/${projectId}/shots`).then(r => r.json());
        if (Array.isArray(fresh)) setScenes(fresh);
        alert(`✅ AI 腳本已成功匯入！共 ${data.count} 個分鏡。`);
      } else {
        alert('⚠️ 前端已套用，但寫入 Notion 失敗：' + data.error);
      }
    } catch (err) {
      console.error('bulk import failed', err);
      alert('⚠️ 前端已套用，但 Notion 同步失敗，請按「強制儲存」重試。');
    }
  };

  // ── Computed stats ───────────────────────────────────────────────────────

  const allShots = scenes.flatMap(s => s.shots);
  const activeShots = allShots.filter(shot => !shot.isAlternative);
  const totalDuration = activeShots.reduce((acc, shot) => acc + Number(shot.duration), 0);
  const totalVoLength = activeShots.reduce((acc, shot) => acc + (shot.vo || '').replace(/\s+/g, '').length, 0);
  const maxVoLength = Math.floor((Number(project.duration) || 15) * 2.5);
  const estimatedCost = allShots.reduce((acc, shot) => {
    const tool = aiToolsConfig.find(t => t.name === shot.aiTool);
    const multiplier = tool ? tool.cost : 0;
    return acc + (Math.ceil(shot.duration / 5) * multiplier);
  }, 0);

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-slate-500 text-lg">載入分鏡中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-32 relative">
      {/* 頂部導航列 */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BrandLogo theme="dark" />
            <div className="w-px h-6 bg-slate-700" />
            <h1 className="text-base font-semibold text-slate-300 truncate max-w-xs">{project.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {roleView === 'internal' && (
              <>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold border border-slate-700"
                >
                  <Cpu className="w-4 h-4" /> 工具與成本設定
                </button>
                <button
                  onClick={downloadAllImages}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold border border-slate-700"
                >
                  <Download className="w-4 h-4" /> 批量下載
                </button>
              </>
            )}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-inner">
              <button
                onClick={() => setRoleView('internal')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${roleView === 'internal' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-4 h-4" /> 內部視角
              </button>
              <button
                onClick={() => setRoleView('client')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${roleView === 'client' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <EyeOff className="w-4 h-4" /> 客戶視角
              </button>
            </div>
            <button
              onClick={forceSaveAll}
              disabled={saving}
              className="bg-white text-slate-900 hover:bg-gray-100 px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-bold text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? '儲存中...' : '強制儲存'}
            </button>
          </div>
        </div>
      </header>

      {/* AI 腳本匯入 Modal */}
      {showAiImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI 腳本自動生成 / MCP 對接橋樑
              </h3>
              <button onClick={() => setShowAiImportModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4 shrink-0 flex items-start gap-3">
              <Code className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-purple-900 mb-1">給開發者與 MCP 系統的提示：</p>
                <p className="text-xs text-purple-700">當 Claude 等 AI 代理人接收到策略 (Phase 1) 之後，可以透過 MCP 的 <code>update_script_scenes</code> 工具，將生成的腳本轉換為下方的 JSON 陣列直接推送到資料庫。</p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col mb-4 border border-slate-200 rounded-lg bg-slate-900 shadow-inner">
              <div className="bg-slate-800 text-slate-400 text-xs px-4 py-2 border-b border-slate-700 flex justify-between">
                <span className="font-mono">expected_schema.json (Array of Scenes)</span>
                <button
                  onClick={() => setScriptJsonInput(JSON.stringify(scenes, null, 2))}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  載入目前系統腳本以供參考
                </button>
              </div>
              <textarea
                value={scriptJsonInput}
                onChange={(e) => setScriptJsonInput(e.target.value)}
                className="w-full flex-1 text-sm font-mono p-4 bg-transparent text-emerald-400 outline-none resize-none"
                placeholder={'[\n  {\n    "id": "scene-1",\n    "name": "場景名稱",\n    "shots": []\n  }\n]'}
              />
            </div>
            <div className="shrink-0 flex justify-end gap-3">
              <button onClick={() => setShowAiImportModal(false)} className="px-5 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
              <button onClick={applyAiScript} className="px-6 py-2.5 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-2 shadow-md">
                <Sparkles className="w-4 h-4" /> 套用並渲染 AI 腳本
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定 Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-600" /> AI 工具參數配置</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex justify-between items-end mb-4">
              <p className="text-sm text-gray-500 flex-1 pr-4">隨著 AI 工具更新或定價改變，您可以在此即時調整估價基準。</p>
              <button
                onClick={() => {
                  if (!showJsonMode) setJsonInput(JSON.stringify(aiToolsConfig, null, 2));
                  setShowJsonMode(!showJsonMode);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors shrink-0"
              >
                {showJsonMode ? '切換為介面模式' : '切換為 JSON (供 MCP 使用)'}
              </button>
            </div>
            {showJsonMode ? (
              <div className="mb-4">
                <div className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-t-lg flex justify-between">
                  <span>aiToolsConfig.json</span>
                  <span className="text-amber-400">請確保格式正確</span>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-64 text-xs font-mono p-3 bg-slate-900 text-emerald-400 rounded-b-lg outline-none resize-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto pr-2 mb-4 space-y-2">
                  {aiToolsConfig.map((tool, idx) => (
                    <div key={tool.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                      <input
                        type="text"
                        value={tool.name}
                        onChange={(e) => {
                          const newConfig = [...aiToolsConfig];
                          newConfig[idx].name = e.target.value;
                          setAiToolsConfig(newConfig);
                        }}
                        className="flex-1 text-sm p-1.5 border border-slate-200 rounded outline-none focus:border-blue-400 font-bold text-slate-700"
                      />
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2">
                        <span className="text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          step="0.1"
                          value={tool.cost}
                          onChange={(e) => {
                            const newConfig = [...aiToolsConfig];
                            newConfig[idx].cost = Number(e.target.value);
                            setAiToolsConfig(newConfig);
                          }}
                          className="w-12 text-sm p-1.5 outline-none font-mono text-center text-blue-600 font-bold"
                        />
                        <span className="text-slate-400 text-[10px]">/ 5秒</span>
                      </div>
                      <button onClick={() => setAiToolsConfig(aiToolsConfig.filter(t => t.id !== tool.id))} className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setAiToolsConfig([...aiToolsConfig, { id: 't' + Date.now(), name: '新 AI 工具', cost: 1.0 }])}
                  className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-colors mb-4 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> 新增 AI 工具與報價
                </button>
              </>
            )}
            <button
              onClick={() => {
                if (showJsonMode) {
                  try {
                    const parsed = JSON.parse(jsonInput);
                    setAiToolsConfig(parsed);
                  } catch {
                    alert('JSON 格式錯誤，請檢查後再儲存。');
                    return;
                  }
                }
                setShowSettingsModal(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm"
            >
              儲存並套用設定
            </button>
          </div>
        </div>
      )}

      {/* 視角提示條 */}
      {roleView === 'client' && (
        <div className="bg-emerald-100 border-b border-emerald-200 text-emerald-800 p-2 text-center text-sm font-bold flex justify-center items-center gap-2">
          <CheckCircle className="w-4 h-4" /> 現在是「客戶視角」。AI 製作細節已隱藏，客戶可直接在分鏡留言區給予回饋並點擊審核狀態。
        </div>
      )}

      <main className="max-w-7xl mx-auto mt-6 px-4">
        {/* 專案基本資料 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${roleView === 'client' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">客戶 / 品牌</label>
              <input type="text" name="clientName" value={project.clientName} onChange={handleProjectChange} disabled={roleView === 'client'} className="w-full font-bold text-lg border-b border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">目標長度(秒)</label>
              <input type="number" name="duration" value={project.duration} onChange={handleProjectChange} disabled={roleView === 'client'} className="w-full text-md border-b border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent font-bold disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">輸出格式</label>
              <input type="text" value={project.format} disabled className="w-full text-md border-b border-gray-200 py-1 bg-transparent opacity-70" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">影片類型</label>
              <input type="text" value={project.videoType} disabled className="w-full text-md border-b border-gray-200 py-1 bg-transparent opacity-70" />
            </div>
          </div>
        </div>

        {/* 狀態監控儀表板 */}
        <div className="flex gap-4 mb-6">
          <div className={`flex-1 p-4 rounded-xl border flex items-center gap-4 transition-colors ${totalDuration > project.duration ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <Clock className="w-8 h-8 opacity-70" />
            <div>
              <div className="text-xs font-bold uppercase mb-1 flex items-center gap-2">主線累計時長 <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded">不含備案</span></div>
              <div className="text-2xl font-black">{totalDuration} <span className="text-sm font-normal">/ {project.duration} 秒</span></div>
            </div>
          </div>
          {roleView === 'internal' && (
            <>
              <div className={`flex-1 p-4 rounded-xl border flex items-center gap-4 transition-colors ${totalVoLength > maxVoLength ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                <FileText className="w-8 h-8 opacity-70" />
                <div>
                  <div className="text-xs font-bold uppercase mb-1 flex items-center gap-2">主線旁白字數 <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded">防呆</span></div>
                  <div className="text-2xl font-black">{totalVoLength} <span className="text-sm font-normal">/ {maxVoLength} 字</span></div>
                </div>
              </div>
              <div className="flex-1 p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-800 flex items-center gap-4">
                <DollarSign className="w-8 h-8 opacity-70" />
                <div>
                  <div className="text-xs font-bold uppercase mb-1 flex items-center gap-2">AI 生成預估成本 <span className="text-[10px] bg-blue-200 text-blue-700 px-1.5 rounded">含所有備案</span></div>
                  <div className="text-2xl font-black">~${estimatedCost.toFixed(2)} <span className="text-sm font-normal">USD</span></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI / MCP 匯入按鈕 */}
        {roleView === 'internal' && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowAiImportModal(true)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Sparkles className="w-5 h-5" /> ✨ 透過 AI / MCP 匯入腳本
            </button>
          </div>
        )}

        {/* 場景與分鏡列表 */}
        <div className="space-y-8">
          {scenes.map((scene, sceneIndex) => (
            <div key={scene.id} className="bg-slate-100 rounded-2xl border-2 border-slate-300 shadow-sm relative pt-12 pb-4 px-4">
              {/* 場景 Header */}
              <div className="absolute top-0 left-0 w-full bg-slate-800 text-white rounded-t-xl px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3 w-1/2">
                  <Clapperboard className="w-5 h-5 text-blue-400" />
                  <span className="font-mono text-sm text-slate-400">SCENE {sceneIndex + 1}</span>
                  <input
                    type="text"
                    value={scene.name}
                    onChange={(e) => handleSceneNameChange(scene.id, e.target.value)}
                    disabled={roleView === 'client'}
                    placeholder="輸入場景名稱 (例如：日景 / 咖啡廳)"
                    className="bg-transparent border-b border-transparent focus:border-blue-400 hover:border-slate-600 outline-none font-bold text-lg w-full transition-colors disabled:hover:border-transparent"
                  />
                </div>
                {roleView === 'internal' && (
                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-700 rounded mr-2">
                      <button onClick={() => moveScene(sceneIndex, 'up')} disabled={sceneIndex === 0} className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveScene(sceneIndex, 'down')} disabled={sceneIndex === scenes.length - 1} className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeScene(scene.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                )}
              </div>

              {/* 分鏡列表 */}
              <div className="space-y-4 mt-4 relative">
                {scene.shots.map((shot, shotIndex) => (
                  <div key={shot.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col md:flex-row group transition-all relative ${shot.isAlternative ? 'opacity-95 border-dashed border-slate-300 bg-slate-50/50' : 'border-solid'} ${shot.approvalStatus === 'revise' ? 'border-red-400 shadow-red-100' : shot.approvalStatus === 'approved' ? 'border-emerald-400' : !shot.isAlternative ? 'border-gray-200' : ''}`}>
                    {shot.isAlternative && (
                      <div className="absolute top-0 right-1/2 translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg flex items-center gap-1 z-10 shadow-md">
                        <GitBranch className="w-3 h-3" /> A/B 測試備案 (不計入總時長)
                      </div>
                    )}

                    {/* 左側：編號、時長與參考圖 */}
                    <div className="bg-slate-50 border-r border-gray-200 p-4 md:w-56 flex flex-col shrink-0 relative pt-6">
                      <div className="flex justify-between items-center mb-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-1 w-full">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">SHOT</span>
                          <span className="text-blue-500 font-black">#</span>
                          <input
                            type="text"
                            value={shot.shotCode}
                            onChange={(e) => handleShotChange(scene.id, shot.id, 'shotCode', e.target.value)}
                            disabled={roleView === 'client'}
                            className="text-lg font-black text-slate-800 bg-transparent outline-none w-full"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                          <input
                            type="number"
                            value={shot.duration}
                            onChange={(e) => handleShotChange(scene.id, shot.id, 'duration', Number(e.target.value))}
                            disabled={roleView === 'client'}
                            className="w-8 text-center text-sm font-bold focus:outline-none bg-transparent disabled:opacity-100 text-slate-700"
                          />
                          <span className="text-slate-500 text-xs font-bold">秒</span>
                        </div>
                        {roleView === 'internal' && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded p-0.5">
                            <button onClick={() => moveShot(scene.id, shotIndex, 'up')} disabled={shotIndex === 0} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => moveShot(scene.id, shotIndex, 'down')} disabled={shotIndex === scene.shots.length - 1} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>

                      {shot.image ? (
                        <div className="relative group/img w-full h-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-2">
                          <img src={shot.image} alt="Reference" className="w-full h-full object-cover" />
                          {roleView === 'internal' && (
                            <button onClick={() => handleImageUpload(scene.id, shot.id, null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          )}
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg mb-2 transition-colors ${roleView === 'internal' ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50' : 'opacity-50'}`}>
                          <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500">{roleView === 'internal' ? '上傳參考圖' : '無圖片'}</span>
                          {roleView === 'internal' && (
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(scene.id, shot.id, e)} />
                          )}
                        </label>
                      )}

                      <div className="space-y-2 mt-auto pt-2">
                        <select value={shot.shotSize} onChange={(e) => handleShotChange(scene.id, shot.id, 'shotSize', e.target.value)} disabled={roleView === 'client'} className="w-full text-[11px] bg-white border border-slate-200 rounded p-1 text-slate-600 outline-none disabled:bg-transparent disabled:border-transparent disabled:font-bold disabled:px-0">
                          {shotSizes.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <select value={shot.cameraMovement} onChange={(e) => handleShotChange(scene.id, shot.id, 'cameraMovement', e.target.value)} disabled={roleView === 'client'} className="w-full text-[11px] bg-white border border-slate-200 rounded p-1 text-slate-600 outline-none disabled:bg-transparent disabled:border-transparent disabled:font-bold disabled:px-0">
                          {cameraMoves.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <div className="border-t border-slate-200 pt-2 mt-2">
                          <select value={shot.transition} onChange={(e) => handleShotChange(scene.id, shot.id, 'transition', e.target.value)} disabled={roleView === 'client'} className="w-full text-[11px] bg-slate-100 border border-slate-200 rounded p-1 text-slate-700 outline-none font-medium disabled:bg-transparent disabled:border-transparent disabled:px-0">
                            {transitions.map(s => <option key={s}>轉場: {s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 中間：畫面描述與壓字 */}
                    <div className="p-4 flex-1 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col gap-4 pt-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                          <Video className="w-3 h-3" /> 畫面描述 (Visual)
                        </label>
                        <textarea
                          value={shot.visual}
                          onChange={(e) => handleShotChange(scene.id, shot.id, 'visual', e.target.value)}
                          disabled={roleView === 'client'}
                          className={`w-full text-sm p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-colors ${roleView === 'client' ? 'bg-transparent border-transparent px-0 font-medium text-gray-800' : 'border-gray-200'}`}
                          rows={4}
                          placeholder="具體的場景、動作、演員表現..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                          <Type className="w-3 h-3" /> 畫面壓字 (On-Screen Text)
                        </label>
                        <textarea
                          value={shot.onScreenText}
                          onChange={(e) => handleShotChange(scene.id, shot.id, 'onScreenText', e.target.value)}
                          disabled={roleView === 'client'}
                          className="w-full text-sm p-2 border border-amber-200 bg-amber-50/50 rounded focus:ring-1 focus:ring-amber-500 outline-none resize-none font-bold text-amber-900 disabled:border-transparent disabled:bg-amber-50 disabled:px-2"
                          rows={2}
                          placeholder="例如：限時買一送一..."
                        />
                      </div>
                      {roleView === 'internal' && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-auto">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                              <Cpu className="w-3 h-3" /> AI 製作參數
                            </label>
                            <select
                              value={shot.aiTool}
                              onChange={(e) => handleShotChange(scene.id, shot.id, 'aiTool', e.target.value)}
                              className="text-[10px] bg-white border border-blue-200 text-blue-700 py-1 px-2 rounded font-bold outline-none max-w-[120px] truncate"
                            >
                              {aiToolsConfig.map(tool => <option key={tool.id} value={tool.name}>{tool.name}</option>)}
                            </select>
                          </div>
                          <textarea
                            value={shot.prompt}
                            onChange={(e) => handleShotChange(scene.id, shot.id, 'prompt', e.target.value)}
                            className="w-full text-xs p-2 border border-blue-200 bg-white/80 rounded outline-none font-mono text-slate-600"
                            rows={2}
                            placeholder="AI Prompt 或 製作備註..."
                          />
                        </div>
                      )}
                    </div>

                    {/* 右側：聲音與審核 */}
                    <div className="p-4 md:w-1/3 flex flex-col relative bg-slate-50/30 pt-6">
                      {roleView === 'internal' && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded-lg p-1 z-20">
                          <button
                            onClick={() => handleShotChange(scene.id, shot.id, 'isAlternative', !shot.isAlternative)}
                            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 ${shot.isAlternative ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                          >
                            <GitBranch className="w-3.5 h-3.5" /> {shot.isAlternative ? '取消備案' : '設為備案'}
                          </button>
                          <div className="w-px bg-slate-200 mx-1"></div>
                          <button onClick={() => duplicateShot(scene.id, shotIndex)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="複製"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => removeShot(scene.id, shot.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" title="刪除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}

                      {shot.linkedAudio ? (
                        <div className="flex-1 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-lg flex flex-col items-center justify-center text-indigo-400 p-4 mb-4 mt-8">
                          <LinkIcon className="w-6 h-6 mb-2 opacity-50" />
                          <span className="text-xs font-bold text-indigo-600">切鏡不切聲</span>
                          <span className="text-[10px] mt-1 text-center font-medium">聲音延續上一分鏡，<br />適合對話群組切換視角</span>
                          {roleView === 'internal' && (
                            <button
                              onClick={() => handleShotChange(scene.id, shot.id, 'linkedAudio', false)}
                              className="mt-3 text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 border bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
                            >
                              <LinkIcon className="w-3 h-3" /> 取消聲音連結
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 mb-4 flex-1 mt-8">
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <label className="text-xs font-bold text-gray-500 uppercase block">旁白 / 對話 (VO)</label>
                              {shotIndex > 0 && roleView === 'internal' && (
                                <button
                                  onClick={() => handleShotChange(scene.id, shot.id, 'linkedAudio', true)}
                                  className="text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                                >
                                  <LinkIcon className="w-3 h-3" /> 連結上一鏡頭聲音
                                </button>
                              )}
                            </div>
                            <textarea
                              value={shot.vo}
                              onChange={(e) => handleShotChange(scene.id, shot.id, 'vo', e.target.value)}
                              disabled={roleView === 'client'}
                              className="w-full text-sm p-2 border border-gray-200 rounded outline-none disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:text-blue-900 disabled:font-bold h-24"
                              placeholder="配音台詞或對話..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">音效/音樂 (SFX/BGM)</label>
                            <input
                              type="text"
                              value={shot.audio}
                              onChange={(e) => handleShotChange(scene.id, shot.id, 'audio', e.target.value)}
                              disabled={roleView === 'client'}
                              className="w-full text-xs p-2 border border-gray-200 rounded outline-none text-slate-500 disabled:bg-transparent disabled:border-transparent disabled:px-0"
                              placeholder="特定音效或環境音..."
                            />
                          </div>
                        </div>
                      )}

                      {/* 客戶審核區塊 */}
                      <div className={`mt-auto rounded-lg p-3 border ${shot.approvalStatus === 'revise' ? 'bg-red-50 border-red-200' : shot.approvalStatus === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase flex items-center gap-1 text-slate-700">
                            <MessageSquare className="w-3 h-3" /> 客戶意見回饋
                          </label>
                          <div className="flex gap-1">
                            {roleView === 'client' ? (
                              <>
                                <button onClick={() => handleShotChange(scene.id, shot.id, 'approvalStatus', 'approved')} className={`p-1 rounded ${shot.approvalStatus === 'approved' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600'}`}><Check className="w-4 h-4" /></button>
                                <button onClick={() => handleShotChange(scene.id, shot.id, 'approvalStatus', 'revise')} className={`p-1 rounded ${shot.approvalStatus === 'revise' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'}`}><XCircle className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${shot.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : shot.approvalStatus === 'revise' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                {shot.approvalStatus === 'approved' ? '✅ 客戶已核准' : shot.approvalStatus === 'revise' ? '⚠️ 需要修改' : '⏳ 待審核'}
                              </span>
                            )}
                          </div>
                        </div>
                        <textarea
                          value={shot.clientFeedback}
                          onChange={(e) => handleShotChange(scene.id, shot.id, 'clientFeedback', e.target.value)}
                          disabled={roleView === 'internal'}
                          className={`w-full text-xs p-2 rounded outline-none resize-none ${roleView === 'internal' ? 'bg-transparent text-slate-600 font-medium' : 'bg-white border border-gray-300 focus:border-blue-400'} ${!shot.clientFeedback && roleView === 'internal' ? 'hidden' : ''}`}
                          rows={roleView === 'internal' ? 1 : 2}
                          placeholder={roleView === 'client' ? '輸入修改意見...' : '客戶尚無留言'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {roleView === 'internal' && (
                <button
                  onClick={() => addShotToScene(scene.id)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 新增分鏡至此場景
                </button>
              )}
            </div>
          ))}
        </div>

        {roleView === 'internal' && (
          <button
            onClick={addScene}
            className="mt-12 w-full py-6 border border-slate-300 bg-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-300 hover:text-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FolderPlus className="w-6 h-6" /> 建立新場景 (New Scene)
          </button>
        )}
      </main>
    </div>
  );
};

export default ScriptManager;
