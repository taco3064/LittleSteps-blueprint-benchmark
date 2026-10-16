import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdrop, sheet } from '~app/platform/components/Motion';
import { ERROR_BOX } from './ERROR_BOX';
import { FoodTrialModalPresentation1 } from './FoodTrialModalPresentation1';
import { FoodTrialModalPresentation8 } from './FoodTrialModalPresentation8';
import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { FoodTrialModalPresentationSection1 } from './FoodTrialModalPresentationSection1';
import { FoodTrialModalPresentationSection2 } from './FoodTrialModalPresentationSection2';
import { FoodTrialModalPresentationSection3 } from './FoodTrialModalPresentationSection3';
import { FoodTrialModalPresentationSection4 } from './FoodTrialModalPresentationSection4';
import { FoodTrialModalPresentationSection5 } from './FoodTrialModalPresentationSection5';
import { FoodTrialModalPresentationSection6 } from './FoodTrialModalPresentationSection6';
import { FoodTrialModalPresentationSection7 } from './FoodTrialModalPresentationSection7';
interface FoodTrialFieldsProps {
  foodName: string;
  setFoodName: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  firstTriedDate: string;
  setFirstTriedDate: React.Dispatch<React.SetStateAction<string>>;
  today: string;
  preference: import('~app/family/domain/familyRecords').FoodPreference | undefined;
  setPreference: React.Dispatch<
    React.SetStateAction<
      import('~app/family/domain/familyRecords').FoodPreference | undefined
    >
  >;
  hasAllergy: boolean;
  setHasAllergy: React.Dispatch<React.SetStateAction<boolean>>;
  allergyReactions: import('~app/family/domain/familyRecords').AllergyReaction[];
  removeAllergyReaction: (index: number) => void;
  newReactionType: import('~app/family/domain/familyRecords').AllergyReactionType;
  setNewReactionType: React.Dispatch<
    React.SetStateAction<
      import('~app/family/domain/familyRecords').AllergyReactionType
    >
  >;
  newReactionSeverity: import('~app/family/domain/familyRecords').AllergySeverity;
  setNewReactionSeverity: React.Dispatch<
    React.SetStateAction<import('~app/family/domain/familyRecords').AllergySeverity>
  >;
  newReactionDate: string;
  setNewReactionDate: React.Dispatch<React.SetStateAction<string>>;
  newReactionDescription: string;
  setNewReactionDescription: React.Dispatch<React.SetStateAction<string>>;
  reactionError: string | null;
  addAllergyReaction: () => void;
  trialDates: string[];
  removeTrialDate: (date: string) => void;
  addTrialDate: () => void;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  onClose: () => void;
  handleSave: () => Promise<void>;
  saving: boolean;
  editingFood:
    import('~app/family/domain/familyRecords').FoodTrialRecord | null | undefined;
}

export function FoodTrialModalPresentation({
  isOpen, onClose, editingFood, foodName, setFoodName, category, setCategory,
  firstTriedDate, setFirstTriedDate, today, preference, setPreference, hasAllergy,
  setHasAllergy, allergyReactions, removeAllergyReaction, newReactionType,
  setNewReactionType, newReactionSeverity, setNewReactionSeverity, newReactionDate,
  setNewReactionDate, newReactionDescription, setNewReactionDescription,
  reactionError, addAllergyReaction, trialDates, removeTrialDate, addTrialDate,
  notes, setNotes, error, handleSave, saving,
}: FoodTrialModalPresentationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...backdrop}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            {...sheet}
            className={
              'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[85vh] '
              + 'overflow-y-auto'
            }
          >
            {/* Header */}
            <div
              className={
                'sticky top-0 bg-white border-b border-ink/10 px-4 py-3 flex '
                + 'items-center justify-between'
              }
            >
              <h2>{editingFood ? '編輯食物記錄' : '記錄新食物嘗試'}</h2>
              <button onClick={onClose} className="btn-icon" aria-label="關閉">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <FoodTrialFields
              foodName={foodName}
              setFoodName={setFoodName}
              category={category}
              setCategory={setCategory}
              firstTriedDate={firstTriedDate}
              setFirstTriedDate={setFirstTriedDate}
              today={today}
              preference={preference}
              setPreference={setPreference}
              hasAllergy={hasAllergy}
              setHasAllergy={setHasAllergy}
              allergyReactions={allergyReactions}
              removeAllergyReaction={removeAllergyReaction}
              newReactionType={newReactionType}
              setNewReactionType={setNewReactionType}
              newReactionSeverity={newReactionSeverity}
              setNewReactionSeverity={setNewReactionSeverity}
              newReactionDate={newReactionDate}
              setNewReactionDate={setNewReactionDate}
              newReactionDescription={newReactionDescription}
              setNewReactionDescription={setNewReactionDescription}
              reactionError={reactionError}
              addAllergyReaction={addAllergyReaction}
              trialDates={trialDates}
              removeTrialDate={removeTrialDate}
              addTrialDate={addTrialDate}
              notes={notes}
              setNotes={setNotes}
              error={error}
              onClose={onClose}
              handleSave={handleSave}
              saving={saving}
              editingFood={editingFood}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FoodTrialFields({
  foodName, setFoodName, category, setCategory, firstTriedDate, setFirstTriedDate,
  today, preference, setPreference, hasAllergy, setHasAllergy, allergyReactions,
  removeAllergyReaction, newReactionType, setNewReactionType, newReactionSeverity,
  setNewReactionSeverity, newReactionDate, setNewReactionDate,
  newReactionDescription, setNewReactionDescription, reactionError,
  addAllergyReaction, trialDates, removeTrialDate, addTrialDate, notes, setNotes,
  error, onClose, handleSave, saving, editingFood,
}: FoodTrialFieldsProps) {
  return (
    <div className="p-4 space-y-4">
      <FoodTrialModalPresentationSection1
        foodName={foodName}
        setFoodName={setFoodName}
      />

      <FoodTrialModalPresentationSection2
        category={category}
        setCategory={setCategory}
      />

      <FoodTrialModalPresentationSection3
        firstTriedDate={firstTriedDate}
        setFirstTriedDate={setFirstTriedDate}
        today={today}
      />

      {/*
                This was a row of five emoji faces. The preference itself is a real
                choice, so the glyphs became labels — and chips wrap instead of
                squeezing five cells into a 360px row.
              */}
      <FoodTrialModalPresentationSection4
        preference={preference}
        setPreference={setPreference}
      />

      {/* Has Allergy Toggle */}
      <FoodTrialModalPresentation1
        hasAllergy={hasAllergy}
        setHasAllergy={setHasAllergy}
      />

      {/* Allergy Reactions */}
      {hasAllergy && (
        <FoodTrialModalPresentationSection5
          allergyReactions={allergyReactions}
          removeAllergyReaction={removeAllergyReaction}
          newReactionType={newReactionType}
          setNewReactionType={setNewReactionType}
          newReactionSeverity={newReactionSeverity}
          setNewReactionSeverity={setNewReactionSeverity}
          newReactionDate={newReactionDate}
          setNewReactionDate={setNewReactionDate}
          today={today}
          newReactionDescription={newReactionDescription}
          setNewReactionDescription={setNewReactionDescription}
          reactionError={reactionError}
          addAllergyReaction={addAllergyReaction}
        />
      )}

      {/* Trial Dates (4x3 Rule Tracking) */}
      <FoodTrialModalPresentation8
        trialDates={trialDates}
        removeTrialDate={removeTrialDate}
        addTrialDate={addTrialDate}
        today={today}
      />

      <FoodTrialModalPresentationSection6 notes={notes} setNotes={setNotes} />

      {error && (
        <p role="alert" className={ERROR_BOX}>
          {error}
        </p>
      )}

      {/* Action Buttons */}
      <FoodTrialModalPresentationSection7
        onClose={onClose}
        handleSave={handleSave}
        saving={saving}
        editingFood={editingFood}
      />
    </div>
  );
}
