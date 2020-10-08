import { SERVER_OK, SERVER_UNAUTHORIZED } from '@/const/http';
import { URL_PREFIX, REQUEST_OVERTIME, IS_PROD_SERVER, IS_ALPHA_SERVER } from '@/const/index';
import Channel from '@/utils/pipeline/pipeline';
import { errorHandleChannel, retryChannel, statChannel, timeOutChannel } from '@/utils/pipeline/SimpleChannel';
import responseCodeError from './responseCodeError';
import checkNetError from './checkNetError';
import { getApiDomain, showToast } from '@/utils/vipAppBaseUtils';
import { retryCodeConfig } from './codeConfig';
import transformParams from './transformParams';
import { changeHostForApi } from '@/utils/tool/url';
import { isInXiaoAiApp, autoLoginForXiaoAi } from '@/utils/tool/env';
import { MioResponseError, MioNoNetError } from '@/api/http/request/error';
import { throttle } from '@/utils/tool/tool';
import { isOffline } from '@/api/http/request/utils';

function handleUrlPreFix() {
  let urlPreFix = '';
  if (IS_ALPHA_SERVER || IS_PROD_SERVER) {
    urlPreFix = getApiDomain() || changeHostForApi() || URL_PREFIX;
  } else {
    urlPreFix = URL_PREFIX;
  }
  return urlPreFix;
}

// 断网提示
const offlineTip = throttle(() => {
  showToast('断网了， 请检查网络状况');
}, 3000);

const defaultParams = { isNotCheckCode: false, resHasEntity: true, successCode: 200, overTime: REQUEST_OVERTIME, limit: 2, isHandleException: true, noRetry: false, isNotCheckLogin: false };

export default function request(
  restPath,
  parameter,
  extendParams,
  extraParams
) {
  const urlPreFix = handleUrlPreFix();
  const domainPrefixChannel = new Channel((req, service) => {
    const { path } = req;
    return service({ ...req, url: urlPreFix + '/' + path });
  });

  const parseOptionsAndEntityChannel = new Channel((req, service) => {
    const { resHasEntity, options, url, apiParams } = req;
    const newParams = transformParams(options, url, apiParams);
    const reqOut = { ...req, options: newParams.newOptions, url: newParams.newUrl };
    return service(reqOut).then(data => (resHasEntity ? data.entity : data));
  });

  const responseCodeErrorChannel = new Channel((req, service) => {
    return service(req).then(rep => {
      const { isNotCheckLogin } = req;
      if (isInXiaoAiApp() && rep.code === SERVER_UNAUTHORIZED && !isNotCheckLogin) {
        autoLoginForXiaoAi(true);
        throw new MioResponseError('SERVER_UNAUTHORIZED');
      } else {
        return responseCodeError(req, rep);
      }
    });
  });

  const retryPolicy = {
    retries: 2,
    accept: (_req, rep) => {
      let { successCode } = _req;
      successCode = successCode === undefined ? SERVER_OK : successCode;
      return ((successCode === rep.code) || retryCodeConfig.acceptCode.includes(rep.code));
    },
    reject: (_req, rep) => (retryCodeConfig.rejectCode.includes(rep.code)),
    passThrough: (_req, rep) => (retryCodeConfig.passThroughCode.includes(rep.code))
  };
  const retryPolicyChannel = retryChannel(retryPolicy);

  const netErrorChannel = new Channel((req, service) => {
    if (isOffline(req.url)) {
      offlineTip();
      return Promise.reject(new MioNoNetError());
    }
    return service(req).then(rep => checkNetError(req, rep));
  });

  const timeoutChannel = timeOutChannel(REQUEST_OVERTIME);

  const service = req => {
    const { url, options } = req;
    return fetch(url, options);
  };

  const action = errorHandleChannel
    .connect(domainPrefixChannel)
    .connect(parseOptionsAndEntityChannel)
    .connect(responseCodeErrorChannel)
    .connect(retryPolicyChannel)
    .connect(netErrorChannel)
    .connect(timeoutChannel)
    .connect(statChannel)
    .then(service);

  const extendDefaultParams = Object.assign({}, defaultParams, extendParams);
  return action({ path: restPath, options: parameter, ...extendDefaultParams, apiParams: extraParams });
}
