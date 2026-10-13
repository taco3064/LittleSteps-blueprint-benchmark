import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GROWTH_NOTES_LIMIT } from '~app/domain/recordLimits';
import AddGrowthRecordModal from './AddGrowthRecordModal';

/**
 * The rules cap `growthRecords/$id/notes`, and a `.validate` failure reaches
 * the client as PERMISSION_DENIED, which this modal reports as a save failure
 * the parent cannot act on. The field must not be able to exceed the rule.
 */
describe('the growth record form', () => {
  it('caps the notes field at the limit the rules enforce', () => {
    render(
      <AddGrowthRecordModal
        isOpen
        onClose={vi.fn()}
        onSave={vi.fn()}
        childId="c1"
      />,
    );

    expect(screen.getByLabelText('備註 (選填)')).toHaveAttribute(
      'maxlength',
      String(GROWTH_NOTES_LIMIT),
    );
  });
});
