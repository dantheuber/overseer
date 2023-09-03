module.exports = (subsegment, req, res, err) => {
  subsegment.addMetadata('accept', req.getHeader('accept'));

  if (err && err.code) {
    subsegment.addAnnotation('errorCode', err.code);
  }

  if (res) {
    subsegment.addMetadata('content-type', res.headers['content-type']);
    subsegment.addMetadata('content-length', res.headers['content-length']);
  }
};