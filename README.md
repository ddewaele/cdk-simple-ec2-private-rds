# AWS CDK TypeScript Project: VPC, EC2, and RDS Setup

## Overview

This project is an AWS Cloud Development Kit (CDK) application that provisions 

- a VPC
- an EC2 instance
- RDS PostgreSQL database. 

![](./docs/ec2-rds.png)

The infrastructure includes a VPC with public and private subnets across two Availability Zones

- an EC2 instance within a public subnet
- an RDS instance within a private subnet.


The `scecret-arn` used to retrieve the auto-generated password can be retrieved via

```
aws secretsmanager get-secret-value --secret-id <secret-arn>
```

Connecting to the RDS is possible from the EC2 instance using the following command: 


```
[ec2-user@ip-10-0-0-83 ~]$ psql --host [HOSTNAME] --port=5432 --username=postgres
Password for user postgres: 
psql (15.4, server 13.9)
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, compression: off)
Type "help" for help.

postgres=> \d
Did not find any relations.
postgres=> \l
                                                 List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    | ICU Locale | Locale Provider |   Access privileges   
-----------+----------+----------+-------------+-------------+------------+-----------------+-----------------------
 postgres  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |            | libc            | 
 rdsadmin  | rdsadmin | UTF8     | en_US.UTF-8 | en_US.UTF-8 |            | libc            | rdsadmin=CTc/rdsadmin+
           |          |          |             |             |            |                 | rdstopmgr=Tc/rdsadmin
 template0 | rdsadmin | UTF8     | en_US.UTF-8 | en_US.UTF-8 |            | libc            | =c/rdsadmin          +
           |          |          |             |             |            |                 | rdsadmin=CTc/rdsadmin
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |            | libc            | =c/postgres          +
           |          |          |             |             |            |                 | postgres=CTc/postgres
(4 rows)

postgres=> 
```

After deployment, the CDK will output the relevant information such as EC2 public IP, RDS endpoint, etc.

## Resources Created

- **Amazon VPC**: A virtual private cloud with public and private subnets.
- **EC2 Instance**: An Amazon EC2 instance within the public subnet.
- **RDS Instance**: An Amazon RDS PostgreSQL instance within a private subnet.
- **Security Groups**: Separate security groups for EC2 and RDS instances with minimal access rules.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
