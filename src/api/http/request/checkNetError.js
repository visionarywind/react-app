import { HTTP_OK, HTTP_MULTIPLE_CHOICE, HTTP_UNAUTHORIZED } from '@/const/http';
import { IS_MOCK_SERVER, REPORT_API, ReportType } from '@/const/index';
import { MioHttpError } from '@/api/http/request/error';
import { networkError } from '../networkError';
import { isDevelopment } from '@/utils/tool/env';
import reportErrorLog from '@/utils/report';

export default function checkNetError(req, rep) {
  // mock server
  if (IS_MOCK_SERVER) return rep.json();

  if ((rep.status >= HTTP_OK && rep.status < HTTP_MULTIPLE_CHOICE) || rep.status === HTTP_UNAUTHORIZED) {
    return rep.json();
  } else {
    const { url } = req;
    if (!url.includes(REPORT_API) && !isDevelopment()) {
      reportErrorLog(ReportType.SERVER, '接口错误', rep, { serverUrl: url });
    }
  }

  networkError(rep);
  throw new MioHttpError('Net error ', rep.status);
}
