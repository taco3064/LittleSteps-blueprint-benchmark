import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/platform/components/Motion';

interface BarData {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface SimpleBarChartProps {
  data: BarData[];
  height?: number;
}

export default function SimpleBarChart({ data, height = 40 }: SimpleBarChartProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {data.map((item) => {
        const percentage
          = item.max > 0 ? Math.min((item.value / item.max) * 100, 100) : 0;

        return (
          <motion.div key={item.label} variants={listItem}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-ink-muted">
                {item.label}
              </span>
              <span className="text-sm font-semibold">
                {item.value.toFixed(1)}
                h
              </span>
            </div>

            <div
              className="w-full bg-ink/10 rounded-full overflow-hidden"
              style={{ height: `${height}px` }}
            >
              <motion.div
                className={`h-full rounded-full ${item.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="flex justify-end mt-1">
              <span className="text-xs text-ink-faint">
                目標:
                {item.max}
                h
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
