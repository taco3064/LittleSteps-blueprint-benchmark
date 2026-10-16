interface StatCardProps {
  label: string;
  value: string;
  small?: boolean;
  /** 這個數字用幾天的記錄算出來的。醫師看到的是平均，得看得到分母。 */
  loggedDays?: number;
}

export function StatCard({ label, value, small, loggedDays }: StatCardProps) {
  return (
    <div className="bg-warm-white rounded-xl p-3">
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <p className={`font-bold text-ink ${small ? 'text-sm' : 'text-lg'}`}>
        {value}
      </p>
      {loggedDays !== undefined && loggedDays > 0 && (
        <p className="text-xs text-ink-faint mt-0.5">
          {loggedDays}
          {' '}
          天有記錄
        </p>
      )}
    </div>
  );
}
