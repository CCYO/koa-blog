// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
//const storage = new Storage();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The ID of your GCS bucket
// const bucketName = 'your-unique-bucket-name';

//const bucketName = 'a001ccy-koa-blog.appspot.com'
const bucketName = 'a001ccy-koa-blog'

// The origin for this CORS config to allow requests from
// const origin = 'http://example.appspot.com';
const origin = '*'

// The response header to share across origins
// const responseHeader = 'Content-Type';
const responseHeader = 'Content-Type'

// The maximum amount of time the browser can make requests before it must
// repeat preflighted requests
// const maxAgeSeconds = 3600;
const maxAgeSeconds = 3600

// The name of the method
// See the HttpMethod documentation for other HTTP methods available:
// https://cloud.google.com/appengine/docs/standard/java/javadoc/com/google/appengine/api/urlfetch/HTTPMethod
// const method = 'GET';
const method = 'GET'

const storage = new Storage({
    projectId: 'a001ccy-koa-blog',
  })

storage.getBuckets().then( x => console.log(x))
//const check = storage.bucket('/').file('Logo.jpg').exists().then( ok => console.log(ok)).catch(e => console.log('xxx => ', e))

