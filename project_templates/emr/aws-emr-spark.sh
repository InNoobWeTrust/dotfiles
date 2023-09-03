#!/usr/bin/env sh

BUCKET=a_unit_of_data_that_can_be_transferred_from_a_backing_store_in_a_single_operation
# https://console.aws.amazon.com/vpc/
SUBNET=subnet-000000000BEEFCAFE
REGION=us-east-1

# Terminate cluster when script exit
function cleanup() {
    echo 'Terminating cluster ' $CLUSTERID ' ...'
    (set -x; aws emr terminate-clusters --cluster-id $CLUSTERID)
}
trap cleanup EXIT

CLUSTERID=$(set -x; aws emr create-cluster \
    --name "Sparkling cluster" \
    --log-uri "s3n://$BUCKET/logs/spark/" \
    --release-label "emr-6.12.0" \
    --use-default-roles \
    --ec2-attributes "SubnetId=$SUBNET" \
    --applications Name=Hadoop Name=JupyterEnterpriseGateway Name=JupyterHub Name=Livy Name=Spark Name=Zeppelin \
    --instance-groups file://./config/instance-groups.json \
    --scale-down-behavior "TERMINATE_AT_TASK_COMPLETION" \
    --os-release-label "2.0.20230808.0" \
    --region "$REGION" \
    --query "ClusterId" \
    --output text)

echo "Created cluster: $CLUSTERID"

while [ -z $MASTERID ] || [ $MASTERID = "None" ]
do
    sleep 10
    MASTERID=$(set -x; aws emr list-instances \
        --cluster-id $CLUSTERID \
        --instance-group-types MASTER \
        --query "Instances[*].Ec2InstanceId" \
        --output text)
done
echo 'InstanceId of Master node:' $MASTERID

while [ -z $MASTERNODE_DNS ] || [ $MASTERNODE_DNS = "None" ]
do
    sleep 30
    MASTERNODE_DNS=$(set -x; aws emr describe-cluster \
        --cluster-id $CLUSTERID \
        --query 'Cluster.MasterPublicDnsName' \
        --output text)
done
echo 'Public DNS of Master node: ' $MASTERNODE_DNS


# Wait cluster running, push ssh key to Master node and run SSH tunnel
(
    set -x
    aws emr wait cluster-running --cluster-id $CLUSTERID
    aws ec2-instance-connect send-ssh-public-key --instance-id $MASTERID --instance-os-user hadoop --ssh-public-key "file://~/.ssh/id_rsa.pub"
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa -N -L 8998:$MASTERNODE_DNS:8998 hadoop@$MASTERNODE_DNS
)
