CREATE TABLE eventstore (
  position BIGSERIAL,
  stream_type VARCHAR NOT NULL,
  stream_id VARCHAR NOT NULL,
  version INT NOT NULL,
  event_type VARCHAR,
  payload JSONB,
  metadata JSONB,
  timestamp TIMESTAMP,
  PRIMARY KEY (stream_type, stream_id, version)
);