-- Ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the chat_history table with UUIDs
CREATE TABLE chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50),
    message TEXT,
    response TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create the event_history table with UUID for chat_id
CREATE TABLE event_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chat_history(id),
    event TEXT,
    payload JSON,
    state TEXT,
    message TEXT
);
