import boto3
import decimal
import json
import os

METADATA_TABLE = os.environ['METADATA_TABLE']
dynamodb = boto3.resource('dynamodb')


def handler(event, context):
    table = dynamodb.Table(METADATA_TABLE)
    result = table.scan()

    response = {
        "statusCode": 200,
        "body": json.dumps(result['Items'], cls=DecimalEncoder),
        'headers': {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": True
        }
    }

    return response


# This is a workaround for: http://bugs.python.org/issue16535
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return int(obj)
        return super(DecimalEncoder, self).default(obj)
