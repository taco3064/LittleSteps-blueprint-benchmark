import type { ReactNode } from 'react';
import AppBar from '../AppBar';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import AppHomeButton from '../AppHomeButton';
import AccountButton from '../AccountButton';
import type { Page } from '~app/domain/routes';

interface BloomShellProps {
  title: string;
  subtitle?: string;
  /** 有值時顯示返回鍵，導向該頁；LittleBloom 首頁自己不需要 */
  backTo?: Page;
  children: ReactNode;
}

/**
 * LittleBloom 三個頁面共用的外框。
 *
 * 兩層導覽和其他子應用一致：返回鍵回到本服務首頁（`#/littlebloom`），
 * 九宮格回到所有服務的進入點。
 *
 * 版面與另外三個子應用共用 AppBar；LittleBloom 自己的個性來自
 * SERVICE_THEME 的配色（奶油底、玫瑰色標題），不再靠一條實色 header。
 */
export default function BloomShell({
  title,
  subtitle,
  backTo,
  children,
}: BloomShellProps) {
  const theme = SERVICE_THEME.littlebloom;

  return (
    <div className={`min-h-dscreen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={title}
        subtitle={subtitle}
        backTo={backTo}
        actions={(
          <>
            <AccountButton
              service="littlebloom"
              className={
                'bg-bloom-dusty-rose/15 hover:bg-bloom-dusty-rose/25 '
                + 'text-bloom-dusty-rose-ink'
              }
            />
            <AppHomeButton
              className={
                'bg-bloom-dusty-rose/15 hover:bg-bloom-dusty-rose/25 '
                + 'text-bloom-dusty-rose-ink'
              }
            />
          </>
        )}
      />

      <main className="screen-body space-y-4">{children}</main>
    </div>
  );
}
