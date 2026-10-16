import { logEvent } from '~app/platform/services/firebase';

export function reportRenderError(scope: string, error: Error) {
  logEvent('render_error', { scope, message: error.message?.slice(0, 200) });
}
