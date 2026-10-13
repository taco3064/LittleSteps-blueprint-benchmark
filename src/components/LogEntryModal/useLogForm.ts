import { useEffect, useRef, useState } from 'react';
import { emptyLogForm, initializeLogForm } from './logFormState';
import type { LogEntryModalProps, LogFormState } from './logFormState';
import { logPayload } from './logPayload';
const RANGE_ERROR = '結束時間要晚於開始時間；睡到隔天的話，結束時間請選隔天的日期。';
type SetField = <K extends keyof LogFormState>(
  key: K,
  value: LogFormState[K],
) => void;

function sleepRange(form: LogFormState, logType: LogEntryModalProps['logType']) {
  const startMs = new Date(form.startTime).getTime();
  const endMs = form.endTime ? new Date(form.endTime).getTime() : NaN;

  const hasSleepRange
    = logType === 'sleep' && !Number.isNaN(startMs) && !Number.isNaN(endMs);

  return {
    hasSleepRange,
    sleepRangeError: hasSleepRange && endMs <= startMs ? RANGE_ERROR : null,
  };
}

function submitLog(
  form: LogFormState,
  props: LogEntryModalProps,
  setField: SetField,
) {
  return async (e: React.FormEvent) => {
    e.preventDefault();

    if (sleepRange(form, props.logType).sleepRangeError) {
      return;
    }

    setField('isSubmitting', true);
    setField('error', null);

    try {
      await props.onSave(logPayload(form, props));
      props.onClose();
    } catch (err) {
      console.error('保存失敗:', err);
      setField('error', err instanceof Error ? err.message : '保存失敗，請稍後再試');
    } finally {
      setField('isSubmitting', false);
    }
  };
}

export function useLogForm(props: LogEntryModalProps) {
  const [form, setForm] = useState(emptyLogForm);
  const previousLog = useRef(props.lastLog);

  previousLog.current = props.lastLog;
  const { editingLog, logType, isOpen } = props;

  useEffect(() => {
    setForm((current) =>
      initializeLogForm(current, {
        editingLog,
        logType,
        lastLog: previousLog.current,
      }),
    );
  }, [editingLog, logType, isOpen]);

  const setField: SetField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const isPumping = form.feedingType === 'pumping';
  const prefix = editingLog ? '編輯' : '新增';

  return {
    ...form,
    isPumping,
    ...sleepRange(form, logType),
    handleSubmit: submitLog(form, props, setField),
    getTitle: () =>
      prefix
      + {
        feeding: isPumping ? '擠奶記錄' : '餵奶記錄',
        sleep: '睡眠記錄',
        diaper: '尿布記錄',
      }[logType],
    stepNightWakings: (delta: number) => {
      const current = parseInt(form.nightWakings, 10);

      setField(
        'nightWakings',
        String(Math.max(0, (Number.isNaN(current) ? 0 : current) + delta)),
      );
    },
    setTimestamp: (value: LogFormState['timestamp']) => setField('timestamp', value),
    setFeedingType: (value: LogFormState['feedingType']) =>
      setField('feedingType', value),
    setDuration: (value: LogFormState['duration']) => setField('duration', value),
    setAmount: (value: LogFormState['amount']) => setField('amount', value),
    setSide: (value: LogFormState['side']) => setField('side', value),
    setStartTime: (value: LogFormState['startTime']) => setField('startTime', value),
    setEndTime: (value: LogFormState['endTime']) => setField('endTime', value),
    setNightWakings: (value: LogFormState['nightWakings']) =>
      setField('nightWakings', value),
    setDiaperType: (value: LogFormState['diaperType']) =>
      setField('diaperType', value),
    setConsistency: (value: LogFormState['consistency']) =>
      setField('consistency', value),
    setNotes: (value: LogFormState['notes']) => setField('notes', value),
  };
}

export type LogForm = ReturnType<typeof useLogForm>;
