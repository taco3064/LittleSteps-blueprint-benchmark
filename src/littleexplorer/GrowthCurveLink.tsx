import View from '~app/littleexplorer/components/GrowthCurveLink';
import { goTo } from '~app/portal/services/navigate';

export default function GrowthCurveLink() {
  return <View onOpen={() => goTo('littlesteps/growth-charts')} />;
}
