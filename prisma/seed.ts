import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.auditLog.deleteMany();
  await prisma.eventSnapshot.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.event.deleteMany();
  await prisma.conditionalRule.deleteMany();
  await prisma.optionVersion.deleteMany();
  await prisma.option.deleteMany();
  await prisma.questionVersion.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users & Venues...');
  const userAdmin = await prisma.user.create({
    data: {
      id: 'usr_admin',
      username: 'admin',
      email: 'admin@stage.com',
      name: '系統管理員',
      role: 'ADMIN',
    },
  });

  const userTech = await prisma.user.create({
    data: {
      id: 'usr_tech',
      username: 'tech_lead',
      email: 'tech@stage.com',
      name: '技術總監',
      role: 'TECH_MANAGER',
    },
  });

  const userArtist = await prisma.user.create({
    data: {
      id: 'usr_artist',
      username: 'artist_01',
      email: 'artist@stage.com',
      name: '演出製作人 (王小明)',
      role: 'USER',
    },
  });

  const venueNCH = await prisma.venue.create({
    data: {
      id: 'venue_nch',
      name: '國家音樂廳',
      address: '台北市中正區中山南路21-1號',
    },
  });

  const venueNT = await prisma.venue.create({
    data: {
      id: 'venue_nt',
      name: '國家戲劇院',
      address: '台北市中正區中山南路21-1號',
    },
  });

  console.log('Seeding Categories...');
  const categoriesData = [
    { id: 'cat_audio', key: 'audio', name: '音響', sortOrder: 1 },
    { id: 'cat_video', key: 'video', name: '錄影音', sortOrder: 2 },
    { id: 'cat_intercom', key: 'intercom', name: 'INTERCOM', sortOrder: 3 },
    { id: 'cat_projection', key: 'projection', name: '投影器材', sortOrder: 4 },
    { id: 'cat_other', key: 'other', name: '其他', sortOrder: 5 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }

  // 輔助函式：建立題目、版本與選項
  async function createQuestion(
    catId: string,
    qKey: string,
    title: string,
    type: string,
    required: boolean,
    sortOrder: number,
    options: Array<{ label: string; value: string }>,
    description?: string
  ) {
    const qId = `q_${qKey}`;
    const qvId = `qv_${qKey}_01`;

    await prisma.question.create({
      data: {
        id: qId,
        categoryId: catId,
        key: qKey,
        type,
        required,
        enabled: true,
        sortOrder,
        currentVersionId: qvId,
      },
    });

    await prisma.questionVersion.create({
      data: {
        id: qvId,
        questionId: qId,
        version: 1,
        title,
        description,
        type,
        required,
        isActive: true,
        createdBy: userAdmin.id,
      },
    });

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const optId = `opt_${qKey}_${opt.value}`;
      const ovId = `ov_${qKey}_${opt.value}_01`;

      await prisma.option.create({
        data: {
          id: optId,
          questionId: qId,
          currentVersionId: ovId,
          enabled: true,
        },
      });

      await prisma.optionVersion.create({
        data: {
          id: ovId,
          optionId: optId,
          version: 1,
          label: opt.label,
          value: opt.value,
          sortOrder: i + 1,
          isActive: true,
          createdBy: userAdmin.id,
        },
      });
    }

    return qId;
  }

  console.log('Seeding Questions & Options...');

  // 1. 音響
  await createQuestion('cat_audio', 'foh', 'FOH需求', 'dropdown', true, 10, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_audio', 'monitor', 'Monitor需求', 'dropdown', true, 20, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_audio', 'mic_wireless', '無線麥克風需求', 'dropdown', true, 30, [
    { label: '無', value: 'none' },
    { label: '2支', value: '2' },
    { label: '4支', value: '4' },
    { label: '6支', value: '6' },
    { label: '8支以上', value: '8_plus' },
  ]);
  await createQuestion('cat_audio', 'di', 'DI需求', 'dropdown', true, 40, [
    { label: '無', value: 'none' },
    { label: '2組', value: '2' },
    { label: '4組', value: '4' },
    { label: '8組', value: '8' },
    { label: '12組以上', value: '12_plus' },
  ]);
  await createQuestion('cat_audio', 'stage_monitor', '舞台監聽', 'dropdown', false, 50, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_audio', 'audio_other', '其他音響需求', 'textarea', false, 60, []);

  // 2. 錄影音
  await createQuestion('cat_video', 'video_recording', '錄影需求', 'dropdown', true, 10, [
    { label: '代錄影 BD', value: 'record_bd' },
    { label: '代錄影 HD', value: 'record_hd' },
    { label: '自錄影', value: 'record_self' },
    { label: '無', value: 'none' },
  ]);
  await createQuestion('cat_video', 'video_camera_count', '錄影機位', 'dropdown', false, 20, [
    { label: '1機', value: '1' },
    { label: '2機', value: '2' },
    { label: '3機', value: '3' },
    { label: '4機以上', value: '4_plus' },
    { label: '無', value: 'none' },
  ]);
  await createQuestion('cat_video', 'video_format', '錄影格式', 'dropdown', false, 30, [
    { label: 'HD', value: 'HD' },
    { label: 'FHD', value: 'FHD' },
    { label: '4K', value: '4K' },
    { label: '其他', value: 'other' },
    { label: '無', value: 'none' },
  ]);
  await createQuestion('cat_video', 'recording', '錄音需求', 'dropdown', false, 40, [
    { label: '雙軌錄音', value: '2ch' },
    { label: '多軌錄音', value: 'multitrack' },
    { label: '現場錄音', value: 'live' },
    { label: '無', value: 'none' },
  ]);
  await createQuestion('cat_video', 'multitrack_interface', '多軌錄音介面需求', 'text', false, 45, [], '當選擇多軌錄音時填寫');
  await createQuestion('cat_video', 'audio_source', '收音來源', 'dropdown', false, 50, [
    { label: '舞台收音', value: 'stage' },
    { label: 'FOH主輸出', value: 'foh' },
    { label: '獨立混音', value: 'separate' },
    { label: '其他', value: 'other' },
  ]);
  await createQuestion('cat_video', 'live_stream', '直播需求', 'dropdown', false, 60, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_video', 'post_production', '後製需求', 'dropdown', false, 70, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_video', 'delivery_format', '成品格式', 'dropdown', false, 80, [
    { label: 'MP4', value: 'mp4' },
    { label: 'MOV', value: 'mov' },
    { label: 'ProRes', value: 'prores' },
    { label: '其他', value: 'other' },
  ]);
  await createQuestion('cat_video', 'video_other', '其他錄影音需求', 'textarea', false, 90, []);

  // 3. INTERCOM
  await createQuestion('cat_intercom', 'intercom_need', 'INTERCOM需求', 'dropdown', true, 10, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_intercom', 'intercom_system', '系統類型', 'dropdown', false, 20, [
    { label: '有線', value: 'wired' },
    { label: '無線', value: 'wireless' },
    { label: '有線＋無線', value: 'both' },
    { label: '無', value: 'none' },
  ]);
  await createQuestion('cat_intercom', 'intercom_wired_count', '有線數量', 'dropdown', false, 30, [
    { label: '無', value: '0' },
    { label: '2', value: '2' },
    { label: '4', value: '4' },
    { label: '6', value: '6' },
    { label: '8', value: '8' },
    { label: '10以上', value: '10_plus' },
  ]);
  await createQuestion('cat_intercom', 'intercom_wireless_count', '無線數量', 'dropdown', false, 40, [
    { label: '無', value: '0' },
    { label: '2', value: '2' },
    { label: '4', value: '4' },
    { label: '6', value: '6' },
    { label: '8', value: '8' },
    { label: '10以上', value: '10_plus' },
  ]);
  await createQuestion('cat_intercom', 'intercom_director', '是否需要導播通話', 'dropdown', false, 50, [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' },
  ]);
  await createQuestion('cat_intercom', 'intercom_channel', '是否需要獨立頻道', 'dropdown', false, 60, [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' },
  ]);
  await createQuestion('cat_intercom', 'intercom_other', '其他INTERCOM需求', 'textarea', false, 70, []);

  // 4. 投影器材
  await createQuestion('cat_projection', 'projection_need', '投影需求', 'dropdown', true, 10, [
    { label: '需要', value: 'yes' },
    { label: '不需要', value: 'no' },
  ]);
  await createQuestion('cat_projection', 'projection_count', '投影機數量', 'dropdown', false, 20, [
    { label: '1台', value: '1' },
    { label: '2台', value: '2' },
    { label: '3台', value: '3' },
    { label: '4台以上', value: '4_plus' },
  ]);
  await createQuestion('cat_projection', 'projection_resolution', '投影解析度', 'dropdown', false, 30, [
    { label: 'HD', value: 'HD' },
    { label: 'FHD', value: 'FHD' },
    { label: '4K', value: '4K' },
    { label: '其他', value: 'other' },
  ]);
  await createQuestion('cat_projection', 'projection_screen', '投影幕', 'dropdown', false, 40, [
    { label: '150吋', value: '150' },
    { label: '200吋', value: '200' },
    { label: '300吋', value: '300' },
    { label: '場地現有', value: 'venue_default' },
    { label: '自備', value: 'self' },
  ]);
  await createQuestion('cat_projection', 'projection_signal', '訊號來源', 'dropdown', false, 50, [
    { label: 'HDMI', value: 'hdmi' },
    { label: 'SDI', value: 'sdi' },
    { label: 'HDMI＋SDI', value: 'both' },
    { label: 'Type-C', value: 'type_c' },
  ]);
  await createQuestion('cat_projection', 'projection_other', '其他投影需求', 'textarea', false, 60, []);

  // 5. 其他
  await createQuestion('cat_other', 'network', '網路需求', 'dropdown', true, 10, [
    { label: '有', value: 'yes' },
    { label: '無', value: 'no' },
    { label: '專線', value: 'dedicated' },
  ]);
  await createQuestion('cat_other', 'power', '電力需求', 'dropdown', true, 20, [
    { label: '一般用電', value: 'normal' },
    { label: '大電(30A以上)', value: '30A' },
    { label: '大電(60A以上)', value: '60A' },
    { label: '特殊規格', value: 'special' },
  ]);
  await createQuestion('cat_other', 'special_equipment', '特殊器材', 'textarea', false, 30, []);
  await createQuestion('cat_other', 'other_notes', '其他特殊需求', 'textarea', false, 40, []);

  console.log('Seeding Conditional Rules...');
  await prisma.conditionalRule.create({
    data: {
      id: 'rule_video_none',
      sourceQuestionId: 'q_video_recording',
      operator: 'equals',
      sourceValue: 'none',
      action: 'hide',
      targetQuestionIds: JSON.stringify([
        'q_video_camera_count',
        'q_video_format',
        'q_recording',
        'q_multitrack_interface',
        'q_audio_source',
        'q_post_production',
        'q_delivery_format',
      ]),
      enabled: true,
    },
  });

  await prisma.conditionalRule.create({
    data: {
      id: 'rule_recording_multitrack',
      sourceQuestionId: 'q_recording',
      operator: 'equals',
      sourceValue: 'multitrack',
      action: 'show',
      targetQuestionIds: JSON.stringify(['q_multitrack_interface']),
      enabled: true,
    },
  });

  await prisma.conditionalRule.create({
    data: {
      id: 'rule_intercom_none',
      sourceQuestionId: 'q_intercom_need',
      operator: 'equals',
      sourceValue: 'no',
      action: 'hide',
      targetQuestionIds: JSON.stringify([
        'q_intercom_system',
        'q_intercom_wired_count',
        'q_intercom_wireless_count',
        'q_intercom_director',
        'q_intercom_channel',
      ]),
      enabled: true,
    },
  });

  await prisma.conditionalRule.create({
    data: {
      id: 'rule_projection_none',
      sourceQuestionId: 'q_projection_need',
      operator: 'equals',
      sourceValue: 'no',
      action: 'hide',
      targetQuestionIds: JSON.stringify([
        'q_projection_count',
        'q_projection_resolution',
        'q_projection_screen',
        'q_projection_signal',
      ]),
      enabled: true,
    },
  });

  console.log('Seeding Demo Event: 2026年度音樂會...');
  const demoEvent = await prisma.event.create({
    data: {
      id: 'evt_2026_001',
      name: '2026年度音樂會',
      eventDate: new Date('2026-09-15T00:00:00.000Z'),
      venueId: venueNCH.id,
      formUser: '王小明',
      contactPerson: '王小明',
      contactPhone: '0912-345-678',
      contactEmail: 'wang@example.com',
      notes: '大型交響樂團演出，現場需高品質錄音及4K多機錄影',
      status: 'submitted',
      createdBy: userArtist.id,
    },
  });

  const demoAnswers = [
    { qKey: 'foh', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'monitor', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'mic_wireless', val: '4', type: 'option', optVal: '4' },
    { qKey: 'di', val: '8', type: 'option', optVal: '8' },
    { qKey: 'stage_monitor', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'audio_other', val: '需要兩組無線耳監聽供指揮使用', type: 'text' },
    { qKey: 'video_recording', val: 'record_hd', type: 'option', optVal: 'record_hd' },
    { qKey: 'video_camera_count', val: '3', type: 'option', optVal: '3' },
    { qKey: 'video_format', val: 'HD', type: 'option', optVal: 'HD' },
    { qKey: 'recording', val: 'multitrack', type: 'option', optVal: 'multitrack' },
    { qKey: 'multitrack_interface', val: 'Dante 32軌多軌介面', type: 'text' },
    { qKey: 'audio_source', val: 'foh', type: 'option', optVal: 'foh' },
    { qKey: 'post_production', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'delivery_format', val: 'mov', type: 'option', optVal: 'mov' },
    { qKey: 'intercom_need', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'intercom_system', val: 'both', type: 'option', optVal: 'both' },
    { qKey: 'intercom_wired_count', val: '4', type: 'option', optVal: '4' },
    { qKey: 'intercom_wireless_count', val: '6', type: 'option', optVal: '6' },
    { qKey: 'intercom_director', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'projection_need', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'projection_count', val: '2', type: 'option', optVal: '2' },
    { qKey: 'projection_resolution', val: '4K', type: 'option', optVal: '4K' },
    { qKey: 'projection_signal', val: 'both', type: 'option', optVal: 'both' },
    { qKey: 'network', val: 'yes', type: 'option', optVal: 'yes' },
    { qKey: 'power', val: '30A', type: 'option', optVal: '30A' },
  ];

  for (const item of demoAnswers) {
    const qId = `q_${item.qKey}`;
    const qvId = `qv_${item.qKey}_01`;
    const optId = item.optVal ? `opt_${item.qKey}_${item.optVal}` : null;
    const ovId = item.optVal ? `ov_${item.qKey}_${item.optVal}_01` : null;

    await prisma.answer.create({
      data: {
        eventId: demoEvent.id,
        questionId: qId,
        questionVersionId: qvId,
        optionId: optId,
        optionVersionId: ovId,
        value: item.val,
        valueType: item.type,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
