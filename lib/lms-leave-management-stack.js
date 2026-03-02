// lib/lms-leave-management-stack.js
const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigatewayv2');
const integrations = require('aws-cdk-lib/aws-apigatewayv2-integrations');
const logs = require('aws-cdk-lib/aws-logs');
const sqs = require('aws-cdk-lib/aws-sqs');
const cdk = require('aws-cdk-lib');
require('dotenv').config();

const environment = process.env.ENVIRONMENT || 'dev'; // puwede ilagay nalang ito sa nasa baba kung mastrip un
const projectCallsign = 'lms';

class LmsLeaveManagementStack extends Stack{
    constructor(scope, id, props){
        super(scope, id, props);
   

    const leaveTable = new dynamodb.Table(this, 'LeaveTable', {
        tableName: `${projectCallsign}-leavetable-${environment}-neo`, // palitan ung name of dedeploy
        partitionKey: {name: 'PK', type: dynamodb.AttributeType.STRING},
        sortKey: {name: 'SK', type: dynamodb.AttributeType.STRING},
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: environment === 'prod',
        removalPolicy: environment === 'prod'
        ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    leaveTable.addGlobalSecondaryIndex({
        indexName: 'StatusIndex',
        partitionKey: {name: 'GSI1PK', type: dynamodb.AttributeType.STRING},
        sortKey: {name: 'GSI1SK', type: dynamodb.AttributeType.STRING},
        projectionType: dynamodb.ProjectionType.ALL,
    });

    const lambdaEnv = {
        TABLE_NAME: leaveTable.tableName,
        ENVIRONMENT: environment,
    };

    const createLambda = (id, folder) => {
        return new lambda.Function(this, id, {
            runtime: lambda.Runtime.NODEJS_20_X,
            architecture: lambda.Architecture.ARM_64,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(folder),
            environment: lambdaEnv,
            memorySize: 256,
            timeout: Duration.seconds(30),
            tracing: lambda.Tracing.ACTIVE,
            logRetention: logs.RetentionDays.ONE_MONTH,
        })
    };


            //baguhin nalang ung nasababa nito after upload
        const submitLeaveFn = createLambda('SubmitLeave', 'lambda/leaves/submit-leave');
        const getLeaveFn = createLambda('GetLeave', 'lambda/leaves/get-leave');
        const cancelLeaveFn = createLambda('CancelLeave', 'lambda/leaves/cancel-leave');
        const approveLeaveFn = createLambda('approveLeave', 'lambda/leaves/approve-leave');
        const rejectLeaveFn = createLambda('RejectLeave', 'lambda/leaves/reject-leave');
        const listLeaveFn = createLambda('ListLeave', 'lambda/leaves/list-employee-leaves');
        const empListLeavesFn = createLambda('empListLeave', 'lambda/employees/list-employee-leave');
        
        leaveTable.grantWriteData(submitLeaveFn);
        leaveTable.grantReadData(getLeaveFn);
        leaveTable.grantWriteData(cancelLeaveFn);
        leaveTable.grantReadWriteData(approveLeaveFn);
        leaveTable.grantReadWriteData(rejectLeaveFn);
        leaveTable.grantReadData(listLeaveFn);
        leaveTable.grantReadWriteData(empListLeavesFn);

        const httpApi = new apigateway.HttpApi(this, 'LeaveApi', {// puwede HttpApi if need
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
            path: '/v1/leaves',
            methods: [apigateway.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration('ListLeaveInt', listLeaveFn),
        });

        httpApi.addRoutes({
            path: '/v1/leaves/{leaveId}',
            methods: [apigateway.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration('GetLeaveInt', getLeaveFn),
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
            path: '/v1/employees/{employeeId}/leaves',
            methods: [apigateway.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration('EmpListLeaveInt', empListLeavesFn),
        });

        new cdk.CfnOutput(this, 'ApiUrl', {// di sure dito
            value: httpApi.apiEndpoint,
            description: 'Leave Management API URL',
        });
    }
}

module.exports = {LmsLeaveManagementStack};