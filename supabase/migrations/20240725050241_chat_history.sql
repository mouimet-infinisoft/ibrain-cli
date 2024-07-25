CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    message TEXT,
    response TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);