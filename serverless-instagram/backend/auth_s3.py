import logging
import os
import uuid
import boto3
import json
import mimetypes

# s3 = boto.connect_s3()
s3 = boto3.client('s3')
mimetypes.init()

log = logging.getLogger()
log.setLevel(logging.DEBUG)
BUCKET = os.environ['S3_BUCKET']


def get_content_type(event):
    content_type = None
    filename = event.get('queryStringParameters', {}).get('filename')
    if filename:
        extension = '.' + filename.split('.')[-1]
        if len(extension) > 1:
            content_type = mimetypes.types_map.get(extension)
    return content_type


def handler(event, context):
    print(event)
    bucket = BUCKET
    key = str(uuid.uuid1())
    # fields = {"acl": "public-read"}
    # conditions = [
    #     {"acl": "public-read"},
    #     ["content-length-range", 10, 100]
    # ]
    content_type = get_content_type(event)
    params = {
        'Bucket': bucket,
        'Key': key,
        'ACL': 'public-read',
        'Metadata': {
            'user': event.get('requestContext').get('authorizer').get('user_id'),
        }
    }
    if content_type:
        params['ContentType'] = content_type
    try:
        # post = s3.generate_presigned_post(
        #     Bucket=bucket,
        #     Key=key
        # )
        url = s3.generate_presigned_url(
            'put_object',
            Params=params,
            ExpiresIn=1000,
            HttpMethod='PUT'
        )

        # url = s3.generate_url(5*60, 'PUT', 'serverless-instagram-images-d', 'ala.jpeg', headers={'Content-Type': 'image/jpeg', 'x-amz-acl':'public-read'} )
        # url = s3.generate_url(100 * 5 * 60, 'PUT', bucket, key, headers={'Content-Type': 'image/jpg'})
    except Exception as e:
        print('exception: ' + str(e))

    # fields = post.get('fields')
    # params = fields
    # # params = {key: value for key, value in fields.items() if key in ['AWSAccessKeyId', 'Signature']}
    # url = post.get('url') + fields.pop('key') + '/?' + urllib.parse.urlencode(params)
    # print(url)
    return {
        'statusCode': 200, 'body': json.dumps({'url': url, 'key': key, 'content_type': content_type}),
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True
        },
    }
