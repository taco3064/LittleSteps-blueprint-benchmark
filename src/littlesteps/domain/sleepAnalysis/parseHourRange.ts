/**
 * 解析小時範圍字串（如 "13-15 小時" -> {min: 13, max: 15}）
 */
export function parseHourRange(hourString: string): { min: number; max: number } {
  const match = hourString.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/);

  if (match) {
    return {
      min: parseFloat(match[1]),
      max: parseFloat(match[2]),
    };
  }

  // 如果是單一數字（如 "11 小時"）
  const singleMatch = hourString.match(/(\d+(?:\.\d+)?)/);

  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);

    return { min: value, max: value };
  }

  return { min: 0, max: 0 };
}
