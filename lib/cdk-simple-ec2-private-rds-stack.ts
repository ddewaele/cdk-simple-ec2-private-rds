import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { MachineImage } from 'aws-cdk-lib/aws-ec2';

export class CdkSimpleEc2PrivateRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });

    // Security group for EC2 instance to allow only SSH access
    const ec2Sg = new ec2.SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });
    ec2Sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));


    // Create an EC2 instance
    const ec2Instance = new ec2.Instance(this, 'MyEc2Instance', {
      instanceType: new ec2.InstanceType('t3.micro'),
      machineImage: MachineImage.latestAmazonLinux2023(),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: ec2Sg,
    });

    // Security group for RDS to allow connections only from EC2 instance
    const rdsSg = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc,
      allowAllOutbound: false,
    });
    rdsSg.addIngressRule(ec2Instance.connections.securityGroups[0], ec2.Port.tcp(5432), 'Allow PostgreSQL');

    // Create an RDS instance
    const rdsInstance = new rds.DatabaseInstance(this, 'MyRdsInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_13_9 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [rdsSg],
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'The ID of the VPC',
    });

    vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnetId${index}`, {
        value: subnet.subnetId,
        description: `The ID of public subnet ${index}`,
      });
    });
    
    vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PrivateSubnetId${index}`, {
        value: subnet.subnetId,
        description: `The ID of private subnet ${index}`,
      });
    });

    new cdk.CfnOutput(this, 'EC2InstanceId', {
      value: ec2Instance.instanceId,
      description: 'The ID of the EC2 instance',
    });

    new cdk.CfnOutput(this, 'EC2PublicIP', {
      value: ec2Instance.instancePublicIp,
      description: 'The public IP address of the EC2 instance',
    });

    new cdk.CfnOutput(this, 'RDSDBName', {
      value: 'yourDatabaseName', // Replace with your actual database name
      description: 'The database name within the RDS instance',
    });

    new cdk.CfnOutput(this, 'RDSAddress', {
      value: rdsInstance.dbInstanceEndpointAddress,
      description: 'The endpoint address of the RDS instance',
    });
    
    new cdk.CfnOutput(this, 'RDSPort', {
      value: rdsInstance.dbInstanceEndpointPort,
      description: 'The endpoint port of the RDS instance',
    });

    new cdk.CfnOutput(this, 'EC2SecurityGroupId', {
      value: ec2Sg.securityGroupId,
      description: 'The ID of the EC2 instance security group',
    });
    
    new cdk.CfnOutput(this, 'RDSSecurityGroupId', {
      value: rdsSg.securityGroupId,
      description: 'The ID of the RDS instance security group',
    });

  }
}
