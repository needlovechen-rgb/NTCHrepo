'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Search,
  FileText,
  Copy,
  Edit3,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // 取得當日日期 (YYYY-MM-DD)
  const getTodayString = () => new Date().toLocaleDateString('en-CA');

  // 建立演出 Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState(getTodayString());
  const [newEventVenueId, setNewEventVenueId] = useState('');
  const [newEventFormUser, setNewEventFormUser] = useState('');
  const [newEventPhone, setNewEventPhone] = useState('');
  const [venues, setVenues] = useState<any[]>([]);

  const openCreateModal = () => {
    setNewEventName('');
    setNewEventDate(getTodayString());
    setNewEventVenueId('');
    setNewEventFormUser('');
    setNewEventPhone('');
    setIsCreateModalOpen(true);
  };

  // 載入演出與場地
  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (data.success) setEvents(data.events);

      const vRes = await fetch('/api/venues');
      const vData = await vRes.json();
      if (vData.success) setVenues(vData.venues);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [search, statusFilter]);

  // 新建演出
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventDate) return;

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newEventName,
        eventDate: newEventDate,
        venueId: newEventVenueId || undefined,
        formUser: newEventFormUser,
        contactPhone: newEventPhone,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setIsCreateModalOpen(false);
      setNewEventName('');
      setNewEventDate(getTodayString());
      loadEvents();
    } else {
      alert(data.error);
    }
  };

  // 複製演出
  const handleCopyEvent = async (eventId: string, oldName: string) => {
    const nextName = prompt('請輸入複製後的演出名稱：', `${oldName} (複製)`);
    if (!nextName) return;
    const nextDate = prompt('請輸入演出日期 (YYYY-MM-DD)：', getTodayString());
    if (!nextDate) return;

    const res = await fetch(`/api/events/${eventId}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nextName, eventDate: nextDate }),
    });
    const data = await res.json();
    if (data.success) {
      alert('複製演出成功！');
      loadEvents();
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DATA-DRIVEN ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            演出技術會議需求管理系統
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            專為音響、錄影音、INTERCOM、投影、燈光、舞台等專業技術團隊設計。透過動態問卷快速收集需求、自動生成技術規格總表並支援一鍵匯出 PDF 與 Excel。
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              建立新演出會議
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700 transition"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              題目與分類維護 (PAGE 02)
            </Link>
          </div>
        </div>
      </div>

      {/* 搜尋與篩選列 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋演出名稱、填表人或地點..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="">全部狀態</option>
            <option value="draft">草稿 (Draft)</option>
            <option value="submitted">已提交 (Submitted)</option>
            <option value="archived">已封存 (Archived)</option>
          </select>
        </div>
      </div>

      {/* 演出列表清單 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {evt.id}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    evt.status === 'submitted'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {evt.status === 'submitted' ? '已提交總表' : '草稿填寫中'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition">
                  {evt.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{new Date(evt.eventDate).toISOString().split('T')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{evt.venue?.name || '未指定場地'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyEvent(evt.id, evt.name)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                title="複製此場演出資料"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={`/form/${evt.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  填寫問卷 (P1)
                </Link>

                <Link
                  href={`/summary/${evt.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  總表 (P3)
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-500 space-y-3">
          <Calendar className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm">目前尚無符合搜尋條件的演出項目</p>
        </div>
      )}

      {/* 新增演出 Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEvent}
            className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4 border border-slate-700"
          >
            <h3 className="text-lg font-bold text-slate-100">建立新演出會議</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                演出名稱 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="例：2026年度音樂會"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                演出日期 <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">演出地點</label>
              <select
                value={newEventVenueId}
                onChange={(e) => setNewEventVenueId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">-- 請選擇場地 --</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">填表人姓名</label>
              <input
                type="text"
                value={newEventFormUser}
                onChange={(e) => setNewEventFormUser(e.target.value)}
                placeholder="填表人"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">聯絡電話</label>
              <input
                type="text"
                value={newEventPhone}
                onChange={(e) => setNewEventPhone(e.target.value)}
                placeholder="聯絡電話"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
              >
                建立並前往填寫
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
