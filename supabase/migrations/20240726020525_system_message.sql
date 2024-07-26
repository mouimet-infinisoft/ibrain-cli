-- Add system column
ALTER TABLE public.chat_history
ADD COLUMN system TEXT;