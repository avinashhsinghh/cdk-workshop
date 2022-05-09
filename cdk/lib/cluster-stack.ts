import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';


export interface ClusterStackProps extends StackProps {
  cidr: string;
  maxAZs: number;
}

export class ClusterStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: props.maxAZs,
      cidr: props.cidr
    })

    this.cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc: this.vpc
    })
  }
}
