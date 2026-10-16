import { useState } from 'react';
import { getCurrentDateTimeLocal } from '~app/platform/domain/calendar';
import { DiaperData, FeedingData } from '~app/family/domain/familyRecords';

export function useLogEntryFields() {
  // Common fields
  const [timestamp, setTimestamp] = useState(getCurrentDateTimeLocal());

  // Feeding fields
  const [feedingType, setFeedingType]
    = useState<FeedingData['feedingType']>('breast_left');

  const [duration, setDuration] = useState('');

  const [amount, setAmount] = useState('');

  /** 只有擠奶用得到。空字串是「沒選邊」。 */
  const [side, setSide] = useState<'' | NonNullable<FeedingData['side']>>('');

  // Sleep fields
  const [startTime, setStartTime] = useState(getCurrentDateTimeLocal());

  const [endTime, setEndTime] = useState('');

  /** 空字串是「沒問到」，'0' 是「家長說沒醒」——兩者存進去的值不一樣。 */
  const [nightWakings, setNightWakings] = useState('');

  // Diaper fields
  const [diaperType, setDiaperType] = useState<DiaperData['type']>('pee');

  const [consistency, setConsistency]
    = useState<DiaperData['consistency']>('normal');

  // Common
  const [notes, setNotes] = useState('');

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  return {
    timestamp, setTimestamp, feedingType, setFeedingType, duration, setDuration,
    amount, setAmount, side, setSide, startTime, setStartTime, endTime, setEndTime,
    nightWakings, setNightWakings, diaperType, setDiaperType, consistency,
    setConsistency, notes, setNotes, isSubmitting, setIsSubmitting, error, setError,
  };
}
