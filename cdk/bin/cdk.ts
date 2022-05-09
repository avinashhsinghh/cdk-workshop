#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClusterStack } from '../lib/cluster-stack';
import { Tags } from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { DevPipelineStack } from '../lib/dev-pipeline-stack';

const app = new cdk.App();
const devClusterStack = new ClusterStack(app, 'DevCluster', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  cidr: '10.1.0.0/20',
  maxAZs: 2
});
Tags.of(devClusterStack).add('environment', 'dev');

//Code Pipeline
const devPipelineStack = new DevPipelineStack(app, 'DevPipelineStack');
Tags.of(devPipelineStack).add('environment', 'dev');

const devAppStack = new AppStack(app, 'DevAppStack', {
  vpc: devClusterStack.vpc,
  cluster: devClusterStack.cluster,
  appImage: devPipelineStack.appBuiltImage,
  nginxImage: devPipelineStack.nginxBuiltImage,
});
Tags.of(devAppStack).add('environment', 'dev');