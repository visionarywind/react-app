import API from '@/api/index';
import { deleteCookie } from '@/utils/cookie';
import { getUserId } from '@/utils/helper';
import { getHostFromUrl, getParamFromUrl } from '@/utils/tool/url';

const { location } = window;

function isLogin() {
  if (
    (location.href.includes('.test.web.com') || location.href.includes(`${process.env.port}`))
    && !window.XiaomiVipApp
  ) {
    return getUserId();
  }
  return true;
}

function goLogin(obj) {
  return API.userInfoGet(obj || null);
}

function deleteLoginCookie(names) {
  names.forEach(val => deleteCookie(val));
}

function login(loginUrl) {
  deleteLoginCookie(['userId', 'cUserId', 'serviceToken']);
  const url = location.href;
  let loginHost;
  let callbackurl;
  if (loginUrl) {
    callbackurl = getParamFromUrl(loginUrl, 'callback');
    let host = decodeURIComponent(callbackurl);
    host = getHostFromUrl(host);

    if (host && host !== location.host) {
      loginHost = '//' + host + '/page/login?destUrl=' + encodeURIComponent(location.href);
    }
  }

  const domains = ['test.web.com'];
  const handleDomain = val => {
    if (url.includes(val)) {
      loginHost = `${location.origin}/page/login?destUrl=${encodeURIComponent(location.href)}`;
      callbackurl = `${location.origin}/autologin`;
    }
  };

  if (!loginHost) {
    domains.forEach(handleDomain);
  }

  console.info('401调用了登录，跳转路径为：' + loginHost);

  location.replace(loginHost);
}

export { isLogin, login, goLogin };
