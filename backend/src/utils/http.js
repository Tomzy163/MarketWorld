export function ok(response, data = {}, message = 'Operation completed successfully') {
  return response.status(200).json({
    success: true,
    data,
    message,
    requestId: response.req.id,
  });
}

export function created(response, data = {}, message = 'Resource created successfully') {
  return response.status(201).json({
    success: true,
    data,
    message,
    requestId: response.req.id,
  });
}

export function noContent(response) {
  return response.status(204).send();
}
