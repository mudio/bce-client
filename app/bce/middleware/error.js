/**
 * Error - Error Mapping File
 *
 * @file error.js
 * @author mudio(job.mudio@gmail.com)
 */

export default {
    AccessDenied: '拒绝访问',
    BadDigest: '数据MD5不符',
    BucketAlreadyExists: 'Bucket已经存在',
    BucketNotEmpty: 'Bucket不为空',
    EntityTooLarge: '上传的数据大于限制',
    EntityTooSmall: '上传的数据小于限制',
    InappropriateJSON: '请求中数据值类型不匹配',
    InappropriateXML: '适用场景同InappropriateJSON',
    InternalError: '服务器错误',
    InvalidAccessKeyId: 'Access Key无效',
    InvalidArgument: '无效参数',
    InvalidBucketName: 'BucketName不合法',
    InvalidHTTPAuthHeader: 'Authorization头域格式错误',
    InvalidHTTPRequest: '无效的请求',
    InvalidObjectName: 'Object Key过长',
    InvalidPart: '无效的Part',
    InvalidPartOrder: '无效的Part排序',
    InvalidPolicyDocument: 'Policy格式错误',
    InvalidRange: '请求的Range不合法',
    InvalidURI: 'URI形式不正确',
    MalformedJSON: 'JSON格式不合法',
    MalformedXML: 'XML格式不合法',
    MaxMessageLengthExceeded: '超出消息长度的限制',
    MetadataTooLarge: 'Meta数据超过限制',
    MethodNotAllowed: '请求的方法不允许',
    MissingContentLength: '缺少Content-Length字段',
    MissingDateHeader: '请求中找不到Date和x-bce-date',
    NoSuchBucket: '不存在该Bucket',
    NoSuchKey: '不存在该Object',
    NoSuchUpload: '该uploadId所对应的三步上传不存在',
    NotImplemented: '系统未实现',
    ObjectUnappendable: 'Object不能追加数据',
    OffsetIncorrect: 'Offset错误',
    PreconditionFailed: '预处理错误',
    RequestExpired: '请求的时间戳过期。请求超时，',
    RequestTimeout: '请求超时。',
    ServiceUnavailable: '服务不可用',
    SignatureDoesNotMatch: 'AK/SK 验证错误',
    SlowDown: '请求过于频繁',
    TooManyBuckets: '创建的Bucket数目超过了限制'
};
