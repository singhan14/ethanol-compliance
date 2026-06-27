#!/bin/bash
BUCKET="ethanolcompliance.in-aws-deploy"

# 1. Disable Block Public Access
aws s3api delete-public-access-block --bucket $BUCKET

# 2. Add bucket policy for public read
cat << 'POLICY' > bucket-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*"
    }
  ]
}
POLICY

# Replace $BUCKET in policy
sed -i '' "s/\$BUCKET/$BUCKET/g" bucket-policy.json

aws s3api put-bucket-policy --bucket $BUCKET --policy file://bucket-policy.json

# 3. Enable Website Hosting
aws s3api put-bucket-website --bucket $BUCKET --website-configuration '{"IndexDocument":{"Suffix":"index.html"}}'

# 4. Sync files
aws s3 sync . s3://$BUCKET --exclude ".git/*" --exclude "deploy.sh" --exclude "bucket-policy.json" --exclude "patch.py"

echo "Deployment complete."
