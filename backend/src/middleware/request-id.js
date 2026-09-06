import { randomUUID } from 'node:crypto';

const safeRequestId = /^[a-zA-Z0-9._:-]{8,128}$/;

export function requestId(request, response, next) {
  const incoming = request.get('x-request-id');
  request.id = incoming && safeRequestId.test(incoming) ? incoming : randomUUID();
  response.setHeader('x-request-id', request.id);
  next();
}
