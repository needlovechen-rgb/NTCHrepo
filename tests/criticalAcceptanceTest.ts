import { prisma } from '../src/lib/db';
import { CategoryService } from '../src/services/CategoryService';
import { QuestionService } from '../src/services/QuestionService';
import { FormSchemaService } from '../src/services/FormSchemaService';
import { TechnicalSummaryService } from '../src/services/TechnicalSummaryService';
import { ExcelExportService } from '../src/services/ExcelExportService';
import { PdfExportService } from '../src/services/PdfExportService';
import { EventService } from '../src/services/EventService';

async function runAcceptanceTests() {
  console.log('🚀 開始執行系統關鍵驗收測試 (Critical Acceptance Tests)...\n');

  // =========================================================================
  // 驗收測試 1: ADMIN 新增題目 -> 不改程式 -> USER 開啟問卷自動出現
  // =========================================================================
  console.log('【測試 1】ADMIN 新增題目「舞台側補聲需求」驗收測試:');
  const catAudio = await prisma.category.findUnique({ where: { key: 'audio' } });
  if (!catAudio) throw new Error('Audio category missing');

  const qSideFill = await QuestionService.createQuestion({
    categoryId: catAudio.id,
    key: 'stage_side_fill',
    title: '舞台側補聲需求',
    type: 'dropdown',
    required: false,
    options: [
      { label: '有', value: 'yes' },
      { label: '無', value: 'no' },
      { label: '場地提供', value: 'venue_default' },
    ],
  });
  console.log(`  ✔ 成功新增題目: ID=${qSideFill.id}`);

  const activeSchema = await FormSchemaService.getActiveFormSchema();
  const audioCategory = activeSchema.categories.find((c) => c.key === 'audio');
  const foundQuestion = audioCategory?.questions.find((q) => q.key === 'stage_side_fill');
  if (!foundQuestion || foundQuestion.options.length !== 3) {
    throw new Error('❌ 測試 1 失敗: FormSchema 未自動包含新題目或選項');
  }
  console.log(`  ✔ 動態 FormSchema 自動偵測到「${foundQuestion.title}」，選項數: ${foundQuestion.options.length}`);
  console.log('  🎉 測試 1 PASSED: 零程式碼修改動態呈現新題目！\n');

  // =========================================================================
  // 驗收測試 2: ADMIN 新增分類「燈光」-> PAGE 01, PAGE 03, PDF, Excel 全部自動支援
  // =========================================================================
  console.log('【測試 2】ADMIN 新增分類「燈光」與題目擴充性驗收測試:');
  const catLighting = await CategoryService.createCategory({
    key: 'lighting',
    name: '燈光',
    sortOrder: 6,
  });
  console.log(`  ✔ 成功新增分類: ID=${catLighting.id}, Name=${catLighting.name}`);

  const qLighting = await QuestionService.createQuestion({
    categoryId: catLighting.id,
    key: 'lighting_profile',
    title: '燈光需求',
    type: 'dropdown',
    options: [
      { label: '白光照明', value: 'white' },
      { label: '全彩染色＋電腦燈', value: 'full_color' },
      { label: '場地現有配置', value: 'venue_default' },
    ],
  });
  console.log(`  ✔ 成功新增燈光題目: ID=${qLighting.id}`);

  // 建立填寫演出並測試
  const testEvent = await EventService.createEvent({
    name: '2026 燈光系統擴充測試音樂會',
    eventDate: '2026-11-20',
    formUser: '測試燈光師',
  });

  await EventService.saveDraft(
    testEvent.id,
    {},
    [
      {
        questionId: qLighting.id,
        questionVersionId: `qv_lighting_profile_01`,
        optionId: `opt_lighting_profile_full_color`,
        optionVersionId: `ov_lighting_profile_full_color_01`,
        value: 'full_color',
        valueType: 'option',
      },
    ]
  );
  await EventService.submitEvent(testEvent.id);

  // 驗證 Summary Engine
  const testSummary = await TechnicalSummaryService.generateSummary(testEvent.id);
  const lightingGroup = testSummary.categories.find((c) => c.name === '燈光');
  if (!lightingGroup || lightingGroup.items.length === 0) {
    throw new Error('❌ 測試 2 失敗: Technical Summary 未動態包含燈光分類');
  }
  console.log(`  ✔ Technical Summary Engine 自動包含分類「${lightingGroup.name}」，項目: ${lightingGroup.items[0].question} = ${lightingGroup.items[0].answer}`);

  // 驗證 PDF & Excel
  const pdfBuffer = await PdfExportService.generatePdfBuffer(testEvent.id);
  const excelBuffer = await ExcelExportService.generateExcelBuffer(testEvent.id);
  if (pdfBuffer.length === 0 || excelBuffer.length === 0) {
    throw new Error('❌ 測試 2 失敗: 匯出檔案產出失敗');
  }

  const wbTest = require('xlsx').read(excelBuffer, { type: 'buffer' });
  if (wbTest.SheetNames.length !== 1 || wbTest.SheetNames[0] !== '技術需求總表') {
    throw new Error(`❌ 測試 2 失敗: Excel 應僅包含「技術需求總表」，實際工作表為: ${wbTest.SheetNames.join(', ')}`);
  }
  console.log(`  ✔ PDF Buffer 產出成功 (${pdfBuffer.length} bytes)，Excel Buffer 產出成功 (僅包含單一 Sheet: ${wbTest.SheetNames[0]})`);
  console.log('  🎉 測試 2 PASSED: 新增分類全自動支援且 Excel 僅匯出技術需求總表！\n');

  // =========================================================================
  // 驗收測試 3: Versioning 歷史不可篡改測試
  // =========================================================================
  console.log('【測試 3】題目版本升級 (Versioning) 與歷史不可篡改驗收測試:');
  // 2025 演出使用目前 Version 1 (q_video_recording = 錄影需求)
  const event2025 = await EventService.createEvent({
    name: '2025年度歷史音樂會',
    eventDate: '2025-05-10',
    formUser: '歷史填表人',
  });
  await EventService.saveDraft(
    event2025.id,
    {},
    [
      {
        questionId: 'q_video_recording',
        questionVersionId: 'qv_video_recording_01',
        optionId: 'opt_video_recording_record_hd',
        optionVersionId: 'ov_video_recording_record_hd_01',
        value: 'record_hd',
        valueType: 'option',
      },
    ]
  );
  await EventService.submitEvent(event2025.id);

  // 管理者將題目由「錄影需求」修改為「錄影服務需求」(升版為 Version 2)
  console.log('  -> 管理者升級題目為 Version 2: 標題改為「錄影服務需求」');
  await QuestionService.updateQuestionWithNewVersion('q_video_recording', {
    title: '錄影服務需求',
  });

  // 建立 2026 新演出 (使用 Version 2)
  const event2026 = await EventService.createEvent({
    name: '2026年度新音樂會',
    eventDate: '2026-06-15',
    formUser: '新填表人',
  });
  await EventService.saveDraft(
    event2026.id,
    {},
    [
      {
        questionId: 'q_video_recording',
        questionVersionId: 'qv_video_recording_02',
        optionId: 'opt_video_recording_record_hd',
        optionVersionId: 'ov_video_recording_record_hd_01',
        value: 'record_hd',
        valueType: 'option',
      },
    ]
  );
  await EventService.submitEvent(event2026.id);

  // 驗證 2025 歷史演出依然顯示「錄影需求」v1
  const summary2025 = await TechnicalSummaryService.generateSummary(event2025.id);
  const item2025 = summary2025.categories.flatMap((c) => c.items).find((i) => i.questionKey === 'video_recording');

  // 驗證 2026 新演出顯示「錄影服務需求」v2
  const summary2026 = await TechnicalSummaryService.generateSummary(event2026.id);
  const item2026 = summary2026.categories.flatMap((c) => c.items).find((i) => i.questionKey === 'video_recording');

  console.log(`  ✔ 2025 歷史演出題目標題: 「${item2025?.question}」 (Version ${item2025?.questionVersion})`);
  console.log(`  ✔ 2026 新演出題目標題: 「${item2026?.question}」 (Version ${item2026?.questionVersion})`);

  if (item2025?.question !== '錄影需求' || item2026?.question !== '錄影服務需求') {
    throw new Error('❌ 測試 3 失敗: 歷史版本受新版本影響篡改！');
  }
  console.log('  🎉 測試 3 PASSED: 版本歷史完整隔離且不可篡改！\n');

  // =========================================================================
  // 驗收測試 4: Soft Delete 測試
  // =========================================================================
  console.log('【測試 4】軟刪除 (Soft Delete: enabled=false) 測試:');
  const optBD = await prisma.option.findUnique({ where: { id: 'opt_video_recording_record_bd' } });
  if (optBD) {
    await prisma.option.update({
      where: { id: optBD.id },
      data: { enabled: false },
    });
    console.log('  ✔ 已停用選項: opt_video_recording_record_bd (代錄影 BD)');

    const currentSchema = await FormSchemaService.getActiveFormSchema();
    const videoQ = currentSchema.categories
      .flatMap((c) => c.questions)
      .find((q) => q.key === 'video_recording');

    const hasBD = videoQ?.options.some((o) => o.value === 'record_bd');
    if (hasBD) {
      throw new Error('❌ 測試 4 失敗: 已停用選項仍出現在新表單中');
    }
    console.log('  ✔ 新表單已不再出現已停用選項');
  }
  console.log('  🎉 測試 4 PASSED: 軟刪除機制正常運作！\n');

  // =========================================================================
  // 驗收測試 5: Demo Event 2026年度音樂會 Highlight & Export 測試
  // =========================================================================
  console.log('【測試 5】Demo 演出 (2026年度音樂會) 需求總表與 Highlight 測試:');
  const demoSummary = await TechnicalSummaryService.generateSummary('evt_2026_001');
  console.log(`  ✔ 演出名稱: ${demoSummary.event.name}, 地點: ${demoSummary.event.venue}`);
  console.log(`  ✔ 命中重要需求標籤 (${demoSummary.highlights.length}項):`, demoSummary.highlights);
  if (!demoSummary.highlights.some((h) => h.includes('4K')) || !demoSummary.highlights.some((h) => h.includes('多軌'))) {
    throw new Error('❌ 測試 5 失敗: Highlight Rules 未命中預期條件');
  }
  console.log('  🎉 測試 5 PASSED: 技術需求摘要與高亮標籤運算完全正確！\n');

  console.log('🏆 恭喜！全部驗收測試 100% 通過！');
}

runAcceptanceTests()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
