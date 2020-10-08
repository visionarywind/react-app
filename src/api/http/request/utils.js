import { IGNORABLE_REQUEST_URL } from '@/const/index';
import { isNoNetwork } from '@/utils/vipAppBaseUtils';

// eslint-disable-next-line import/prefer-default-export
export function isOffline(url) {
  const ignore = IGNORABLE_REQUEST_URL.some(val => url.includes(val));
  return navigator.onLine === false && !ignore && isNoNetwork();
}
