import json
import logging
import os
import time

import boto3

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_s3_object_author(bucket, key):
    response = s3.head_object(Bucket=bucket, Key=key)
    logger.info('Response: {}'.format(response))

    return response['Metadata']['user']


def create(event, context):
    key = event['Records'][0]['s3']['object']['key']
    bucket = event['Records'][0]['s3']['bucket']['name']

    user = get_s3_object_author(bucket, key)

    timestamp = int(time.time() * 1000)

    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    item = {
        'user': user,
        'image': 'https://s3.amazonaws.com/{}/{}'.format(bucket, key),
        'createdAt': timestamp,
        'updatedAt': timestamp,
    }

    table.put_item(Item=item)

    # create a response
    response = {
        "statusCode": 200,
        "body": json.dumps(item)
    }

    return response
