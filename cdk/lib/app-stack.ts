import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import path = require('path');

export interface AppStackProps extends StackProps {
    vpc: ec2.Vpc;
    cluster: ecs.Cluster;
    appImage?: ecs.ContainerImage;
    nginxImage?: ecs.ContainerImage;
}

export class AppStack extends Stack {
    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
            memoryLimitMiB: 512,
            cpu: 256
        });

        // App
        const appLogging = new ecs.AwsLogDriver({
            streamPrefix: "app"
        });

        const appImage = props.appImage || new ecs.AssetImage(path.join(__dirname, '../..', 'app'));

        const appContainer = taskDefinition.addContainer("app", {
            image: appImage,
            logging: appLogging
        });
        appContainer.addPortMappings({ containerPort: 300 })

        //Nginx
        const nginxLogging = new ecs.AwsLogDriver({
            streamPrefix: "nginx"
        });

        const nginxImage = props.nginxImage || new ecs.AssetImage(path.join(__dirname, '../..', 'nginx'));

        const nginxContainer = taskDefinition.addContainer("nginx", {
            image: nginxImage,
            logging: nginxLogging
        });
        nginxContainer.addPortMappings({ containerPort: 80 });

        const service = new ecs.FargateService(this, 'Service', {
            cluster: props.cluster,
            taskDefinition
        });

        const scaling = service.autoScaleTaskCount({ maxCapacity: 4 });
        scaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 50,
            scaleInCooldown: Duration.seconds(60),
            scaleOutCooldown: Duration.seconds(60)
        });

        const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
            vpc: props.vpc,
            internetFacing: true
        });

        const listener = lb.addListener('HttpListener', {
            port: 80
        });

        listener.addTargets('DefaultTarget', {
            port:80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service]
        });

        new CfnOutput(this, 'LoadBalancerDNS', { value: lb.loadBalancerDnsName });

    }
}

