#!/usr/bin/env sh

BUCKET=a_unit_of_data_that_can_be_transferred_from_a_backing_store_in_a_single_operation
# https://console.aws.amazon.com/vpc/
SUBNET=subnet-000000000BEEFCAFE
REGION=us-east-1

# Upload scripts to S3
aws s3 sync script "s3://$BUCKET/script/"

# Replace bucket string in config file
sed 's,{{BUCKET}},'"${BUCKET}"',g' > ./config/steps.json < ./config/steps.template.json

# Start cluster and run steps
CLUSTER_INFO=$(aws emr create-cluster \
    --name "MyUnderwareHouse" \
    --log-uri "s3n://$BUCKET/logs/" \
    --release-label "emr-5.26.0" \
    --use-default-roles \
    --ec2-attributes "SubnetId=$SUBNET" \
    --applications Name=Hadoop Name=Hive Name=Tez \
    --instance-groups file://./config/instance-groups.json \
    --steps file://./config/steps.json \
    --scale-down-behavior "TERMINATE_AT_TASK_COMPLETION" \
    --auto-terminate \
    --region "$REGION")

echo $CLUSTER_INFO

export CLUSTERID=$(echo $CLUSTER_INFO | jq .ClusterId | tr -d '"')

rm ./config/steps.json
