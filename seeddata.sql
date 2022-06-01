-- Load test data for dev purposes only. 
INSERT INTO buckets (url) VALUES 
  ('http://example.com'),
  ('google.com'),
  ('askjeeves.com')
;

INSERT INTO requests (bucket_id, request_type, mongo_document_ref) VALUES
  (1, 'GET', 'abcd'),
  (2, 'POST', 'xyz'),
  (3, 'PUT', 'defgh')
;