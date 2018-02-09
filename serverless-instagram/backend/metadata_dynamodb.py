import boto3
import json
import logging
import os
import time

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    key = event['Records'][0]['s3']['object']['key']
    bucket = event['Records'][0]['s3']['bucket']['name']

    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    item = {
        'user': get_s3_object_author(bucket, key),
        'image': 'https://s3.amazonaws.com/{}/{}'.format(bucket, key),
        'createdAt': int(time.time() * 1000),
    }

    table.put_item(Item=item)

    response = {
        "statusCode": 200,
        "body": json.dumps(item)
    }

    return response


def get_s3_object_author(bucket, key):
    response = s3.head_object(Bucket=bucket, Key=key)
    logger.info('Response: {}'.format(response))

    return response['Metadata']['user']
