import Toast from '@/components-common/Toast';
import { getUrlPageName } from '@/utils/tool/url';
import getHistory from '@/utils/history';
import { FIRST_PAGE } from '@/const/index';

let isToasting = false;

function errorToast(msg) {
  if (isToasting) return false;
  isToasting = true;
  Toast.fail(
    msg,
    2,
    () => {
      isToasting = false;
    },
    false
  );
}

export function networkError(err) {
  // 容错方案 https://wiki.n.miui.com/pages/viewpage.action?pageId=165231192
  // 错误码详解 https://wiki.n.miui.com/pages/viewpage.action?pageId=161298485
  // 网络错误处理
  const history = getHistory();
  const currentPage = getUrlPageName();
  const pageName = FIRST_PAGE;
  if (pageName.includes(currentPage)) {
    errorToast(err.message || '网络错误，请稍后重试');
  } else {
    history.push('/mio/error?code=80000&showTitle=1');
  }
}

export function debugNetworkError(err) {
  switch (err.status) {
    case 400:
      Toast.info('请求错误', 2, null, false);
      break;

    case 401:
      Toast.info('未授权，请登录', 2, null, false);
      break;

    case 403:
      // 跳转到权限提示页面
      Toast.info('拒绝访问', 2, null, false);
      break;

    case 404:
      Toast.info('资源不存在', 2, null, false);
      break;

    case 408:
      Toast.info('请求超时', 2, null, false);
      break;

    case 500:
      Toast.info('服务器内部错误', 2, null, false);

      break;

    case 501:
      Toast.info('服务未实现', 2, null, false);
      break;

    case 502:
      Toast.info('网关错误', 2, null, false);
      break;

    case 503:
      Toast.info('服务不可用', 2, null, false);
      break;

    case 504:
      Toast.info('网关超时', 2, null, false);
      break;

    case 505:
      Toast.info('HTTP版本不受支持', 2, null, false);
      break;

    case 600:
      Toast.info('内容不存在', 2, null, false);
      break;
    default:
      Toast.info('未知错误', 2, null, false);
  }
}
