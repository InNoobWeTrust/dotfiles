Zip this folder then go to [cloud shell](console.aws.amazon.com/cloudshell) and upload the zipped file

Unzip the archive to current directory with:
```shell
unzip Archive.zip
```

Edit "BUCKET" and "SUBNET" in `run.sh`, replace with your S3 bucket name and SubnetId from your account

Run the master script to create clusters with pre-defined steps
```shell
sh run-all.sh
```

You can then monitor the cluster until all steps completed => [EMR](console.aws.amazon.com/emr)

To see the logs, click tab "Steps", look at column "Log files", either click "stdout" to see success result or "stderr" to see error message
