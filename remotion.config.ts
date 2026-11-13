import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
// Use a locally installed Chrome Headless Shell when available (e.g. in CI sandboxes).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
