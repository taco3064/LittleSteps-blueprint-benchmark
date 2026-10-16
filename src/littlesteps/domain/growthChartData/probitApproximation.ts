export /**
 * 反常態分布（probit）：把百分位換回 z。
 *
 * 這是 Abramowitz & Stegun 26.2.23 的有理近似，|誤差| < 4.5e-4（單位是 z）。
 * 原本的註解寫「Acklam's algorithm」，那是另一組常數、精度到 1.15e-9；
 * 名字寫錯會讓下一個人以為這裡有九位數的精度可用。
 *
 * 4.5e-4 對畫曲線綽綽有餘：實測百分位往返誤差最大 0.003 個百分點。要更準
 * 就得換成 Acklam 或 Wichura AS241，目前沒有需要。
 */
function probitApproximation(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('Percentile must be between 0 and 1 (exclusive)');
  }

  // Use symmetry for p > 0.5
  if (p > 0.5) {
    return -probitApproximation(1 - p);
  }

  // Abramowitz & Stegun 26.2.23
  const q = Math.sqrt(-2 * Math.log(p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  return -(
    q
    - (c0 + c1 * q + c2 * q * q) / (1 + d1 * q + d2 * q * q + d3 * q * q * q)
  );
}
