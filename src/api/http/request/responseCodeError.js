import Toast from '@/components-common/Toast';
import { MioDumbError, MioUnauthorizedError, MioResponseError } from '@/api/http/request/error';
import { getUrlPageName } from '@/utils/tool/url';
import getHistory from '@/utils/history';
import { login } from '../loginUtils';
import { SERVER_OK } from '@/const/http';
import { handleCodeRep, ERROR_TOAST, JUMP_TO_ERROR_PAGE, LOGIN } from './codeConfig';
import { FIRST_PAGE } from '@/const/index';

export default function responseCodeError(req, res) {
  const { isNotCheckCode, isNotCheckLogin } = req;
  const codeRep = res instanceof Object ? handleCodeRep(res.code) : null;
  if (codeRep === LOGIN && !isNotCheckLogin) {
    login(res.loginUrl);
    throw new MioUnauthorizedError('Unauthorized response : ' + JSON.stringify(res), res.code);
  }

  if (isNotCheckCode) {
    return res;
  }

  let { successCode } = req;
  // 如果未自定义successCode，使用SERVER_OK
  successCode = successCode === undefined ? SERVER_OK : successCode;
  if (successCode === res.code) {
    return res;
  }

  let isToasting = false;
  function errorToast(msg) {
    if (isToasting) return false;
    isToasting = true;
    Toast.fail(msg, 2, () => (isToasting = false), false);
  }

  const history = getHistory();
  const currentPage = getUrlPageName();
  // 一级tab页面不跳转，仅弹窗
  const pageName = FIRST_PAGE;
  if (pageName.includes(currentPage)) {
    errorToast(res.message || res.err || '服务器开小差啦，请稍后重试');
  } else {
    if (codeRep === JUMP_TO_ERROR_PAGE) {
      history.replace(`/mio/error?code=${res.code}`);
      return {};
    } else if (ERROR_TOAST.includes(codeRep)) {
      errorToast(res.message || res.err || codeRep);
    } else {
      // 抛出异常让上层handle报警处理
      throw new MioResponseError('Unexpected response : ' + JSON.stringify(res), res.code);
    }
  }

  throw new MioDumbError('Unexpected response : ' + JSON.stringify(res), res.code);
}
