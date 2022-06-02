const { dbQuery } = require("./db-query");
// PgSidekick class defines methods for making asynchronous PostgreSQL queries

module.exports = class PgSidekick {
  // TODO: define sql queries for postgres
  async loadBuckets() {
    const LOAD_BINS = 'SELECT * FROM buckets'
    let buckets = await dbQuery(LOAD_BINS)
    return buckets.rows
  }
  
  async addBucket(url) {
    const ADD_BUCKET = `INSERT INTO buckets (url) VALUES ('${url}')`;
    await dbQuery(ADD_BUCKET);
    return true;
  }

  /*
INSERT INTO buckets (url) VALUES 
  ('http://example.com'),
  ('google.com'),
  ('askjeeves.com')
;
  */
  // async loadNotes() {
  //   const LOAD_NOTES = "SELECT * FROM notes"

  //   let notes = dbQuery(LOAD_NOTES)
  //   return notes;
  // }

  // async createNote(content) {
  //   const CREATE_NOTE = "INSERT INTO notes (content) VALUES ($1)";

  //   let result = await dbQuery(CREATE_NOTE, content);
  //   return !!result;
  // }
}