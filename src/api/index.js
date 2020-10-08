/* eslint-disable max-lines */
import request from './http/request/request';

const api = (url, method = 'POST', optionalParam) => apiParams => {
  return request(url, { method }, optionalParam, apiParams);
};

const API = {
  /**
   * 公共接口
   */
  wxShareGet: api('api/mipop/share', 'GET', { isNotCheckCode: true, resHasEntity: false }),
  postsLike: api('api/community/post/thumbUp', 'GET'),
  postsCancelLike: api('api/community/post/cancelThumbUp', 'GET'),
  postsDislike: api('api/community/post/dislike', 'GET'),
  postsCancelDislike: api('api/community/post/cancelDislike', 'GET'),
  userInfoGet: api('api/community/post/userInfo', 'GET'),
  commentUserInfoGet: api('api/community/post/userInfo', 'GET', { resHasEntity: false, isNotCheckCode: true, noRetry: true, isNotCheckLogin: true }),
};

export default API;
