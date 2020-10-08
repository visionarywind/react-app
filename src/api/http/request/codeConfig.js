import {
  SERVER_TO_ERROR_PAGE,
  SERVER_ERROR_MESSAGE,
  SERVER_ERROR_IGNORE,
  SERVER_UNAUTHORIZED,
  SERVER_BAD_GATEWAY,
  SERVER_NOT_RETRY,
  SERVER_ERROR,
  SERVER_AUTHOR_ONLY,
  HTTP_TEMPORARY_REDIRECT,
  USER_DO_NOT_EXIST,
  ADMINISTRATOR_ONLY,
  SERVER_TOO_FAST,
  SERVER_FORBIDDEN,
  SERVER_ERROR_DATA,
  SERVER_CONTENT_NO_FOUND,
  SERVER_NO_ACTIVITY
} from '@/const/http';

/* code码响应操作 */
// Toast
const SERVER_ERROR_TOAST = '服务器开小差啦，请稍后重试';
const AUTHORITY_ERROR_TOAST = '你无权进行该操作';
const NOT_EXIST_TOAST = '当前用户ID不存在';
const ACTIVITY_NOT_START = '活动暂未开始，敬请期待';
export const ERROR_TOAST = [SERVER_ERROR_TOAST, AUTHORITY_ERROR_TOAST, NOT_EXIST_TOAST, ACTIVITY_NOT_START];
// 其他
export const JUMP_TO_ERROR_PAGE = '跳转对应错误页';
export const LOGIN = '处理未登录问题';

/*
配置code码对应的request操作；
配置方式：[code码, [retry操作], code码响应操作]。
*/
const config = [
  { code: SERVER_TO_ERROR_PAGE, retry: ['reject', 'passThrough'], rep: JUMP_TO_ERROR_PAGE },
  { code: SERVER_ERROR_MESSAGE, retry: ['reject', 'passThrough'], rep: SERVER_ERROR_TOAST },
  { code: SERVER_ERROR_IGNORE, retry: ['reject'], rep: '' },
  { code: SERVER_UNAUTHORIZED, retry: ['accept'], rep: LOGIN },
  { code: SERVER_BAD_GATEWAY, retry: ['accept'], rep: '' },
  { code: SERVER_NOT_RETRY, retry: ['accept'], rep: SERVER_ERROR_TOAST },
  { code: SERVER_ERROR, retry: ['accept'], rep: SERVER_ERROR_TOAST },
  { code: SERVER_AUTHOR_ONLY, retry: ['accept'], rep: JUMP_TO_ERROR_PAGE },
  { code: HTTP_TEMPORARY_REDIRECT, retry: ['accept'], rep: '' },
  { code: USER_DO_NOT_EXIST, retry: ['accept'], rep: NOT_EXIST_TOAST },
  { code: ADMINISTRATOR_ONLY, retry: ['accept'], rep: AUTHORITY_ERROR_TOAST },
  { code: SERVER_TOO_FAST, retry: [], rep: SERVER_ERROR_TOAST },
  { code: SERVER_FORBIDDEN, retry: [], rep: SERVER_ERROR_TOAST },
  { code: SERVER_ERROR_DATA, retry: [], rep: SERVER_ERROR_TOAST },
  { code: SERVER_CONTENT_NO_FOUND, retry: [], rep: JUMP_TO_ERROR_PAGE },
  { code: SERVER_NO_ACTIVITY, retry: [], rep: ACTIVITY_NOT_START }
];

function handleRetryCode() {
  const retryCodeConfig = {
    acceptCode: [],
    rejectCode: [],
    passThroughCode: []
  };
  config.forEach(codeItem => {
    const code = codeItem.code;
    const retry = codeItem.retry;
    retry.forEach(retryItem => {
      if (retryItem === 'accept') {
        retryCodeConfig.acceptCode.push(code);
      } else if (retryItem === 'reject') {
        retryCodeConfig.rejectCode.push(code);
      } else if (retryItem === 'passThrough') {
        retryCodeConfig.passThroughCode.push(code);
      }
    });
  });
  return retryCodeConfig;
}

export const retryCodeConfig = handleRetryCode();

export function handleCodeRep(code) {
  let rep = '';
  config.forEach(item => {
    if (item.code === code) { rep = item.rep; }
  });
  return rep;
}
