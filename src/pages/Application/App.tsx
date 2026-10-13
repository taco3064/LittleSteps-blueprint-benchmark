import ApplicationShell from '~app/containers/ApplicationShell';
import { AuthProvider } from '~app/containers/AuthProvider';
import { ChildStoreProvider } from '~app/containers/ChildStoreProvider';
import ErrorBoundary from '~app/containers/ErrorBoundary';
import { ToastProvider } from '~app/containers/Toast';

function App() {
  return (
    // 外層這道攔的是頁首、側邊欄、context provider 之類的外框錯誤——那些
    // 在 <main> 之外，裡面那道 boundary 看不到。上面沒有任何一層會給地標，
    // 所以這道的錯誤畫面自己就是整頁的 <main>。
    <ErrorBoundary scope="app" ownsMain>
      {/* Toast 在最外層：AuthProvider 自己也會回報登入失敗。 */}
      <ToastProvider>
        <AuthProvider>
          {/* 孩子資料與帳號一樣是全站脈絡：五個服務的 AppBar 都要拿得到，
            不然登出與切換寶寶就只會存在於能拿到 prop 的那一個服務裡。 */}
          <ChildStoreProvider>
            <ApplicationShell />
          </ChildStoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
