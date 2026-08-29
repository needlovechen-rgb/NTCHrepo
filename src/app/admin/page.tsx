'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  HelpCircle,
  GitBranch,
  History,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ArrowUpDown,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'questions' | 'rules' | 'audit'>('questions');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [rules, setRules] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 彈窗 State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatKey, setNewCatKey] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionKey, setQuestionKey] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionType, setQuestionType] = useState('dropdown');
  const [questionRequired, setQuestionRequired] = useState(false);
  const [questionDescription, setQuestionDescription] = useState('');
  const [questionOptions, setQuestionOptions] = useState<Array<{ label: string; value: string }>>([
    { label: '', value: '' },
  ]);

  // 選項編輯 State
  const [newOptLabel, setNewOptLabel] = useState('');
  const [newOptValue, setNewOptValue] = useState('');

  // 條件規則彈窗 State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleSourceQId, setRuleSourceQId] = useState('');
  const [ruleOperator, setRuleOperator] = useState('equals');
  const [ruleSourceVal, setRuleSourceVal] = useState('');
  const [ruleAction, setRuleAction] = useState('hide');
  const [ruleTargetQIds, setRuleTargetQIds] = useState<string[]>([]);

  // 載入資料
  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await fetch('/api/admin/categories');
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.categories);
        if (!selectedCatId && catData.categories.length > 0) {
          setSelectedCatId(catData.categories[0].id);
        }
      }

      const ruleRes = await fetch('/api/admin/rules');
      const ruleData = await ruleRes.json();
      if (ruleData.success) setRules(ruleData.rules);

      const auditRes = await fetch('/api/admin/audit-logs');
      const auditData = await auditRes.json();
      if (auditData.success) setAuditLogs(auditData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 新增分類
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatKey || !newCatName) return;

    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: newCatKey, name: newCatName }),
    });
    const data = await res.json();
    if (data.success) {
      setIsCatModalOpen(false);
      setNewCatKey('');
      setNewCatName('');
      loadData();
    } else {
      alert(data.error);
    }
  };

  // 切換分類啟用
  const handleToggleCategory = async (id: string, enabled: boolean) => {
    await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    });
    loadData();
  };

  // 開啟建立題目 Modal
  const openCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionKey('');
    setQuestionTitle('');
    setQuestionType('dropdown');
    setQuestionRequired(false);
    setQuestionDescription('');
    setQuestionOptions([{ label: '', value: '' }]);
    setIsQuestionModalOpen(true);
  };

  // 開啟編輯題目 Modal (版本升版)
  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    const activeVer = q.versions?.[0];
    setQuestionKey(q.key);
    setQuestionTitle(activeVer?.title || q.key);
    setQuestionType(q.type);
    setQuestionRequired(activeVer?.required ?? q.required);
    setQuestionDescription(activeVer?.description || '');
    setIsQuestionModalOpen(true);
  };

  // 儲存題目 (新建或版本升版)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle) return;

    if (editingQuestion) {
      // 升版更新
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuestion.id,
          title: questionTitle,
          description: questionDescription,
          type: questionType,
          required: questionRequired,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsQuestionModalOpen(false);
        loadData();
      } else {
        alert(data.error);
      }
    } else {
      // 新建
      if (!questionKey) return;
      const validOptions = questionOptions.filter((o) => o.label && o.value);
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCatId,
          key: questionKey,
          title: questionTitle,
          type: questionType,
          required: questionRequired,
          description: questionDescription,
          options: validOptions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsQuestionModalOpen(false);
        loadData();
      } else {
        alert(data.error);
      }
    }
  };

  // 切換題目啟用狀態 (Soft Delete)
  const handleToggleQuestion = async (id: string, enabled: boolean) => {
    await fetch('/api/admin/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'TOGGLE_ENABLED', enabled }),
    });
    loadData();
  };

  // 為題目新增選項
  const handleAddOption = async (questionId: string) => {
    if (!newOptLabel || !newOptValue) return;
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ADD_OPTION',
        questionId,
        label: newOptLabel,
        value: newOptValue,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setNewOptLabel('');
      setNewOptValue('');
      loadData();
    }
  };

  // 編輯選項文字 (升版)
  const handleUpdateOptionLabel = async (optionId: string, oldLabel: string) => {
    const nextLabel = prompt('請輸入新選項標籤名稱 (修改後將建立新版本)：', oldLabel);
    if (!nextLabel || nextLabel === oldLabel) return;

    await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_OPTION',
        optionId,
        label: nextLabel,
      }),
    });
    loadData();
  };

  // 新增條件規則
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleSourceQId || !ruleSourceVal || ruleTargetQIds.length === 0) {
      alert('請填寫完整條件規則設定');
      return;
    }

    const res = await fetch('/api/admin/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceQuestionId: ruleSourceQId,
        operator: ruleOperator,
        sourceValue: ruleSourceVal,
        action: ruleAction,
        targetQuestionIds: ruleTargetQIds,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setIsRuleModalOpen(false);
      loadData();
    }
  };

  // 取得目前選取分類物件
  const currentCat = categories.find((c) => c.id === selectedCatId);

  // 所有題目扁平列表 (供條件規則選取)
  const allQuestions = categories.flatMap((c) => c.questions || []);

  return (
    <div className="space-y-6">
      {/* 頂部標題與管理身分指示 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-950 text-amber-400 border border-amber-800">
              PAGE 02
            </span>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-400" />
              題目與規格管理後台 (Question & Schema Admin)
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            資料驅動核心管理平台：新增分類、版本化題目維護、選項升版與條件邏輯設定。
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>權限: ADMIN / TECH_MANAGER</span>
        </div>
      </div>

      {/* 頁籤切換 */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'questions'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          題目與選項維護
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'categories'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          分類管理
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'rules'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          條件連動邏輯
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'audit'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          操作紀錄 (Audit Log)
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 題目與選項維護                                    */}
      {/* ======================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* 分類選擇列與新增按鈕 */}
          <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-300">選擇技術分類：</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.key}) {!c.enabled && '[已停用]'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateQuestion}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              新增題目至【{currentCat?.name}】
            </button>
          </div>

          {/* 題目清單表格 */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                【{currentCat?.name}】題目列表
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                共 {currentCat?.questions?.length || 0} 題
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {currentCat?.questions?.map((q: any) => {
                const activeVer = q.versions?.[0];
                return (
                  <div key={q.id} className="p-5 hover:bg-slate-900/40 transition space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {q.key}
                          </span>
                          <h4 className="text-base font-bold text-slate-100">
                            {activeVer?.title || q.key}
                          </h4>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                            Version {activeVer?.version || 1}
                          </span>
                          <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {q.type}
                          </span>
                          {q.required && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              必填
                            </span>
                          )}
                          {!q.enabled && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                              已停用 (Soft Deleted)
                            </span>
                          )}
                        </div>

                        {activeVer?.description && (
                          <p className="text-xs text-slate-400 mt-1.5">{activeVer.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          編輯 / 升版
                        </button>
                        <button
                          onClick={() => handleToggleQuestion(q.id, !q.enabled)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                            q.enabled
                              ? 'bg-rose-950/30 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                              : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                          }`}
                        >
                          {q.enabled ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> 停用
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> 啟用
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 選項列表 (若為下拉或單多選) */}
                    {(q.type === 'dropdown' || q.type === 'radio' || q.type === 'checkbox') && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                          <span>可用選項 (共 {q.options?.length || 0} 項)：</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {q.options?.map((opt: any) => {
                            const optVer = opt.versions?.[0];
                            return (
                              <div
                                key={opt.id}
                                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${
                                  opt.enabled
                                    ? 'bg-slate-900 text-slate-200 border-slate-700'
                                    : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through'
                                }`}
                              >
                                <span>{optVer?.label || opt.id}</span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  (v{optVer?.version})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOptionLabel(opt.id, optVer?.label)}
                                  className="text-slate-400 hover:text-amber-300"
                                  title="修改選項文字 (將自動升版)"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* 快速新增選項 */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <input
                            type="text"
                            placeholder="選項標籤 (例: 4K 專業)"
                            value={newOptLabel}
                            onChange={(e) => setNewOptLabel(e.target.value)}
                            className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                          />
                          <input
                            type="text"
                            placeholder="選項 Value (例: 4k_pro)"
                            value={newOptValue}
                            onChange={(e) => setNewOptValue(e.target.value)}
                            className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddOption(q.id)}
                            className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition"
                          >
                            + 新增選項
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {currentCat?.questions?.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  此分類目前尚無題目，請點擊上方「新增題目」建立。
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 分類管理                                          */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">技術分類列表</h3>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              新增技術分類 (例: 燈光, 舞台, 電力)
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">排序</th>
                  <th className="p-4">分類 Key</th>
                  <th className="p-4">中文名稱</th>
                  <th className="p-4">題目數量</th>
                  <th className="p-4">狀態</th>
                  <th className="p-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono text-slate-400">{c.sortOrder}</td>
                    <td className="p-4 font-mono text-sky-400">{c.key}</td>
                    <td className="p-4 font-semibold text-slate-200">{c.name}</td>
                    <td className="p-4 font-mono text-slate-300">
                      {c.questions?.length || 0} 題
                    </td>
                    <td className="p-4">
                      {c.enabled ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-400 border border-emerald-800">
                          啟用中
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-500">
                          已停用 (Soft Delete)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleCategory(c.id, !c.enabled)}
                        className={`px-3 py-1 rounded text-xs font-medium border transition ${
                          c.enabled
                            ? 'bg-rose-950/30 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                            : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                        }`}
                      >
                        {c.enabled ? '停用分類' : '重新啟用'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 條件連動邏輯                                      */}
      {/* ======================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">條件邏輯清單 (Conditional Rules)</h3>
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              新增連動條件規則
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="divide-y divide-slate-800/80">
              {rules.map((r) => {
                let targets = [];
                try {
                  targets = JSON.parse(r.targetQuestionIds);
                } catch {
                  targets = [r.targetQuestionIds];
                }

                return (
                  <div key={r.id} className="p-5 hover:bg-slate-900/40 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                          {r.id}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">
                          IF 題目 <code className="text-amber-300 font-mono">[{r.sourceQuestionId}]</code> {r.operator} <code className="text-emerald-300 font-mono">"{r.sourceValue}"</code>
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded uppercase font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        THEN {r.action}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 pl-4 border-l-2 border-slate-700">
                      受影響題目：{targets.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: 操作紀錄 (Audit Log)                              */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 space-y-4 p-5">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            系統操作與版本升級日誌 (Audit Log)
          </h3>

          <div className="divide-y divide-slate-800/80">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sky-400">{log.action}</span>
                    <span className="text-slate-400">[{log.entityType}] ID: {log.entityId}</span>
                  </div>
                  {log.before && (
                    <p className="text-slate-500 font-mono text-[11px] truncate max-w-xl">
                      Before: {log.before}
                    </p>
                  )}
                  {log.after && (
                    <p className="text-slate-400 font-mono text-[11px] truncate max-w-xl">
                      After: {log.after}
                    </p>
                  )}
                </div>
                <span className="text-slate-500 font-mono">
                  {new Date(log.createdAt).toLocaleString('zh-TW')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新增分類 Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCategory} className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4 border border-slate-700">
            <h3 className="text-lg font-bold text-slate-100">新增技術分類</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">分類 Key (英文代碼，如 lighting)</label>
              <input
                type="text"
                required
                value={newCatKey}
                onChange={(e) => setNewCatKey(e.target.value)}
                placeholder="lighting"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">分類中文名稱 (如 燈光)</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="燈光"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
              >
                儲存分類
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 新增 / 編輯題目 Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveQuestion} className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100">
              {editingQuestion ? '編輯題目 (將建立新版本)' : '新增題目'}
            </h3>

            {!editingQuestion && (
              <div>
                <label className="text-xs text-slate-300 block mb-1">題目 Key (永久代碼，如 stage_monitor)</label>
                <input
                  type="text"
                  required
                  value={questionKey}
                  onChange={(e) => setQuestionKey(e.target.value)}
                  placeholder="stage_monitor"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 block mb-1">題目名稱 / 標題</label>
              <input
                type="text"
                required
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="舞台側補聲需求"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">題型 (Type)</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="dropdown">下拉選單 (dropdown)</option>
                <option value="radio">單選按鈕 (radio)</option>
                <option value="checkbox">多選核取方塊 (checkbox)</option>
                <option value="text">單行文字 (text)</option>
                <option value="textarea">多行說明 (textarea)</option>
                <option value="number">數字輸入 (number)</option>
                <option value="date">日期選擇 (date)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">說明文字 (可選)</label>
              <input
                type="text"
                value={questionDescription}
                onChange={(e) => setQuestionDescription(e.target.value)}
                placeholder="請輸入給填表人的提示說明..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqCheck"
                checked={questionRequired}
                onChange={(e) => setQuestionRequired(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="reqCheck" className="text-xs text-slate-300 cursor-pointer">
                設為必填項目
              </label>
            </div>

            {/* 新建時若為選單題型，提供初始選項設定 */}
            {!editingQuestion && (questionType === 'dropdown' || questionType === 'radio' || questionType === 'checkbox') && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">初始選項清單：</label>
                {questionOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="標籤 (如: 有)"
                      value={opt.label}
                      onChange={(e) => {
                        const next = [...questionOptions];
                        next[i].label = e.target.value;
                        setQuestionOptions(next);
                      }}
                      className="w-1/2 px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="值 (如: yes)"
                      value={opt.value}
                      onChange={(e) => {
                        const next = [...questionOptions];
                        next[i].value = e.target.value;
                        setQuestionOptions(next);
                      }}
                      className="w-1/2 px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setQuestionOptions([...questionOptions, { label: '', value: '' }])}
                  className="text-xs text-sky-400 hover:underline"
                >
                  + 新增一列選項
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
              >
                儲存並發布新版本
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 新增條件規則 Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateRule} className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-4 border border-slate-700">
            <h3 className="text-lg font-bold text-slate-100">新增條件連動規則 (Conditional Rule)</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">觸發題目 (Source Question)</label>
              <select
                value={ruleSourceQId}
                onChange={(e) => setRuleSourceQId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">-- 請選擇觸發題目 --</option>
                {allQuestions.map((q: any) => (
                  <option key={q.id} value={q.id}>
                    [{q.key}] {q.versions?.[0]?.title || q.key}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">比較運算子 (Operator)</label>
                <select
                  value={ruleOperator}
                  onChange={(e) => setRuleOperator(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
                >
                  <option value="equals">等於 (equals)</option>
                  <option value="not_equals">不等於 (not_equals)</option>
                  <option value="contains">包含 (contains)</option>
                  <option value="in">包含於清單 (in)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">觸發值 (Source Value)</label>
                <input
                  type="text"
                  required
                  value={ruleSourceVal}
                  onChange={(e) => setRuleSourceVal(e.target.value)}
                  placeholder="例如: none 或 4k"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">執行動作 (Action)</label>
              <select
                value={ruleAction}
                onChange={(e) => setRuleAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="hide">隱藏目標題目 (hide)</option>
                <option value="show">顯示目標題目 (show)</option>
                <option value="disable">停用目標題目 (disable)</option>
                <option value="enable">啟用目標題目 (enable)</option>
                <option value="required">設為必填 (required)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">受影響題目 (可複選)</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                {allQuestions.map((q: any) => {
                  const isChecked = ruleTargetQIds.includes(q.id);
                  return (
                    <label key={q.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setRuleTargetQIds(ruleTargetQIds.filter((id) => id !== q.id));
                          } else {
                            setRuleTargetQIds([...ruleTargetQIds, q.id]);
                          }
                        }}
                      />
                      <span>[{q.key}] {q.versions?.[0]?.title || q.key}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
              >
                儲存條件規則
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
