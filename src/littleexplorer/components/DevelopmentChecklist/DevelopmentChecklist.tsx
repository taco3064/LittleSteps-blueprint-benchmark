import { motion } from 'framer-motion';
import type { DevelopmentCheckProgress } from '~app/family/domain/familyRecords';
import type {
  DevelopmentCheckItem,
  DevelopmentDomain,
} from '~app/knowledge/domain/referenceModels';
import { domainLabels } from '~app/littleexplorer/domain/developmentChecks';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import DevelopmentCheckToggle from '../DevelopmentCheckToggle';
import QuickDiaryForm from '../QuickDiaryForm';
const THEME = SERVICE_THEME.littleexplorer;
interface DevelopmentChecklistProps {
  domain: DevelopmentDomain;
  items: DevelopmentCheckItem[];
  progress: DevelopmentCheckProgress;
  expandedId: string | null;
  handleToggle: (item: DevelopmentCheckItem) => Promise<void>;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  diaryFor: string | null;
  diaryText: string;
  setDiaryText: React.Dispatch<React.SetStateAction<string>>;
  handleQuickDiary: (item: DevelopmentCheckItem) => Promise<void>;
  setDiaryFor: React.Dispatch<React.SetStateAction<string | null>>;
  diaryError: string;
  savedFor: string | null;
}

export default function DevelopmentChecklist(props: DevelopmentChecklistProps) {
  return (
    <motion.section key={props.domain} variants={listItem} className="panel">
      <h3 className={`mb-3 ${THEME.body}`}>{domainLabels[props.domain]}</h3>

      <ul className="space-y-2">
        {props.items.map((item) => {
          const achieved = props.progress[item.id]?.achieved === true;
          const isExpanded = props.expandedId === item.id;

          return (
            <li key={item.id} className="rounded-2xl bg-explorer-sand/60 py-1 pr-3">
              {/* 勾選鍵佔滿左側 44px，之後每一層都用 pl-tap 對齊題目 */}
              <DevelopmentCheckToggle
                handleToggle={props.handleToggle}
                item={item}
                achieved={achieved}
                setExpandedId={props.setExpandedId}
                isExpanded={isExpanded}
              />

              {isExpanded && (
                <div className="pl-tap pr-1 pb-2 space-y-2">
                  <p className={`text-sm leading-relaxed ${THEME.muted}`}>
                    {item.detail}
                  </p>
                  <ul className="space-y-1">
                    {item.tips.map((tip) => (
                      <li key={tip} className={`text-sm flex gap-2 ${THEME.muted}`}>
                        <span className="text-explorer-meadow-ink shrink-0">·</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {props.diaryFor === item.id && (
                <QuickDiaryForm
                  diaryText={props.diaryText}
                  setDiaryText={props.setDiaryText}
                  handleQuickDiary={props.handleQuickDiary}
                  item={item}
                  setDiaryFor={props.setDiaryFor}
                />
              )}

              {props.diaryFor === item.id && props.diaryError && (
                <p role="alert" className="pl-tap pb-2 text-xs text-primary-dark">
                  {props.diaryError}
                </p>
              )}

              {props.savedFor === item.id && (
                <p className="pl-tap pb-2 text-xs text-explorer-meadow-ink">
                  已寫進日記
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
