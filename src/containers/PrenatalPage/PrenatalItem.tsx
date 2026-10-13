import ItemDetails from './ItemDetails';

import { motion } from 'framer-motion';
import { Check, Undo2 } from 'lucide-react';

import type { ResolvedPrenatalItem } from '~app/domain/prenatalSchedule';

import { tap } from '~app/domain/motion';

import type { PrenatalEditor } from './usePrenatalEditor';

import CompletionForm from './CompletionForm';

export default function PrenatalItem({
  item,
  beforeProfile = false,
  editor,
}: {
  item: ResolvedPrenatalItem;
  beforeProfile?: boolean;
  editor: PrenatalEditor;
}) {
  const { template, status } = item;
  const { saving, failure, undo } = editor;
  const formFor = editor.form.activeId;
  const showForm = formFor === template.id;

  const accent
    = status === 'overdue' && !beforeProfile ? 'bg-bloom-terracotta/10' : '';

  return (
    <li
      key={template.id}
      className={`card ${accent} ${status === 'done' ? 'opacity-70' : ''}`}
    >
      <ItemDetails item={item} beforeProfile={beforeProfile} />

      <div className="mt-3">
        {status === 'done'
          ? (
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => {
                  void undo(template.id);
                }}
                disabled={saving}
                className="btn-ghost text-sm disabled:opacity-60"
              >
                <Undo2 className="w-4 h-4" />
                取消完成
              </motion.button>
            )
          : (
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => {
                  editor.toggle(template.id);
                }}
                className="btn-secondary px-4 text-sm text-bloom-sage-ink"
              >
                <Check className="w-4 h-4" />
                標記完成
              </motion.button>
            )}
      </div>

      {showForm && (
        <CompletionForm templateId={template.id} editor={editor} />
      )}

      {failure?.templateId === template.id && (
        <p role="alert" className="text-sm mt-2 text-bloom-terracotta-ink">
          {failure.message}
        </p>
      )}
    </li>
  );
}
