import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const rules = JSON.parse(
  readFileSync(join(ROOT, 'database.rules.json'), 'utf8'),
).rules;

/**
 * 孩子資料的授權邊界。
 *
 * 兩件事在這裡被釘住：
 *
 * 1. children/$childId 的 .read 曾經是 auth != null——任何登入者只要有 UUID 就
 *    讀得到別人孩子的完整健康紀錄，而這個 app 的共享機制正是把 UUID 傳給對方
 *    （見 ShareChildUuidModal）。隔離靠的是 UUID 猜不到，而 UUID 會流過聊天
 *    軟體和截圖。「這個代碼存不存在」因此被拆成只放布林值的公開節點 childIndex。
 *
 * 2. 授權曾經住在 users/$uid/childrenIds，而那份節點只有本人寫得動。代碼一旦
 *    給出去就永遠收不回來，唯一的補救是把紀錄整份刪掉、連另一位家長的一起。
 *    成員名單搬進孩子本體之後，任何一位成員都能把另一位移掉。
 *
 * 這組測試能證明什麼、不能證明什麼要說清楚：它讀的是 database.rules.json 的
 * 文字，證明「我們打算要的規則沒有被改掉」。規則實際怎麼執行由 emulator 那組
 * （scripts/testRules.cjs）負責，客戶端走哪些路徑則由各 hook 自己的測試負責。
 */

/** 成員資格在孩子本體上，用 data（這個節點自己）查。 */
const MEMBER_OF_THIS_NODE = "data.child('members').child(auth.uid).val() === true";

/** 別的子樹要繞 root 回來查同一份名單。 */
const MEMBER_VIA_ROOT =
  "root.child('children').child($childId).child('members').child(aut" +
  'h.uid).val() === true';

describe('孩子本體：成員才讀得到', () => {
  it('.read 要求成員身分，不是「有登入就好」', () => {
    expect(rules.children.$childId['.read']).toBe(MEMBER_OF_THIS_NODE);
  });

  it('.write 只有成員，或把自己寫進成員名單的那次建立', () => {
    // 建立當下還沒有成員資格，所以保留 !data.exists()；但那一筆必須自己就是
    // 成員，否則會留下一個沒有人碰得到的節點。
    expect(rules.children.$childId['.write']).toContain(MEMBER_OF_THIS_NODE);
    expect(rules.children.$childId['.write']).toContain('!data.exists()');

    expect(rules.children.$childId['.write']).toContain(
      "newData.child('members').child(auth.uid).val() === true",
    );
  });

  it('沒有 members 的孩子節點寫不進去', () => {
    // 授權的唯一來源就是這個欄位。少了它，那份健康紀錄誰都讀不到、也刪不掉。
    expect(rules.children.$childId['.validate']).toContain('members');
    expect(rules.children.$childId['.validate']).toContain('createdBy');
  });

  it('joinOpen 必須是布林值', () => {
    // 分享視窗的開關讀的就是這個欄位；存成字串或缺著，開關的狀態就是一個謊。
    expect(rules.children.$childId.joinOpen['.validate']).toBe('newData.isBoolean()');
  });
});

describe('成員名單：加得進來，也收得回去', () => {
  const memberRule = rules.children.$childId.members.$memberUid['.write'];

  it('非成員也寫得了自己那一筆，否則沒有人加入得了', () => {
    expect(memberRule).toContain('$memberUid === auth.uid');
  });

  it('既有成員可以移除別人——這就是「收回分享」', () => {
    expect(memberRule).toContain('data.parent().child(auth.uid).val() === true');
  });

  it('成員數不歸零：任何一筆刪除都要求寫入後名單上還有人', () => {
    // 沒有任何成員的孩子節點誰都讀不到、也刪不掉。這一條原本是靠點名
    // createdBy 來守的，而那把家長綁在帳號上——他為別人建的檔案只要對方還在
    // 用，他就永遠刪不掉自己的帳號——同時還漏掉「建立者走掉之後，最後一位
    // 成員照樣刪得掉自己」。改成看寫入後的名單，一條式子守住同一個不變量。
    expect(memberRule).toContain(
      'newData.exists() || newData.parent().hasChildren()',
    );

    expect(memberRule).not.toContain('createdBy');
  });

  it('把自己加進一份還沒加入過的名單，要對方開著 joinOpen', () => {
    // 沒有這一段，流出去的舊代碼永遠有效，關掉共享等於沒關。
    expect(memberRule).toContain(
      "root.child('children').child($childId).child('joinOpen').val() === true",
    );
  });
});

describe('紀錄子樹與公開索引都跟著同一份名單', () => {
  it('childRecords 的讀寫都繞 root 查孩子的成員名單', () => {
    // 日誌、日記與成長紀錄搬出孩子本體之後，授權必須還是同一份名單，
    // 否則收回共享收不到那三份——而那三份才是健康紀錄的主體。
    expect(rules.childRecords.$childId['.read']).toBe(MEMBER_VIA_ROOT);
    expect(rules.childRecords.$childId['.write']).toBe(MEMBER_VIA_ROOT);
  });

  it('childIndex 公開可讀，但只有成員能寫', () => {
    expect(rules.childIndex.$childId['.read']).toBe('auth != null');
    expect(rules.childIndex.$childId['.write']).toBe(MEMBER_VIA_ROOT);
  });

  it('users 仍然只有本人讀得到，寫入權逐個欄位給，整個節點不再有 .write', () => {
    // childrenIds 留著，但只是「我要訂閱哪幾個孩子」的索引，不再是授權來源。
    // 節點層級的 .write 曾經讓本人刪得掉自己的 lastFeedbackAt（validate 不會對
    // 刪除跑），一分鐘一則的限制就從一個請求變成兩個。現在刪除只在戳記過了
    // 節流窗口之後才放行：過期的戳記刪掉換不到任何一則額外的回饋，而刪帳號
    // 需要清得掉它。
    const owner = '$userId === auth.uid';
    const user = rules.users.$userId;

    expect(user['.read']).toBe(owner);
    expect(user['.write']).toBeUndefined();
    expect(user.childrenIds['.write']).toBe(owner);
    expect(user.currentChildId['.write']).toBe(owner);

    expect(user.lastFeedbackAt['.write']).toBe(
      `${owner} && (newData.exists() || !data.exists() || data.val() + 60000 <= now)`,
    );
  });
});
