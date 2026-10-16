import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { goTo } from '~app/portal/services/navigate/index';
import ServiceLanding from './ServiceLanding';

/**
 * Every service must be able to introduce itself to someone with no account.
 * Before this page existed, a logged-out visitor hit one blanket wall showing
 * LittleSteps' landing no matter which service they had asked for.
 */
describe('ServiceLanding', () => {
  const SERVICES = [
    {
      id: 'littlebloom',
      name: 'LittleBloom',
      publicLink: '先看孕期知識庫',
      path: '/littlebloom/wiki',
    },
    {
      id: 'littleexplorer',
      name: 'LittleExplorer',
      publicLink: '先看幼兒百科',
      path: '/littleexplorer/wiki',
    },
  ] as const;

  it.each(SERVICES)('$name 介紹自己並提供登入', async ({ id, name }) => {
    const user = userEvent.setup();
    const onSignIn = vi.fn(async () => {});

    render(
      <ServiceLanding onNavigate={goTo} service={id} onSignIn={onSignIn} />,
    );

    expect(screen.getByRole('heading', { name })).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /使用 Google 登入開始使用/ }),
    );

    expect(onSignIn).toHaveBeenCalled();
  });

  it.each(SERVICES)(
    '$name 提供不需登入就能看的內容入口',
    async ({ id, publicLink, path }) => {
      const user = userEvent.setup();

      window.history.replaceState(null, '', '/');

      render(
        <ServiceLanding onNavigate={goTo} service={id} onSignIn={vi.fn()} />,
      );

      await user.click(
        screen.getByRole('button', { name: new RegExp(publicLink) }),
      );

      expect(window.location.pathname).toBe(path);
    },
  );

  it.each(SERVICES)('$name 可回到服務集合的進入點', async ({ id }) => {
    const user = userEvent.setup();

    window.history.replaceState(null, '', '/littleexplorer');

    render(
      <ServiceLanding onNavigate={goTo} service={id} onSignIn={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: '所有服務' }));

    expect(window.location.pathname).toBe('/');
  });

  /**
   * 同 StepsLanding：這一頁在 App.tsx 的 isStandaloneLanding 那裡就先回傳了，
   * 外框的 <main> 走不到，所以少了自己這一層就整頁沒有地標。banner 是零，因為
   * 這一頁的 chrome 只有一顆回服務集合首頁的連結。
   */
  it.each(SERVICES)('$name 恰好一個 main 地標，而且沒有 banner', ({ id }) => {
    render(
      <ServiceLanding onNavigate={goTo} service={id} onSignIn={vi.fn()} />,
    );

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.queryAllByRole('banner')).toHaveLength(0);
  });

  it('說明哪些功能需要登入，哪些不用', () => {
    render(
      <ServiceLanding
        onNavigate={goTo}
        service="littleexplorer"
        onSignIn={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        /記錄功能需要登入才能跨裝置同步，知識內容不需登入即可閱讀/,
      ),
    ).toBeInTheDocument();
  });
});
