import { motion } from 'framer-motion';
import { hoverLift, tap } from '~app/platform/components/Motion';
interface NavCardProps {
  label: string;
  icon: React.ReactNode;
  onOpen: () => void;
  className: string;
}

export default function NavigationCard({
  label,
  icon,
  onOpen,
  className,
}: NavCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={hoverLift}
      whileTap={tap}
      onClick={onOpen}
      className={
        ''
        + className
        + ' rounded-3xl p-5 shadow-soft hover:shadow-soft-lg '
        + 'transition-shadow flex flex-col items-center gap-2'
      }
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </motion.button>
  );
}
