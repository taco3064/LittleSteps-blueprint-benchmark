import type { useRadarState } from '~app/littleguard/hooks/useRadarState';

export function RadarExplanation({}: Pick<ReturnType<typeof useRadarState>, never>) {
  return (
    <section className="panel space-y-2">
      <h2>怎麼看這個板</h2>
      <p className="text-sm text-ink-muted">
        這裡是全台健保門診的就診統計。選你住的縣市和孩子的年齡，每一列會說這個病最近比前
        8 週多還是少。
      </p>
      <p className="text-sm text-ink-muted">
        它是用來提醒你這幾週多留意的，不是確診數，也不能用來判斷孩子生病了。點一列可以看平常能做什麼、什麼情況要看醫生。身體不舒服請看醫生。
      </p>
    </section>
  );
}
