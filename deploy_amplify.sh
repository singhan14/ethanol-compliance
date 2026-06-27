#!/bin/bash
set -e

APP_NAME="EthanolCompliance"
BRANCH_NAME="main"
BUCKET="ethanolcompliance.in-aws-deploy"
ZIP_FILE="deploy.zip"

echo "Zipping assets..."
zip -r $ZIP_FILE index.html style.css script.js

echo "Uploading zip to S3..."
aws s3 cp $ZIP_FILE s3://$BUCKET/$ZIP_FILE

echo "Creating Amplify App..."
APP_INFO=$(aws amplify create-app --name $APP_NAME)
APP_ID=$(echo $APP_INFO | grep -o '"appId": "[^"]*' | cut -d'"' -f4)

echo "App ID: $APP_ID"

echo "Creating branch..."
aws amplify create-branch --app-id $APP_ID --branch-name $BRANCH_NAME

echo "Starting deployment..."
JOB_INFO=$(aws amplify start-deployment \
  --app-id $APP_ID \
  --branch-name $BRANCH_NAME \
  --source-url s3://$BUCKET/$ZIP_FILE)
  
JOB_ID=$(echo $JOB_INFO | grep -o '"jobId": "[^"]*' | cut -d'"' -f4)

echo "Deployment Job ID: $JOB_ID"
echo "Waiting for deployment to complete..."

STATUS="PENDING"
while [ "$STATUS" != "SUCCEED" ] && [ "$STATUS" != "FAILED" ]; do
  sleep 5
  JOB_STATUS_JSON=$(aws amplify get-job --app-id $APP_ID --branch-name $BRANCH_NAME --job-id $JOB_ID)
  STATUS=$(echo $JOB_STATUS_JSON | grep -o '"status": "[^"]*' | head -1 | cut -d'"' -f4)
  echo "Status: $STATUS"
done

if [ "$STATUS" = "SUCCEED" ]; then
  echo "Amplify App URL: https://$BRANCH_NAME.$APP_ID.amplifyapp.com"
else
  echo "Deployment Failed."
fi
