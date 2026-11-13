import {Composition, Still} from 'remotion';
import {BiharKiKahani, TOTAL_SECONDS} from './Video';
import {Thumbnail} from './Thumbnail';
import {ThumbnailVertical} from './ThumbnailVertical';
import {RiverToPower, SHORT_SECONDS} from './short/RiverToPower';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BiharKiKahani"
      component={BiharKiKahani}
      durationInFrames={Math.round(TOTAL_SECONDS * 30)}
      fps={30}
      width={1920}
      height={1080}
    />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
    <Composition id="RiverToPower" component={RiverToPower} durationInFrames={SHORT_SECONDS * 30} fps={30} width={1920} height={1080} />
    <Still id="ThumbnailVertical" component={ThumbnailVertical} width={1080} height={1920} />
  </>
);
