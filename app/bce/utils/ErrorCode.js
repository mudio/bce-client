/**
 * Error - Error Mapping File
 *
 * @file error.js
 * @author mudio(job.mudio@gmail.com)
 */

export default {
    AccessDenied: '拒绝访问',
    BadDigest: '错误的Content-MD5字段，与实际上传的数据MD5不符',
    BucketAlreadyExists: 'Bucket已经存在',
    BucketNotEmpty: '试图删除一个不为空的bucket',
    EntityTooLarge: '上传的数据大于限制',
    EntityTooSmall: '上传的数据小于限制',
    InappropriateJSON: '请求中的JSON格式正确，但语义上不符合要求。如缺少某个必需项，或者值类型不匹配等。',
    InappropriateXML: '适用场景同InappropriateJSON',
    InternalError: '服务器错误',
    InvalidAccessKeyId: 'Access Key ID不存在',
    InvalidArgument: '无效参数',
    InvalidBucketName: 'BucketName不合法',
    InvalidHTTPAuthHeader: 'Authorization头域格式错误',
    InvalidHTTPRequest: 'HTTP body格式错误。例如不符合指定的Encoding等',
    InvalidObjectName: 'Object Key过长',
    InvalidPart: '无效的Part，在三步上传的第三步，发现有一些part不存在，或者part ETag不匹配',
    InvalidPartOrder: '上传的Part必须按照PartNumber升序排列进行上传的第三步',
    InvalidPolicyDocument: 'Policy格式错误',
    InvalidRange: '请求的Range不合法',
    InvalidURI: 'URI形式不正确',
    MalformedJSON: 'JSON格式不合法',
    MalformedXML: 'XML格式不合法',
    MaxMessageLengthExceeded: '超出消息长度的限制',
    MetadataTooLarge: 'Meta数据超过限制',
    MethodNotAllowed: '请求的方法不允许',
    MissingContentLength: '缺少Content-Length字段',
    MissingDateHeader: '请求中找不到Date和x-bce-date两者之一',
    NoSuchBucket: '不存在该Bucket',
    NoSuchKey: '不存在该Object',
    NoSuchUpload: '该uploadId所对应的三步上传不存在',
    NotImplemented: '系统未实现',
    ObjectUnappendable: '对非Appendable的Object做AppendObject操作',
    OffsetIncorrect: '<OffsetSize>值不等于已上传的Object的大小或者<OffsetSize>值不为0但Object不存在',
    PreconditionFailed: '预处理错误',
    RequestExpired: '请求的时间戳过期。请求超时，',
    RequestTimeout: '请求超时。',
    ServiceUnavailable: '服务不可用',
    SignatureDoesNotMatch: 'Authorization头域中附带的签名和服务端验证不一致',
    SlowDown: '请求过于频繁',
    TooManyBuckets: '创建的Bucket数目超过了限制'
};
