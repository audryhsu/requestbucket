const { dbQuery } = require("./db-query");
// PgSidekick class defines methods for making asynchronous PostgreSQL queries

module.exports = class PgSidekick {
  // TODO: define sql queries for postgres
  async loadBuckets() {
    const LOAD_BINS = 'SELECT * FROM buckets'
    let buckets = await dbQuery(LOAD_BINS)
    return buckets.rows
  }

  async loadRequests(bucketUrl) {
    // returns all requests for given bucketUrl
    const LOAD_REQUESTS = `SELECT * FROM requests WHERE bucket_id =(SELECT id FROM buckets WHERE url=('${bucketUrl}'))`;
   
    let requests = await dbQuery(LOAD_REQUESTS)
    return requests.rows
  }

  async createRequest(bucketId, requestType, mongoId) {
    const INSERT_REQUEST = `INSERT INTO requests (bucket_id, request_type, mongo_document_ref) VALUES ('${bucketId}', '${requestType}', '${mongoId}')`;

    let newRequest = await dbQuery(INSERT_REQUEST)
    return newRequest
  }
  
}