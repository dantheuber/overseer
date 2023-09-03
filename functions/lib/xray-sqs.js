const { getXray } = require("./util");
const { Segment, setSegment, utils } = getXray();

function createLambdaSegment(context, sqsRecord) {
  console.log('createLambdaSegment', context, sqsRecord);
  const lambdaExecStartTime = new Date().getTime() / 1000;

  const traceHeaderStr = sqsRecord.attributes.AWSTraceHeader;
  const traceData = utils.processTraceData(traceHeaderStr);
  const sqsSegmentEndTime = Number(sqsRecord.attributes.ApproximateFirstReceiveTimestamp) / 1000;

  const segment = new Segment(
    context.functionName,
    traceData.root,
    traceData.parent
  );
  segment.origin = "AWS::Lambda::Function";
  segment.start_time = lambdaExecStartTime - (lambdaExecStartTime - sqsSegmentEndTime);
  segment.addPluginData({
    function_arn : context.invokedFunctionArn,
    region : context.region,
    request_id : context.awsRequestId
  });

  return segment;
}

module.exports = function setLambdaSegmentFromSQS(context, sqsRecord) {
  const segment = createLambdaSegment(context, sqsRecord);
  setSegment(segment);
  return segment;
};