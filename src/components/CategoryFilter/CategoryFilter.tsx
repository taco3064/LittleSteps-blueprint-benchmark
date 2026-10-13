import { Category } from '~app/domain/records';
import { getLucideIcon } from '~app/domain/lucideIcons';
interface CategoryFilterProps {
  categories: { value: Category; label: string; icon: string }[];
  selected: Category;
  onChange: (value: Category) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="row-bleed flex gap-2 pb-2">
      {categories.map((category) => {
        const IconComponent = getLucideIcon(category.icon);

        return (
          <button
            key={category.value}
            onClick={() => onChange(category.value)}
            className={`chip shrink-0 ${selected === category.value ? 'chip-on' : ''}`}
          >
            {IconComponent && <IconComponent className="w-4 h-4" />}
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
