import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Pill,
  ShieldAlert,
} from 'lucide-react';

import {
  collapse,
} from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';

import type { VaccineModel } from './useVaccineModel';

export function VaccineReferenceMenu({ model }: { model: VaccineModel }) {
  const {
    showReferences,
    setShowReferences,
    setShowEmergencies,
    setShowContraindications,
    setShowVaccineTypes,
    setShowGuidelines,
  } = model;

  return (
    <div className="card p-0 overflow-hidden mb-4">
      <div
        className="flex items-center justify-between gap-2 px-4 min-h-tap"
        {...pressable(() => setShowReferences(!showReferences), showReferences)}
      >
        <span className="font-medium text-sm">參考資料</span>
        <ChevronDown
          className={`w-5 h-5 text-ink-faint transition-transform ${
            showReferences ? 'rotate-180' : ''
          }`}
        />
      </div>

      <AnimatePresence initial={false}>
        {showReferences && (
          <motion.div {...collapse} className="overflow-hidden">
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              <button
                onClick={() => setShowEmergencies(true)}
                className="btn-secondary w-full text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>緊急狀況處理</span>
              </button>
              <button
                onClick={() => setShowContraindications(true)}
                className="btn-secondary w-full text-sm"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>接種注意事項</span>
              </button>
              <button
                onClick={() => setShowVaccineTypes(true)}
                className="btn-secondary w-full text-sm"
              >
                <Pill className="w-4 h-4" />
                <span>疫苗種類說明</span>
              </button>
              <button
                onClick={() => setShowGuidelines(true)}
                className="btn-secondary w-full text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>接種指南</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
