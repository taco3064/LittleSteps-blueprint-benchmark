interface LoggedDaysNoteProps {
  loggedDays: number;
  periodDays: number;
}

export /**
 * 平均只用「有記錄的日子」算。天數比整段期間少的時候要講出來，否則
 * 「平均每日」這句話的分母會悄悄換掉，而讀數字的人不知道。
 */
function LoggedDaysNote({ loggedDays, periodDays }: LoggedDaysNoteProps) {
  if (loggedDays === 0 || loggedDays >= periodDays) {
    return null;
  }

  return (
    <div className="text-xs text-ink-faint mt-0.5">
      {loggedDays}
      {' '}
      天有記錄
    </div>
  );
}
