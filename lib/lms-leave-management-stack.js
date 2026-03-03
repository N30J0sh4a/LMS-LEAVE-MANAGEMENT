const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigatewayv2');
const integrations = require('aws-cdk-lib/aws-apigatewayv2-integrations');
const logs = require('aws-cdk-lib/aws-logs');
const iam = require('aws-cdk-lib/aws-iam');
const cdk = require('aws-cdk-lib');
require('dotenv').config();

const environment = process.env.ENVIRONMENT || 'dev';
const projectCallsign = 'lms';

class LmsLeaveManagementStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const leaveTable = new dynamodb.Table(this, 'LeaveTable', {
      tableName: `${projectCallsign}-leavetable-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: environment === 'prod',
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    leaveTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const lambdaEnv = {
      TABLE_NAME: leaveTable.tableName,
      ENVIRONMENT: environment,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
    };

    const createLambda = (id, handlerPath) => {
      return new lambda.Function(this, id, {
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        handler: handlerPath,
        code: lambda.Code.fromAsset('lambda'),
        environment: lambdaEnv,
        memorySize: 256,
        timeout: Duration.seconds(30),
        tracing: lambda.Tracing.ACTIVE,
        logRetention: logs.RetentionDays.ONE_MONTH,
      });
    };

    const submitLeaveFn = createLambda('SubmitLeave', 'leaves/submit-leave/index.handler');
    const getLeaveFn = createLambda('GetLeave', 'leaves/get-leave/index.handler');
    const cancelLeaveFn = createLambda('CancelLeave', 'leaves/cancel-leave/index.handler');
    const approveLeaveFn = createLambda('approveLeave', 'leaves/approve-leave/index.handler');
    const rejectLeaveFn = createLambda('RejectLeave', 'leaves/reject-leave/index.handler');
    const listLeaveFn = createLambda('ListLeave', 'leaves/list-employee-leaves/index.handler');
    const empListLeavesFn = createLambda('empListLeave', 'employees/list-employee-leave/index.handler');

    const registerAuthFn = createLambda('RegisterAuth', 'auth/register/index.handler');
    const loginAuthFn = createLambda('LoginAuth', 'auth/login/index.handler');

    leaveTable.grantWriteData(submitLeaveFn);
    leaveTable.grantReadData(getLeaveFn);
    leaveTable.grantReadWriteData(cancelLeaveFn);
    leaveTable.grantReadWriteData(approveLeaveFn);
    leaveTable.grantReadWriteData(rejectLeaveFn);
    leaveTable.grantReadData(listLeaveFn);
    leaveTable.grantReadData(empListLeavesFn);

    leaveTable.grantReadWriteData(registerAuthFn);
    leaveTable.grantReadWriteData(loginAuthFn);

    const allFunctions = [
      submitLeaveFn,
      getLeaveFn,
      cancelLeaveFn,
      approveLeaveFn,
      rejectLeaveFn,
      listLeaveFn,
      empListLeavesFn,
      registerAuthFn,
      loginAuthFn,
    ];

    allFunctions.forEach((fn) => {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
          resources: ['arn:aws:logs:*:*:*'],
        })
      );
    });

    const httpApi = new apigateway.HttpApi(this, 'LeaveApi', {
      apiName: `${projectCallsign}-apigw-${environment}`,
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    httpApi.addRoutes({
      path: '/v1/leaves',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('SubmitLeaveInt', submitLeaveFn),
    });

    httpApi.addRoutes({
      path: '/v1/leaves/{leaveId}',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetLeaveInt', getLeaveFn),
    });

    httpApi.addRoutes({
      path: '/v1/leaves',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('ListLeaveInt', listLeaveFn),
    });

    httpApi.addRoutes({
      path: '/v1/employees/{employeeId}/leaves',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('EmpListLeaveInt', empListLeavesFn),
    });

    httpApi.addRoutes({
      path: '/v1/leaves/{leaveId}/reject',
      methods: [apigateway.HttpMethod.PATCH],
      integration: new integrations.HttpLambdaIntegration('RejectLeaveInt', rejectLeaveFn),
    });

    httpApi.addRoutes({
      path: '/v1/leaves/{leaveId}/approve',
      methods: [apigateway.HttpMethod.PATCH],
      integration: new integrations.HttpLambdaIntegration('ApproveLeaveInt', approveLeaveFn),
    });

    httpApi.addRoutes({
      path: '/v1/leaves/{leaveId}/cancel',
      methods: [apigateway.HttpMethod.PATCH],
      integration: new integrations.HttpLambdaIntegration('CancelLeaveInt', cancelLeaveFn),
    });

    httpApi.addRoutes({
      path: '/v1/auth/register',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('RegisterAuthInt', registerAuthFn),
    });

    httpApi.addRoutes({
      path: '/v1/auth/login',
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('LoginAuthInt', loginAuthFn),
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'Leave Management API URL',
    });
  }
}

module.exports = { LmsLeaveManagementStack };
