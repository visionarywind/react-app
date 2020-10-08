import { IGNORABLE_REQUEST_URL, IS_MOCK_SERVER, IS_TEST_SERVER } from '@/const/index';
import history from '@/routers/history';
import { plainUrlParams } from '@/utils/helper';
import { addRef } from '@/utils/tool/business';
import { addUniqueUrlQueryField, getQueryString } from '@/utils/tool/url';
import { getAndroidVersion, getAppVersion, getDevice, getDeviceOAID, getModel, restrictImei } from '@/utils/vipAppBaseUtils';
import { getReqCookies, setReqCookies, sidList } from './cookies';

const DEFAULT_APP_VERSION = 'dev.1.0.1';

export default function transformParams(options, url, apiParams) {
  let query = '';
  let params = apiParams;
  let versionInfo = { version: DEFAULT_APP_VERSION };
  let newOptions = IS_MOCK_SERVER ? options : Object.assign({}, options, { credentials: 'include' });
  const shareAppVersion = getQueryString().app_version;

  if (!IS_TEST_SERVER) {
    setReqCookies();
  }
  const reqCookies = getReqCookies();

  if (getAppVersion()) {
    versionInfo = { version: getAppVersion(), android_version: getAndroidVersion(), oaid: getDeviceOAID(), device: getDevice() || '', restrict_imei: restrictImei() || '', model: getModel() || '' };
    params = { ...params, ...versionInfo };
  } else if (shareAppVersion) {
    params = { ...params, version: shareAppVersion };
  } else {
    params = { ...params, ...versionInfo };
  }

  if (newOptions.method === 'POST') {
    newOptions = Object.assign({}, newOptions, { body: apiParams });

    let formData = new FormData();
    if (!(newOptions.body instanceof FormData)) {
      // eslint-disable-next-line
      for (const key in newOptions.body) {
        formData.append(key, newOptions.body[key]);
      }
    } else {
      formData = newOptions.body;
    }

    sidList.forEach(sid => {
      const c = reqCookies[sid];
      c && formData.append(sid, c);
    });

    newOptions.body = formData;
    newOptions.headers = { Accept: 'application/json', ...newOptions.headers };
    query = getAppVersion() ? `?${plainUrlParams(versionInfo)}` : '';
  } else if (newOptions.method === 'GET') {
    query = `?${plainUrlParams(params)}`;
  }

  const isIgnore = IGNORABLE_REQUEST_URL.some(val => url.includes(val));
  if (!isIgnore) {
    query = addRef(query);
    if (history && history.location) {
      query = addUniqueUrlQueryField(query, 'pathname', history.location.pathname);
    }
  }

  return { newOptions, newUrl: url + query };
}
