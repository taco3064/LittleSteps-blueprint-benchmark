import {
  useChildForm,
  type ChildFieldProps,
  type ChildModalMode,
  type AddChildModalProps,
} from './useChildForm';
import { Gender } from '~app/domain/records';
import { GESTATIONAL_AGE_RANGE } from '~app/domain/correctedAge';
import { CHILD_NAME_LIMIT } from '~app/domain/recordLimits';
import ModalFrame from '../ModalFrame';
export type { ChildSaveInput } from './useChildForm';

const FIELD
  = 'w-full min-h-tap px-4 py-3 rounded-2xl border '
    + 'border-ink/15 text-ink placeholder-ink-faint '
    + 'transition-colors';

const LABEL = 'block text-sm font-medium text-ink mb-1';

export default function AddChildModal({
  isOpen,
  onClose,
  onSave,
  onJoin,
  editingChild,
  onDelete,
  modes = ['create', 'join'],
  accent = 'bg-primary-dark',
  accentText = 'text-white',
}: AddChildModalProps) {
  const { mode, setMode, form, setField, saving, error, handleSubmit } = useChildForm({
    isOpen,
    onClose,
    onSave,
    onJoin,
    editingChild,
    modes,
  });

  // 只有一種選擇時不畫分頁——LittleBloom 只建孕期檔案，一顆孤零零的
  // 「懷孕中」按鈕沒有在選什麼。
  const available = modes.filter((m) => m !== 'join' || onJoin);
  const showModeSelector = !editingChild && available.length > 1;

  const { title, submitLabel } = modalLabels(mode, editingChild);

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={title} closeDisabled={saving}>
      {showModeSelector && (
        <div className="flex gap-2 mb-5">
          {available.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={`flex-1 min-h-tap px-3 rounded-2xl text-sm font-medium transition-colors ${
                mode === id
                  ? `${accent} ${accentText}`
                  : 'bg-ink/5 text-ink-muted hover:bg-ink/10'
              }`}
            >
              {MODE_LABELS[id]}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'create'
          ? (
              <ChildFields form={form} setField={setField} editingChild={editingChild} />
            )
          : mode === 'pregnancy'
            ? (
                <PregnancyFields form={form} setField={setField} />
              )
            : (
                <div>
                  <label htmlFor="childUuid" className={LABEL}>
                    寶寶代碼
                  </label>
                  <input
                    type="text"
                    id="childUuid"
                    value={form.childUuid}
                    onChange={(e) =>
                      setField('childUuid', e.target.value)}
                    className={`${FIELD} font-mono text-sm`}
                    placeholder="例如: 1234abcd-..."
                    required
                  />
                </div>
              )}

        {error && (
          <p
            role="alert"
            className="text-sm text-primary-dark bg-primary-light rounded-2xl px-4 py-3"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`btn-primary w-full disabled:opacity-60 ${accent} ${accentText}`}
        >
          {saving ? '儲存中…' : submitLabel}
        </button>
      </form>

      {editingChild && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="btn-ghost w-full mt-2 text-primary-dark hover:bg-primary-light"
        >
          刪除這位寶寶的資料
        </button>
      )}
    </ModalFrame>
  );
}

function modalLabels(
  mode: ChildModalMode,
  editingChild: AddChildModalProps['editingChild'],
) {
  const title = editingChild
    ? '編輯寶寶資料'
    : mode === 'create'
      ? '新增寶寶'
      : mode === 'pregnancy'
        ? '新增孕期'
        : '加入寶寶';

  const submitLabel = editingChild
    ? '儲存修改'
    : mode === 'create'
      ? '新增寶寶'
      : mode === 'pregnancy'
        ? '開始追蹤孕期'
        : '加入寶寶';

  return { title, submitLabel };
}

function ChildFields({ form, setField, editingChild }: ChildFieldProps) {
  return (
    <>
      <div>
        <label htmlFor="childName" className={LABEL}>
          寶寶姓名
        </label>
        <input
          type="text"
          id="childName"
          value={form.name}
          onChange={(e) =>
            setField('name', e.target.value)}
          className={FIELD}
          placeholder="例如: 小寶"
          // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，表單只會說
          // 「請確認網路」。孕期表單的小名寫的是同一個欄位，所以用同一個數。
          maxLength={CHILD_NAME_LIMIT}
          required
        />
      </div>
      <div>
        <label htmlFor="childBirthday" className={LABEL}>
          {/* 孕期檔案的這個欄位存的是預產期。標成「寶寶生日」會讓家長
                    以為填錯了，或者不敢改。 */}
          {editingChild?.isPregnancy ? '預產期' : '寶寶生日'}
        </label>
        <input
          type="date"
          id="childBirthday"
          value={form.birthday}
          onChange={(e) =>
            setField('birthday', e.target.value)}
          className={FIELD}
          required
        />
      </div>
      <div>
        <label htmlFor="childGender" className={LABEL}>
          寶寶性別
        </label>
        <select
          id="childGender"
          value={form.gender}
          onChange={(e) =>
            setField('gender', e.target.value as Gender | '')}
          className={FIELD}
        >
          <option value="">請選擇性別（選填）</option>
          <option value="male">男生</option>
          <option value="female">女生</option>
        </select>
      </div>
      <GestationalFields form={form} setField={setField} />
    </>
  );
}

function GestationalFields({ form, setField }: ChildFieldProps) {
  return (
    <>
      {/*
              早產週數。放在最後、標明選填、預設留空：九成的家長不必理它，
              而填了的那一成才拿得到正確的百分位與里程碑（見
              common/correctedAge）。只在建立／編輯寶寶時出現，孕期檔案還沒
              有出生週數可填。
            */}
      <div>
        <label htmlFor="childGestationalWeeks" className={LABEL}>
          出生時的週數（選填）
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            id="childGestationalWeeks"
            inputMode="numeric"
            min={GESTATIONAL_AGE_RANGE.minWeeks}
            max={GESTATIONAL_AGE_RANGE.maxWeeks}
            value={form.gestationalWeeks}
            onChange={(e) =>
              setField('gestationalWeeks', e.target.value)}
            placeholder="32"
            className={FIELD}
          />
          <span className="text-sm text-ink-muted shrink-0">週</span>
          <input
            type="number"
            id="childGestationalDays"
            inputMode="numeric"
            min={0}
            max={6}
            value={form.gestationalDays}
            onChange={(e) =>
              setField('gestationalDays', e.target.value)}
            placeholder="0"
            className={FIELD}
            aria-label="出生時的天數"
          />
          <span className="text-sm text-ink-muted shrink-0">天</span>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          足月（37
          週以上）可以不填。早產寶寶填了之後，生長曲線與發展檢核會改用矯正年齡。
        </p>
      </div>
    </>
  );
}

function PregnancyFields({ form, setField }: ChildFieldProps) {
  return (
    <>
      <div>
        <label htmlFor="pregnancyName" className={LABEL}>
          寶寶小名 (選填)
        </label>
        <input
          type="text"
          id="pregnancyName"
          value={form.name}
          onChange={(e) =>
            setField('name', e.target.value)}
          className={FIELD}
          placeholder="例如: 小花苞"
          maxLength={CHILD_NAME_LIMIT}
        />
      </div>
      <div>
        <label htmlFor="dueDate" className={LABEL}>
          預產期
        </label>
        <input
          type="date"
          id="dueDate"
          value={form.dueDate}
          onChange={(e) =>
            setField('dueDate', e.target.value)}
          className={FIELD}
          required
        />
      </div>
    </>
  );
}

const MODE_LABELS: Record<ChildModalMode, string> = {
  create: '寶寶',
  pregnancy: '懷孕中',
  join: '加入',
};
