'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FormSchema, AnswerItem } from '@/types/schema';
import { evaluateRules } from '@/lib/ruleEngine';
import { DynamicCategoryTabs } from './DynamicCategoryTabs';
import { DynamicQuestion } from './DynamicQuestion';
import { Save, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DynamicFormEngineProps {
  initialSchema: FormSchema;
  eventId: string;
}

export const DynamicFormEngine: React.FC<DynamicFormEngineProps> = ({
  initialSchema,
  eventId,
}) => {
  const router = useRouter();
  const categoryTopRef = useRef<HTMLDivElement>(null);

  // 1. 基本資訊 State
  const [eventInfo, setEventInfo] = useState({
    name: initialSchema.event?.name || '',
    eventDate:
      initialSchema.event?.eventDate || new Date().toLocaleDateString('en-CA'),
    venueId: initialSchema.event?.venueId || '',
    formUser: initialSchema.event?.formUser || '',
    contactPerson: initialSchema.event?.contactPerson || '',
    contactPhone: initialSchema.event?.contactPhone || '',
    contactEmail: initialSchema.event?.contactEmail || '',
    notes: initialSchema.event?.notes || '',
  });

  // 2. 回答 State (keyed by questionId)
  const [answers, setAnswers] = useState<Record<string, AnswerItem>>(
    initialSchema.answers || {}
  );

  // 3. 場地列表
  const [venues, setVenues] = useState<Array<{ id: string; name: string }>>([]);

  // 4. 目前分頁
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialSchema.categories[0]?.id || ''
  );

  // 切換分類並自動滾動到最前面 (避免漏答)
  const handleSelectCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    setTimeout(() => {
      if (categoryTopRef.current) {
        categoryTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  // 5. 儲存狀態
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/venues')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setVenues(data.venues);
      })
      .catch(console.error);
  }, []);

  // 建立 defaultStates (questionId -> { required })
  const defaultStates = useMemo(() => {
    const map: Record<string, { required: boolean }> = {};
    for (const cat of initialSchema.categories) {
      for (const q of cat.questions) {
        map[q.id] = { required: q.required };
      }
    }
    return map;
  }, [initialSchema.categories]);

  // 提煉目前所有 answers 的純數值 (questionId -> value)
  const answerValues = useMemo(() => {
    const map: Record<string, any> = {};
    for (const [qId, item] of Object.entries(answers)) {
      map[qId] = item.value;
    }
    return map;
  }, [answers]);

  // 即時計算條件邏輯 (Visibility & Requirement Matrix)
  const questionStates = useMemo(() => {
    return evaluateRules(initialSchema.rules, answerValues, defaultStates);
  }, [initialSchema.rules, answerValues, defaultStates]);

  // 取得目前選取分類
  const currentCategory = useMemo(() => {
    return initialSchema.categories.find((c) => c.id === activeCategoryId);
  }, [initialSchema.categories, activeCategoryId]);

  // 各分類填寫進度計算
  const categoryAnswerCounts = useMemo(() => {
    const res: Record<string, { total: number; filled: number }> = {};
    for (const cat of initialSchema.categories) {
      let total = 0;
      let filled = 0;
      for (const q of cat.questions) {
        const state = questionStates[q.id];
        if (state && state.visible === false) continue;
        total++;
        const ans = answers[q.id];
        if (ans && ans.value !== undefined && ans.value !== '' && ans.value !== null) {
          if (Array.isArray(ans.value) ? ans.value.length > 0 : true) {
            filled++;
          }
        }
      }
      res[cat.id] = { total, filled };
    }
    return res;
  }, [initialSchema.categories, questionStates, answers]);

  // 題目回答變更處理
  const handleAnswerChange = useCallback(
    (
      questionId: string,
      questionVersionId: string,
      type: string,
      value: any,
      optionId?: string,
      optionVersionId?: string
    ) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          eventId,
          questionId,
          questionVersionId,
          optionId,
          optionVersionId,
          value,
          valueType: type === 'checkbox' ? 'multi_option' : type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'text' || type === 'textarea' ? 'text' : 'option',
        },
      }));
    },
    [eventId]
  );

  // 自動存檔函式
  const performSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      const answersPayload = Object.values(answers);
      const res = await fetch(`/api/events/${eventId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventInfo,
          answers: answersPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSavedTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
      }
    } catch (e) {
      console.error('Draft auto-save failed', e);
    } finally {
      setIsSaving(false);
    }
  }, [eventId, eventInfo, answers]);

  // Debounced auto-save (當答案或基本資料變更後 1.5 秒自動儲存)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (eventId) {
        performSaveDraft();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [answers, eventInfo, performSaveDraft, eventId]);

  // 正式送出問卷
  const handleSubmit = async () => {
    // 檢查必填項目
    for (const cat of initialSchema.categories) {
      for (const q of cat.questions) {
        const state = questionStates[q.id];
        if (state && state.visible !== false && state.required) {
          const ans = answers[q.id];
          if (!ans || ans.value === undefined || ans.value === '' || ans.value === null) {
            alert(`【${cat.name}】中的必填題目「${q.title}」尚未填寫！`);
            setActiveCategoryId(cat.id);
            return;
          }
        }
      }
    }

    if (!confirm('確認提交演出技術需求問卷？提交後將鎖定技術需求總表。')) return;

    setIsSubmitting(true);
    try {
      // 先存一次草稿
      await performSaveDraft();
      // 正式提交
      const res = await fetch(`/api/events/${eventId}/submit`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/summary/${eventId}`);
      } else {
        alert('提交失敗：' + data.error);
      }
    } catch (err: any) {
      alert('發生錯誤：' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 分類前後切換
  const currentCatIndex = initialSchema.categories.findIndex((c) => c.id === activeCategoryId);
  const prevCategory = currentCatIndex > 0 ? initialSchema.categories[currentCatIndex - 1] : null;
  const nextCategory =
    currentCatIndex < initialSchema.categories.length - 1
      ? initialSchema.categories[currentCatIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      {/* 頂部基本資料區塊 */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              演出基本資料
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">請確認演出時間、場地與負責人資訊</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>儲存中...</span>
                </>
              ) : lastSavedTime ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>草稿已於 {lastSavedTime} 自動儲存</span>
                </>
              ) : (
                <span>自動儲存啟用中</span>
              )}
            </div>
            <button
              type="button"
              onClick={performSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Save className="w-3.5 h-3.5" />
              手動儲存
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              演出名稱 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={eventInfo.name}
              onChange={(e) => setEventInfo({ ...eventInfo, name: e.target.value })}
              placeholder="例：2026年度音樂會"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              演出日期 <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={eventInfo.eventDate}
              onChange={(e) => setEventInfo({ ...eventInfo, eventDate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">
              演出地點 <span className="text-rose-400">*</span>
            </label>
            <select
              value={eventInfo.venueId}
              onChange={(e) => setEventInfo({ ...eventInfo, venueId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="">-- 選擇演出場地 --</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">填表人</label>
            <input
              type="text"
              value={eventInfo.formUser}
              onChange={(e) => setEventInfo({ ...eventInfo, formUser: e.target.value })}
              placeholder="填表人姓名"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">聯絡人與電話</label>
            <input
              type="text"
              value={eventInfo.contactPhone}
              onChange={(e) => setEventInfo({ ...eventInfo, contactPhone: e.target.value })}
              placeholder="聯絡電話"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">聯絡 Email</label>
            <input
              type="email"
              value={eventInfo.contactEmail}
              onChange={(e) => setEventInfo({ ...eventInfo, contactEmail: e.target.value })}
              placeholder="example@mail.com"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </div>

      {/* 動態分類頁籤導覽 (由資料庫動態驅動) */}
      <div ref={categoryTopRef} className="scroll-mt-24">
        <DynamicCategoryTabs
          categories={initialSchema.categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
          categoryAnswerCounts={categoryAnswerCounts}
        />
      </div>

      {/* 動態題目渲染區塊 (Dynamic Form Engine) */}
      {currentCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-bold text-slate-200">
              {currentCategory.name} 需求設定
            </h3>
            <span className="text-xs text-slate-400">
              共 {currentCategory.questions.length} 個設定項目
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentCategory.questions.map((question) => {
              const state = questionStates[question.id] || {
                visible: true,
                enabled: true,
                required: question.required,
              };

              const currentAns = answers[question.id];

              return (
                <DynamicQuestion
                  key={question.id}
                  question={question}
                  value={currentAns ? currentAns.value : ''}
                  onChange={(val, optId, optVerId) =>
                    handleAnswerChange(
                      question.id,
                      question.versionId,
                      question.type,
                      val,
                      optId,
                      optVerId
                    )
                  }
                  disabled={!state.enabled}
                  required={state.required}
                  visible={state.visible}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 底部導覽與操作列 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {prevCategory && (
            <button
              type="button"
              onClick={() => handleSelectCategory(prevCategory.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              上一分類 ({prevCategory.name})
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {nextCategory ? (
            <button
              type="button"
              onClick={() => handleSelectCategory(nextCategory.id)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm font-medium transition shadow-sm"
            >
              下一分類 ({nextCategory.name})
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提交鎖定中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  完成填寫並產出總表
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
