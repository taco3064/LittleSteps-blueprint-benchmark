import type { ReactNode } from 'react';
interface BabyWikiViewProps { children: ReactNode }

export function BabyWikiView({ children }: BabyWikiViewProps) {
  return (
    <div className="screen">
      <div className="screen-body">
        <p className="text-sm text-ink-muted mb-4">
          常見嬰幼兒照顧問題與處理方式，參考台灣兒科醫學指引
        </p>

        {children}
      </div>
    </div>
  );
}
