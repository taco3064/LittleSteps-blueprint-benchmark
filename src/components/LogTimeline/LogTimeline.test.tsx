import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { DailyLog } from '~app/domain/records';
import LogTimeline from './LogTimeline';
import {
  getConsistencyLabel,
  getDiaperTypeLabel,
  getFeedingTypeLabel,
} from '~app/domain/logHelpers';

/**
 * 餵奶、睡眠、換尿布本來就是兩個人輪流做的事，孩子也可以用 joinChild 共享，
 * 但先前沒有一筆紀錄留下是誰記的——「上一餐誰餵的」在 app 裡問不出答案。
 *
 * 只標別人記的那幾筆：一個人自己用的時候，每一列都掛上自己的名字只是噪音。
 */

const log = (over: Partial<DailyLog> = {}): DailyLog =>
  ({
    id: 'l1',
    childId: 'c1',
    type: 'feeding',
    timestamp: new Date().toISOString(),
    data: { method: 'formula', amount: 120 },
    createdAt: new Date().toISOString(),
    ...over,
  }) as DailyLog;

const noop = () => {};

describe('擠奶那一列', () => {
  const pumping: DailyLog = {
    id: 'p1',
    childId: 'c1',
    type: 'feeding',
    timestamp: new Date().toISOString(),
    data: { feedingType: 'pumping', amount: 150, duration: 20, side: 'left' },
    createdAt: new Date().toISOString(),
  };

  it('標成擠奶而不是餵奶，而且不重複印一次類型', () => {
    render(<LogTimeline logs={[pumping]} onEdit={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('擠奶')).toBeInTheDocument();
    expect(screen.queryByText('餵奶')).toBeNull();
    expect(screen.getByText('左側 · 20分鐘 · 150ml')).toBeInTheDocument();
  });

  /*
    這一列的圖示是家長在一長串混排的紀錄裡「找餵奶」用的，所以它掛錯了就會把
    她停在自己的擠奶紀錄上。測的是「哪一個字形」——只驗「有一個 svg」的話，
    把水滴換回奶瓶也照樣會過。Lucide 每個圖示都帶 `lucide-<name>` class，那是
    區分得出字形的唯一把手。
  */
  it('不掛餵奶的奶瓶，掛的是擠出來的那個字形', () => {
    const { container } = render(
      <LogTimeline logs={[pumping]} onEdit={() => {}} onDelete={() => {}} />,
    );

    expect(container.querySelector('.lucide-milk')).toBeNull();
    expect(container.querySelector('.lucide-droplets')).toBeInTheDocument();
  });

  it('真的餵進去的那幾筆還是奶瓶', () => {
    const { container } = render(
      <LogTimeline
        logs={[{ ...pumping, id: 'f1', data: { feedingType: 'formula', amount: 120 } }]}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(container.querySelector('.lucide-milk')).toBeInTheDocument();
    expect(container.querySelector('.lucide-droplets')).toBeNull();
  });

  it('瓶餵母乳仍然標成餵奶，並跟配方奶區分得出來', () => {
    const bottle: DailyLog = {
      ...pumping,
      id: 'b1',
      data: { feedingType: 'breast_milk_bottle', amount: 120 },
    };

    render(<LogTimeline logs={[bottle]} onEdit={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('餵奶')).toBeInTheDocument();

    expect(
      screen.getByText(`${getFeedingTypeLabel('breast_milk_bottle')} · 120ml`),
    ).toBeInTheDocument();
  });
});

/*
  時間軸曾經自己帶一份標籤（母乳雙側、大小便都有、軟便），於是同一筆紀錄在
  重複卡與時間軸上寫著兩種字。這幾個測試比對的是共用的那一份，所以任何人再
  在這個元件裡寫一份私有的對照表，就會在這裡壞掉。
*/
describe('時間軸的用字', () => {
  const diaper: DailyLog = {
    id: 'd1',
    childId: 'c1',
    type: 'diaper',
    timestamp: new Date().toISOString(),
    data: { type: 'both', consistency: 'soft' },
    createdAt: new Date().toISOString(),
  };

  it('尿布那一列用的是共用的標籤', () => {
    render(<LogTimeline logs={[diaper]} onEdit={noop} onDelete={noop} />);

    expect(
      screen.getByText(
        `${getDiaperTypeLabel('both')} · ${getConsistencyLabel('soft')}`,
      ),
    ).toBeInTheDocument();
  });

  it('只有小便時不印性狀——那一欄只對大便有意義', () => {
    render(
      <LogTimeline
        logs={[{ ...diaper, data: { type: 'pee', consistency: 'soft' } }]}
        onEdit={noop}
        onDelete={noop}
      />,
    );

    expect(screen.getByText(getDiaperTypeLabel('pee'))).toBeInTheDocument();
  });
});

describe('LogTimeline 的記錄者', () => {
  it('別人記的會標出是誰', () => {
    render(
      <LogTimeline
        logs={[log({ createdBy: 'partner', createdByName: '爸爸' })]}
        onEdit={noop}
        onDelete={noop}
        currentUserId="me"
      />,
    );

    expect(screen.getByText('由 爸爸 記錄')).toBeInTheDocument();
  });

  it('自己記的不標——每一列都寫自己的名字只是噪音', () => {
    render(
      <LogTimeline
        logs={[log({ createdBy: 'me', createdByName: '媽媽' })]}
        onEdit={noop}
        onDelete={noop}
        currentUserId="me"
      />,
    );

    expect(screen.queryByText(/記錄$/)).toBeNull();
  });

  it('舊紀錄沒有這個欄位時什麼都不猜', () => {
    // 加這個欄位之前寫進去的紀錄不帶 createdBy，不能因為缺值就當成別人記的。
    render(
      <LogTimeline logs={[log()]} onEdit={noop} onDelete={noop} currentUserId="me" />,
    );

    expect(screen.queryByText(/記錄$/)).toBeNull();
  });

  it('只有 uid 沒有名字時也不顯示——顯示一串 uid 對家長毫無意義', () => {
    render(
      <LogTimeline
        logs={[log({ createdBy: 'partner' })]}
        onEdit={noop}
        onDelete={noop}
        currentUserId="me"
      />,
    );

    expect(screen.queryByText(/記錄$/)).toBeNull();
  });
});

describe('看得到別的日子', () => {
  const dayOf = (d: Date, hour: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 40).toISOString();

  it('半夜打開時，昨天深夜那一餐不會消失', () => {
    // 原本的 bug：這一頁硬寫成 new Date()，00:10 打開就看不到 23:40 那一餐，
    // 而那正是新生兒餵奶最常發生的時間。
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    render(
      <LogTimeline
        logs={[log({ timestamp: dayOf(yesterday, 23) })]}
        onEdit={noop}
        onDelete={noop}
        date={yesterday}
      />,
    );

    expect(screen.getByText('餵奶')).toBeInTheDocument();
  });

  it('只顯示指定那一天的紀錄', () => {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    render(
      <LogTimeline
        logs={[
          log({ id: 'y', timestamp: dayOf(yesterday, 23) }),
          log({
            id: 't',
            type: 'diaper',
            data: { type: 'pee' },
            timestamp: dayOf(new Date(), 9),
          }),
        ]}
        onEdit={noop}
        onDelete={noop}
        date={yesterday}
      />,
    );

    expect(screen.getByText('餵奶')).toBeInTheDocument();
    expect(screen.queryByText('尿布')).toBeNull();
  });

  it('過去的空白日子不會叫人去按按鈕——按鈕記的是現在', () => {
    const lastWeek = new Date();

    lastWeek.setDate(lastWeek.getDate() - 7);

    render(<LogTimeline logs={[]} onEdit={noop} onDelete={noop} date={lastWeek} />);

    expect(screen.getByText('這天沒有記錄')).toBeInTheDocument();
    expect(screen.queryByText(/開始記錄吧/)).toBeNull();
  });
});

describe('編輯別人的紀錄', () => {
  it('不會把記錄者換成自己', () => {
    // handleSave 只在新增時蓋上記錄者；改一筆別人記的紀錄不該把它變成自己記的。
    const onEdit = vi.fn();
    const partnerLog = log({ createdBy: 'partner', createdByName: '爸爸' });

    render(
      <LogTimeline
        logs={[partnerLog]}
        onEdit={onEdit}
        onDelete={noop}
        currentUserId="me"
      />,
    );

    screen.getByLabelText(/編輯/).click();

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'partner', createdByName: '爸爸' }),
    );
  });
});
