import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreCircle from './ScoreCircle';

describe('ScoreCircle', () => {
  it('沒有分數時說「資料不足」，而不是畫一個看起來很低的數字', () => {
    render(<ScoreCircle score={null} label="再記幾天" title="餵奶規律度" />);

    expect(screen.getByText('資料不足')).toBeInTheDocument();
    expect(screen.getByText('再記幾天')).toBeInTheDocument();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('有分數時分數與評語都在', () => {
    render(<ScoreCircle score={82} label="很棒！" title="睡眠品質" />);

    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('很棒！')).toBeInTheDocument();
    expect(screen.getByText('睡眠品質')).toBeInTheDocument();
  });
});
