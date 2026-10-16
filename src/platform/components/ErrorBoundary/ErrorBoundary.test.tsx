import { logEvent } from '../../services/firebase/index';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

/**
 * 這個 app 原本沒有任何 error boundary，所以 render 期間丟一次例外，整棵樹
 * 就被卸載成一片白——今天實際遇到三次。這組測試釘住「壞掉的是一頁，不是
 * 整個 app」，以及錯誤仍然會被記錄下來。
 */

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('壞掉了');
  }

  return <p>正常內容</p>;
};

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  // React 會把攔下來的例外原樣印到 console.error，測試輸出會很吵。
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('沒有錯誤時完全不介入', () => {
    render(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        scope="test"
      >
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('正常內容')).toBeInTheDocument();
  });

  it('子樹爆掉時顯示可以往下走的畫面，而不是空白', () => {
    render(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        scope="test"
      >
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: '這一頁出了點問題' }),
    ).toBeInTheDocument();

    // 家長最需要知道的是「資料還在」，其次才是怎麼繼續。
    expect(screen.getByText(/你的紀錄都還在/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /重新載入/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '回所有服務' })).toBeInTheDocument();
  });

  it('ownsMain 時，錯誤畫面自己就是那一頁的 <main>', () => {
    render(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        scope="littleguard"
        ownsMain
      >
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    // 自帶版面的路由，<main> 是頁面自己畫的，而壞掉的正是那個頁面：
    // 少了這一層，錯誤畫面會是一頁沒有任何地標可以跳的內容。
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('外框已經提供 <main> 時不再多一個', () => {
    render(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        scope="littlesteps/report"
      >
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    // 巢狀的兩個 main 和一個都沒有一樣是錯的。
    expect(screen.queryAllByRole('main')).toHaveLength(0);
  });

  it('把錯誤記下來，而不是安靜吞掉', () => {
    render(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        scope="littlesteps/clinic-summary"
      >
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    // 線上的白畫面沒有人會回報，只會被關掉；沒有這行就永遠查不到。
    expect(
      consoleError.mock.calls.some((call) =>
        String(call[0]).includes('littlesteps/clinic-summary'),
      ),
    ).toBe(true);
  });

  it('換頁後不會被困在錯誤畫面——key 一變就重新掛載', () => {
    const { rerender } = render(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        key="page-a"
        scope="page-a"
      >
        <Boom shouldThrow />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: '這一頁出了點問題' }),
    ).toBeInTheDocument();

    rerender(
      <ErrorBoundary
        onHome={() => window.history.pushState({}, '', '/')}
        onReport={(scope, error) =>
          logEvent('render_error', { scope, message: error.message?.slice(0, 200) })}
        key="page-b"
        scope="page-b"
      >
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('正常內容')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '這一頁出了點問題' })).toBeNull();
  });
});
