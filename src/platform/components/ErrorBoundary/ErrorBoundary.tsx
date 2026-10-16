import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReport: (scope: string, error: Error) => void;
  onHome: () => void;
  /** 記到 analytics 時用來分辨是哪一層攔到的。 */
  scope: string;
  /**
   * 這個 fallback 要不要當成整頁的 <main>。
   *
   * 錯誤畫面出現的那一刻，它就是整頁的內容，所以自帶版面的 standalone 路由
   * 壞掉時由這裡補上地標——那些路由的 <main> 是頁面自己畫的，而壞掉的正是
   * 那個頁面。反之外框已經提供 <main> 時必須維持 false：巢狀的兩個 main 和
   * 一個都沒有一樣是錯的。
   */
  ownsMain?: boolean;
}

interface ErrorBoundaryState {
  message: string | null;
}

/**
 * 一頁壞掉不該讓整個 app 變成白畫面。
 *
 * 這個 app 原本沒有任何 error boundary，所以任何 render 期間的例外都會把整棵
 * 樹卸載——實際發生過三次：看診摘要讀一個 Firebase 沒存的空物件、成長百分位
 * 在沒有性別時不存在。家長看到的是一片空白，沒有任何說明，也沒有下一步。
 *
 * 例外照樣往 console 與 analytics 送，這裡不是把錯誤藏起來，是讓它只損失一頁。
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { message: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.scope}] 畫面發生錯誤:`, error, info.componentStack);
    // 沒有這一行的話，線上的白畫面完全查不到——使用者不會回報，只會關掉。
    this.props.onReport(this.props.scope, error);
  }

  render() {
    if (this.state.message === null) {
      return this.props.children;
    }

    const Frame = this.props.ownsMain ? 'main' : 'div';

    return (
      <Frame className="screen">
        <div className="screen-body">
          <div className="card text-center">
            <h2 className="mb-2">這一頁出了點問題</h2>
            <p className="text-sm text-ink-muted mb-1">
              你的紀錄都還在，只是這一頁沒能正確顯示。
            </p>
            <p className="text-sm text-ink-muted mb-5">重新載入通常就好了。</p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                <RefreshCw className="w-5 h-5" />
                <span>重新載入</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  // 直接改網址再整頁載入：目前這棵樹已經壞了，用 SPA 換頁
                  // 不保證救得回來。
                  this.props.onHome();
                  window.location.reload();
                }}
                className="btn-ghost w-full"
              >
                回所有服務
              </button>
            </div>
          </div>
        </div>
      </Frame>
    );
  }
}
