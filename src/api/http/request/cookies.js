import { getCookie, setCookie } from '@/utils/cookie';
import { clientVersionLimit, getLoginCookie } from '@/utils/vipAppBaseUtils';

let cookies = {};
let clientCookies = {};
const DOMAIN = 'test.miui.com';
export const sidList = [
  'token'
];

export const sidMap = {
  'test.web.com': 'token',
};

function _getClientCookies(newReqCookies) {
  let c = {};
  let clientCookiesStr = newReqCookies;
  if (!clientCookiesStr && clientVersionLimit(1150, 10061)) {
    const loginCookie = getLoginCookie();
    if (loginCookie) {
      clientCookiesStr = loginCookie;
    }
  }
  if (clientCookiesStr) {
    try {
      c = JSON.parse(clientCookiesStr);
    } catch {
      console.info('获取客户端cookie，JSON.parse失败');
    }
  }
  return c;
}

function _getBrowserCookies() {
  const bCookies = {};
  sidList.forEach(val => {
    const c = getCookie(val);
    if (c) bCookies[val] = c;
  });
  return bCookies;
}

function _setClientCookies(cookieObj) {
  // eslint-disable-next-line no-restricted-syntax
  for (const [k, v] of Object.entries(cookieObj)) {
    setCookie(k, v, DOMAIN);
  }
}

export function setReqCookies(newReqCookies) {
  if (!Object.keys(clientCookies).length || newReqCookies) {
    const cCookies = _getClientCookies(newReqCookies);

    if (Object.keys(cCookies).length) {
      _setClientCookies(cCookies);
      clientCookies = cCookies;
      cookies = cCookies;
    }
  }
}

// 获取浏览器cookie
export function getReqCookies() {
  if (Object.keys(cookies).length) {
    return cookies;
  }
  const bCookies = _getBrowserCookies();
  if (Object.keys(bCookies).length) {
    cookies = bCookies;
    return bCookies;
  }
  return {};
}

// 设置从第三方app获取的cookies
export function setCookiesFromOther(userInfo) {
  // eslint-disable-next-line camelcase
  const { cUserId = '', sid_serviceToken = '', sid_slh = '', sid_ph = '' } = userInfo;

  let userCookies = {
    cUserId
  };
  switch (window.location.hostname) {
    case 'test.web.com': {
      userCookies = {
        ...userCookies
      };
      break;
    }
    
    default: {
      userCookies = {
        ...userCookies
      };
    }
  }
  _setClientCookies(userCookies);
}

export function clearCookiesFromOther() {
  setCookiesFromOther({});
}