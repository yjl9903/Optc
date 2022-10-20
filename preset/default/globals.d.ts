/// <reference path="/workspaces/Optc/globals.d.ts" />

import _axios from 'axios';

declare global {
  /**
   * axios
   */
  export const http: typeof _axios;
}
