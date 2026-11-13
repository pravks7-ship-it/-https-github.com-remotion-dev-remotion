import {Composition} from 'remotion';
import {BiharKiKahani, TOTAL_SECONDS} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BiharKiKahani"
    component={BiharKiKahani}
    durationInFrames={Math.round(TOTAL_SECONDS * 30)}
    fps={30}
    width={1920}
    height={1080}
  />
);
