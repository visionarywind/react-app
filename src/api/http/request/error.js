import { ReportType } from '@/const/index';
import { isDevelopment } from '@/utils/tool/env';
import reportErrorLog from '@/utils/report';

export function handleError(type, error, path) {
  if (isDevelopment()) {
    console.error('Unhandled error type[' + type + '] path[' + path + ']', error);
  } else {
    reportErrorLog(ReportType.SERVER, error.message, error.stack, { code: error.code, name: error.name, path });
  }
}

export function handleFrontError(error, path) {
  handleError(ReportType.FRONT, error, path);
}

export class MioError extends Error {
  constructor(message, code = -1) {
    super();
    this.message = message;
    this.name = 'MioError';
    this.code = code;
  }

  report = path => {
    handleFrontError(this, path);
    return true;
  }
}

export class MioHttpError extends MioError {
  constructor(message, code = -1) {
    super(message, code);
    this.name = 'MioHttpError';
  }
}

export class MioResponseError extends MioError {
  constructor(message, code = -1) {
    super(message, code);
    this.name = 'MioResponseError';
  }
}

export class MioDumbError extends MioError {
  constructor(message, code = -1) {
    super(message, code);
    this.name = 'MioDumbError';
  }

  report = () => {
    console.info('MioDumbError');
  };
}

export class MioNoNetError extends MioError {
  constructor(message, code = -1) {
    super(message, code);
    this.name = 'MioNoNetError';
  }

  report = () => {
    console.info('MioNoNetError');
  };
}

export class MioTimeoutError extends MioError {
  constructor(message, code = -1) {
    super(message, code);
    this.name = 'MioTimeoutError';
  }
}

export class MioUnauthorizedError extends MioDumbError {
  constructor(message, code = 401) {
    super(message, code);
    this.name = 'MioUnauthorizedError';
  }

  report = () => {
    console.info('MioUnauthorizedError');
  };
}
