import NavigationCard from '../NavigationCard';
import { motion } from 'framer-motion';
import { Book, Calendar } from 'lucide-react';
import { formatDate } from '~app/platform/domain/calendar';
import type { Gender } from '~app/family/domain/familyRecords';
import type { PregnancyGuide } from '~app/littlebloom/domain/pregnancyGuides';
import {
  PREGNANCY_TOTAL_WEEKS,
  trimesterOf,
} from '~app/littlebloom/domain/pregnancyGuides';
import type { ResolvedPrenatalItem } from '~app/littlebloom/domain/prenatalSchedule';
import { listItem, stagger } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import BirthRegistration from '../BirthRegistration';
import type { BloomShellProps } from '../BloomShell';
import NextPrenatalVisit from '../NextPrenatalVisit';
import PregnancyWeekGuide from '../PregnancyWeekGuide';
const THEME = SERVICE_THEME.littlebloom;

const TRIMESTER_LABEL: Record<1 | 2 | 3, string> = {
  1: '第一孕期',
  2: '第二孕期',
  3: '第三孕期',
};

interface PregnancyOverviewProps {
  BloomShell: React.ComponentType<BloomShellProps>;
  displayWeek: number;
  dueDate: string;
  currentGuide: PregnancyGuide | null;
  nextItem: ResolvedPrenatalItem | null;
  onOpenPrenatal: () => void;
  onOpenWiki: () => void;
  birthOpen: boolean;
  birthDate: string;
  lmp: string;
  setBirthDate: React.Dispatch<React.SetStateAction<string>>;
  birthGender: '' | Gender;
  setBirthGender: React.Dispatch<React.SetStateAction<'' | Gender>>;
  dateProblem: string | null;
  birthError: string;
  submitBirth: () => Promise<void>;
  birthSaving: boolean;
  setBirthOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PregnancyOverview(props: PregnancyOverviewProps) {
  return (
    <props.BloomShell
      title="LittleBloom"
      subtitle={`第 ${props.displayWeek} 週 · 預產期 ${formatDate(props.dueDate)}`}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.section variants={listItem} className="panel text-center">
          <p className={`text-sm ${THEME.muted}`}>
            {TRIMESTER_LABEL[trimesterOf(props.displayWeek)]}
          </p>
          <p className={`text-4xl font-bold my-2 ${THEME.ink}`}>
            {'第 '}
            {props.displayWeek}
            {' '}
            週
          </p>
          <p className={`text-sm ${THEME.muted}`}>
            還有
            {' '}
            {Math.max(PREGNANCY_TOTAL_WEEKS - props.displayWeek, 0)}
            {' '}
            週見面
          </p>
        </motion.section>

        {props.currentGuide
          ? (
              <PregnancyWeekGuide currentGuide={props.currentGuide} />
            )
          : (
              <motion.section variants={listItem} className="panel">
                <p className={`text-sm leading-relaxed ${THEME.body}`}>
                  已經超過第
                  {' '}
                  {PREGNANCY_TOTAL_WEEKS}
                  {' '}
                  週。37 至 42
                  週都屬正常生產期，請依產檢醫師的安排追蹤。
                </p>
              </motion.section>
            )}

        <NextPrenatalVisit
          nextItem={props.nextItem}
          onOpenPrenatal={props.onOpenPrenatal}
        />

        <motion.section
          variants={listItem}
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          <NavigationCard
            label="產檢時程"
            icon={<Calendar className="w-6 h-6" />}
            onOpen={props.onOpenPrenatal}
            className="bg-bloom-sage/20 text-bloom-sage-ink"
          />
          <NavigationCard
            label="孕期知識庫"
            icon={<Book className="w-6 h-6" />}
            onOpen={props.onOpenWiki}
            className="bg-bloom-dusty-blue/20 text-bloom-dusty-blue-ink"
          />
        </motion.section>

        {/* 出生登記：孕期檔案轉為寶寶檔案。PregnancyData.status 這個欄位
            從設計出來就存在，卻一直沒有任何流程會把它改成 archived。 */}
        <BirthRegistration
          birthOpen={props.birthOpen}
          birthDate={props.birthDate}
          lmp={props.lmp}
          setBirthDate={props.setBirthDate}
          birthGender={props.birthGender}
          setBirthGender={props.setBirthGender}
          dateProblem={props.dateProblem}
          birthError={props.birthError}
          submitBirth={props.submitBirth}
          birthSaving={props.birthSaving}
          setBirthOpen={props.setBirthOpen}
        />
      </motion.div>
    </props.BloomShell>
  );
}
