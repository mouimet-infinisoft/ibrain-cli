-- Drop event_history table
DROP TABLE IF EXISTS public.event_history;
DROP TABLE IF EXISTS public.chat_history;

-- Recreate chat_history table
CREATE TABLE public.chat_history (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    flow JSON NULL,
    CONSTRAINT chat_history_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create index on timestamp column
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp
ON public.chat_history USING btree ("timestamp") TABLESPACE pg_default;
