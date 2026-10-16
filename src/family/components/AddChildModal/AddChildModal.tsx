import type { Gender } from '~app/family/domain/familyRecords';
import { GESTATIONAL_AGE_RANGE } from '~app/family/domain/correctedAge';
import { CHILD_NAME_LIMIT } from '~app/family/domain/recordLimits';
import ModalFrame from '~app/platform/components/ModalFrame';
import type { useAddChildModal } from '~app/family/hooks/useAddChildModal';

const FIELD
  = 'w-full min-h-tap px-4 py-3 rounded-2xl border'
    + ' border-ink/15 text-ink placeholder-ink-faint'
    + ' transition-colors';

const LABEL = 'block text-sm font-medium text-ink mb-1';

export default function AddChildModalView({
  isOpen,
  onClose,
  editingChild,
  onDelete,
  accent,
  accentText,
  mode,
  setMode,
  name,
  setName,
  birthday,
  setBirthday,
  dueDate,
  setDueDate,
  gender,
  setGender,
  childUuid,
  setChildUuid,
  gestationalWeeks,
  setGestationalWeeks,
  gestationalDays,
  setGestationalDays,
  saving,
  error,
  handleSubmit,
  MODE_LABELS,
  available,
  showModeSelector,
  title,
  submitLabel,
}: NonNullable<ReturnType<typeof useAddChildModal>>) {
  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={title} closeDisabled={saving}>
      {showModeSelector && (
        <AddChildModalSection1
          {...{ accent, accentText, mode, setMode, MODE_LABELS, available }}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'create'
          ? (
              <>
                <AddChildModalSection2 {...{ name, setName }} />
                <AddChildModalSection3 {...{ editingChild, birthday, setBirthday }} />
                <AddChildModalSection4 {...{ gender, setGender }} />
                {/*
              早產週數。放在最後、標明選填、預設留空：九成的家長不必理它，
              而填了的那一成才拿得到正確的百分位與里程碑（見
              common/correctedAge）。只在建立／編輯寶寶時出現，孕期檔案還沒
              有出生週數可填。
            */}
                <GestationalFields
                  {...{
                    gestationalWeeks,
                    setGestationalWeeks,
                    gestationalDays,
                    setGestationalDays,
                  }}
                />
              </>
            )
          : mode === 'pregnancy'
            ? (
                <>
                  <AddChildModalSection5 {...{ name, setName }} />
                  <AddChildModalSection6 {...{ dueDate, setDueDate }} />
                </>
              )
            : (
                <AddChildModalSection7 {...{ childUuid, setChildUuid }} />
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

function GestationalFields({
  gestationalWeeks,
  setGestationalWeeks,
  gestationalDays,
  setGestationalDays,
}: Pick<
  NonNullable<ReturnType<typeof useAddChildModal>>,
  'gestationalWeeks' | 'setGestationalWeeks' | 'gestationalDays' | 'setGestationalDays'
>) {
  return (
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
          value={gestationalWeeks}
          onChange={(e) => setGestationalWeeks(e.target.value)}
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
          value={gestationalDays}
          onChange={(e) => setGestationalDays(e.target.value)}
          placeholder="0"
          className={FIELD}
          aria-label="出生時的天數"
        />
        <span className="text-sm text-ink-muted shrink-0">天</span>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        足月（37 週以上）可以不填。早產寶寶填了之後，生長曲線與發展檢核會改用矯正年齡。
      </p>
    </div>
  );
}

function AddChildModalSection1({
  accent,
  accentText,
  mode,
  setMode,
  MODE_LABELS,
  available,
}: Pick<
  NonNullable<ReturnType<typeof useAddChildModal>>,
  'accent' | 'accentText' | 'mode' | 'setMode' | 'MODE_LABELS' | 'available'
>) {
  return (
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
  );
}

function AddChildModalSection2({
  name,
  setName,
}: Pick<NonNullable<ReturnType<typeof useAddChildModal>>, 'name' | 'setName'>) {
  return (
    <div>
      <label htmlFor="childName" className={LABEL}>
        寶寶姓名
      </label>
      <input
        type="text"
        id="childName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={FIELD}
        placeholder="例如: 小寶"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，表單只會說
        // 「請確認網路」。孕期表單的小名寫的是同一個欄位，所以用同一個數。
        maxLength={CHILD_NAME_LIMIT}
        required
      />
    </div>
  );
}

function AddChildModalSection3({
  editingChild,
  birthday,
  setBirthday,
}: Pick<
  NonNullable<ReturnType<typeof useAddChildModal>>,
  'editingChild' | 'birthday' | 'setBirthday'
>) {
  return (
    <div>
      <label htmlFor="childBirthday" className={LABEL}>
        {/* 孕期檔案的這個欄位存的是預產期。標成「寶寶生日」會讓家長
                    以為填錯了，或者不敢改。 */}
        {editingChild?.isPregnancy ? '預產期' : '寶寶生日'}
      </label>
      <input
        type="date"
        id="childBirthday"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        className={FIELD}
        required
      />
    </div>
  );
}

function AddChildModalSection4({
  gender,
  setGender,
}: Pick<NonNullable<ReturnType<typeof useAddChildModal>>, 'gender' | 'setGender'>) {
  return (
    <div>
      <label htmlFor="childGender" className={LABEL}>
        寶寶性別
      </label>
      <select
        id="childGender"
        value={gender}
        onChange={(e) => setGender(e.target.value as Gender | '')}
        className={FIELD}
      >
        <option value="">請選擇性別（選填）</option>
        <option value="male">男生</option>
        <option value="female">女生</option>
      </select>
    </div>
  );
}

function AddChildModalSection5({
  name,
  setName,
}: Pick<NonNullable<ReturnType<typeof useAddChildModal>>, 'name' | 'setName'>) {
  return (
    <div>
      <label htmlFor="pregnancyName" className={LABEL}>
        寶寶小名 (選填)
      </label>
      <input
        type="text"
        id="pregnancyName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={FIELD}
        placeholder="例如: 小花苞"
        maxLength={CHILD_NAME_LIMIT}
      />
    </div>
  );
}

function AddChildModalSection6({
  dueDate,
  setDueDate,
}: Pick<NonNullable<ReturnType<typeof useAddChildModal>>, 'dueDate' | 'setDueDate'>) {
  return (
    <div>
      <label htmlFor="dueDate" className={LABEL}>
        預產期
      </label>
      <input
        type="date"
        id="dueDate"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={FIELD}
        required
      />
    </div>
  );
}

function AddChildModalSection7({
  childUuid,
  setChildUuid,
}: Pick<
  NonNullable<ReturnType<typeof useAddChildModal>>,
  'childUuid' | 'setChildUuid'
>) {
  return (
    <div>
      <label htmlFor="childUuid" className={LABEL}>
        寶寶代碼
      </label>
      <input
        type="text"
        id="childUuid"
        value={childUuid}
        onChange={(e) => setChildUuid(e.target.value)}
        className={`${FIELD} font-mono text-sm`}
        placeholder="例如: 1234abcd-..."
        required
      />
    </div>
  );
}
