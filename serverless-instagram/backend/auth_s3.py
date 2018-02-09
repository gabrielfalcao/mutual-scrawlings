import logging
import os
import uuid
import boto3
import json
import mimetypes

s3 = boto3.client('s3')
mimetypes.init()

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

BUCKET = os.environ['S3_BUCKET']
HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": True
}


def handler(event, context):
    logger.info(event)
    content_type = event.get('queryStringParameters', {}).get('content_type')
    if not content_type:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Missing content_type query parameter!'}),
            'headers': HEADERS
        }

    key = generate_key(content_type)
    params = {
        'Bucket': BUCKET,
        'Key': key,
        'ACL': 'public-read',
        'ContentType': content_type,
        'Metadata': {'user': event['requestContext']['authorizer']['principalId']}
    }

    url = s3.generate_presigned_url(
        'put_object',
        Params=params,
        ExpiresIn=1000,
        HttpMethod='PUT'
    )

    return {
        'statusCode': 200, 'body': json.dumps(
            {'url': url, 'key': key, 'content_type': content_type}
        ),
        'headers': HEADERS
    }


def generate_key(content_type):
    file_extension = mimetypes.guess_extension(content_type, strict=False)
    key = str(uuid.uuid1())
    if file_extension:
        return key + file_extension
    return key
