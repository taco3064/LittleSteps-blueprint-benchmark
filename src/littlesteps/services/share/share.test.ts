import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shareMilestone, shareText } from './share';

/**
 * jsdom 兩個 API 都沒有，所以每一條都自己裝上去再拆掉——留著會汙染別的檔案。
 */
const setShare = (impl: ((data: ShareData) => Promise<void>) | undefined) => {
  if (impl) {
    Object.defineProperty(navigator, 'share', {
      value: impl,
      configurable: true,
      writable: true,
    });
  } else {
    Reflect.deleteProperty(navigator, 'share');
  }
};

const setClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
};

describe('shareText', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setShare(undefined);
    Reflect.deleteProperty(navigator, 'clipboard');
    vi.restoreAllMocks();
  });

  it('hands the text to the system share sheet when there is one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    setShare(share);

    await expect(shareText('看診摘要', '內容')).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: '看診摘要', text: '內容' });
  });

  it('omits the url key entirely when no url is given', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    setShare(share);

    await shareText('看診摘要', '內容');

    expect(share.mock.calls[0][0]).not.toHaveProperty('url');
  });

  it('reports a cancelled share sheet as cancelled, not as a failure', async () => {
    // 使用者按取消不是錯誤。回 'failed' 的話呼叫端會跳「分享失敗，請稍後再試」。
    const abort = new Error('share cancelled');

    abort.name = 'AbortError';
    setShare(vi.fn().mockRejectedValue(abort));

    await expect(shareText('看診摘要', '內容')).resolves.toBe('cancelled');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('reports a genuine share error as a failure and logs it', async () => {
    setShare(vi.fn().mockRejectedValue(new Error('NotAllowedError')));

    await expect(shareText('看診摘要', '內容')).resolves.toBe('failed');
    expect(console.error).toHaveBeenCalled();
  });

  it('falls back to the clipboard when the browser has no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    setClipboard(writeText);

    await expect(shareText('看診摘要', '內容')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('內容');
  });

  it('appends the url when copying plain text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    setClipboard(writeText);

    await shareText('標題', '內容', 'https://example.test/');

    expect(writeText).toHaveBeenCalledWith('內容 https://example.test/');
  });

  it('reports a blocked clipboard as a failure', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('NotAllowedError')));

    await expect(shareText('標題', '內容')).resolves.toBe('failed');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('shareMilestone', () => {
  afterEach(() => {
    setShare(undefined);
    vi.restoreAllMocks();
  });

  it('shares the milestone title together with the app url', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    setShare(share);

    await expect(shareMilestone('翻身')).resolves.toBe('shared');

    expect(share).toHaveBeenCalledWith({
      title: 'LittleSteps - 育兒里程碑',
      text: '我的寶貝達成了【翻身】里程碑了！推薦給新手父母的育兒神器：',
      url: window.location.href,
    });
  });
});
