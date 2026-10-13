import { formatDate, formatDuration, formatTime } from '../dateHelpers';
import type { ClinicSummaryData } from './types';

export function genderText(gender?: string): string {
  if (gender === 'male') {
    return '男';
  }

  if (gender === 'female') {
    return '女';
  }

  return '未設定';
}

/** 沒有性別就算不出百分位，所以這個括號常常是空的 */
function percentileText(value?: number): string {
  return value === undefined ? '' : `（P${Math.round(value)}）`;
}

/**
 * 把整份摘要攤成純文字，好經由系統分享面板或剪貼簿交出去。
 *
 * 這一頁號稱「一鍵產生看診資料」，但在此之前沒有任何帶得走的出口：家長只能
 * 把手機拿給醫師看，或是自己重打一遍。`notes` 是「特殊事項」欄裡當下打的字，
 * 沒有存進資料庫，所以只有這裡能把它帶出去。
 */
export function buildClinicSummaryText(
  data: ClinicSummaryData,
  notes: string,
): string {
  const lines: string[] = [
    `【看診摘要】${data.childName}`,
    `產生時間：${formatDate(data.generatedAt)} ${formatTime(data.generatedAt)}`,
    '',
    '■ 基本資料',
    `性別：${genderText(data.gender)}`,
    `生日：${formatDate(data.birthday)}`,
    `年齡：${data.ageDisplay}`,
  ];

  // 百分位是用矯正年齡算的，所以矯正年齡要跟著出現在同一段裡。
  if (data.correctedAgeDisplay) {
    lines.push(
      `出生週數：${data.gestationalAge ?? '早產'}`,
      `矯正年齡：${data.correctedAgeDisplay}（生長百分位以此計算）`,
    );
  }

  appendGrowth(data, lines);
  appendVaccines(data, lines);
  appendWeek(data, lines);

  if (data.healthTimeline.length > 0) {
    lines.push('', '■ 完整健康紀錄');

    data.healthTimeline.forEach((event) => {
      const where = event.location ? `（${event.location}）` : '';

      lines.push(`${event.date || '未記日期'} ${event.title}${where}`);
    });
  }

  const trimmedNotes = notes.trim();

  if (trimmedNotes) {
    lines.push('', '■ 特殊事項', trimmedNotes);
  }

  return lines.join('\n');
}

function appendGrowth(data: ClinicSummaryData, lines: string[]) {
  if (data.latestGrowth) {
    const { date, weight, height, headCircumference, percentile }
      = data.latestGrowth;

    lines.push('', `■ 最新測量（${formatDate(date)}）`);

    if (weight !== undefined) {
      lines.push(`體重：${weight} kg${percentileText(percentile?.weight)}`);
    }

    if (height !== undefined) {
      lines.push(`身高：${height} cm${percentileText(percentile?.height)}`);
    }

    if (headCircumference !== undefined) {
      lines.push(
        `頭圍：${headCircumference} cm${percentileText(percentile?.headCircumference)}`,
      );
    }
  }
}

function appendVaccines(data: ClinicSummaryData, lines: string[]) {
  lines.push('', '■ 疫苗紀錄');

  if (data.administeredVaccines.length === 0) {
    lines.push('尚無接種紀錄');
  } else {
    data.administeredVaccines.forEach((vaccine) => {
      lines.push(
        `${vaccine.name} 第 ${vaccine.dose} 劑：${vaccine.date ? formatDate(vaccine.date) : '日期未記錄'}`,
      );
    });
  }

  if (data.nextVaccine) {
    lines.push(
      `下一劑：${data.nextVaccine.name}（第 ${data.nextVaccine.doseNumber} 劑），建議時間：${data.nextVaccine.timing}`,
    );
  }

  if (data.unrecordedNationalDoses !== undefined) {
    lines.push(
      `尚有 ${data.unrecordedNationalDoses} 劑公費疫苗沒有記錄，沒有記錄不代表沒打，可對照兒童健康手冊補登`,
    );
  }
}

function appendWeek(data: ClinicSummaryData, lines: string[]) {
  // 每一行都自己帶分母。醫師讀到的是「三天記錄算出來的平均」還是「七天」，
  // 差別很大，而這份文字會被貼到診間外的通訊軟體裡，沒有畫面上的說明可看。
  const week = data.weekSummary;

  lines.push(
    '',
    `■ 近 7 天日常摘要（${week.loggedDays} 天有記錄）`,
    week.feedingDays > 0
      ? `每日平均餵奶：${week.avgFeedingCount} 次、${week.avgFeedingAmount} ml（${week.feedingDays} 天有記錄）`
      : '每日平均餵奶：無記錄',
    week.sleepDays > 0
      ? `每日平均睡眠：${week.avgSleepHours} 小時（${week.sleepDays} 天有記錄）`
      : '每日平均睡眠：無記錄',
    `最長連續睡眠：${week.longestSleep > 0 ? formatDuration(week.longestSleep) : '無紀錄'}`,
    week.diaperDays > 0
      ? `每日平均便便次數：${week.avgPoopCount} 次（${week.diaperDays} 天有記錄）`
      : '每日平均便便次數：無記錄',
    `最後一次便便：${week.lastPoopTime ? `${formatDate(week.lastPoopTime)} ${formatTime(week.lastPoopTime)}` : '無紀錄'}`,
  );
}
