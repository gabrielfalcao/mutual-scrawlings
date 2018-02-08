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


def handler(event, context):
    logger.info(event)

    key = str(uuid.uuid1())
    content_type = get_content_type(event)
    params = {
        'Bucket': BUCKET,
        'Key': key,
        'ACL': 'public-read',
        'Metadata': {
            'user': event.get('requestContext').get('authorizer').get('user_id'),
        }
    }
    if content_type:
        params['ContentType'] = content_type
    try:
        url = s3.generate_presigned_url(
            'put_object',
            Params=params,
            ExpiresIn=1000,
            HttpMethod='PUT'
        )

    except Exception as e:
        logger.info('exception: ' + str(e))
        raise Exception
    else:
        return {
            'statusCode': 200, 'body': json.dumps(
                {'url': url, 'key': key, 'content_type': content_type}
            ),
            'headers': {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": True
            },
        }


def get_content_type(event):
    content_type = None
    filename = event.get('queryStringParameters', {}).get('filename')
    if filename:
        extension = '.' + filename.split('.')[-1]
        if len(extension) > 1:
            content_type = mimetypes.types_map.get(extension)
    return content_type
