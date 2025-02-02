import { validateEnvVariable } from "./validateEnvVariable";

export const prepareEnvironment = () => {
  // Validate and assign environment variables
  const SUPABASE_CONNEXION_STRING = validateEnvVariable(
    process.env.SUPABASE_CONNEXION_STRING,
    "SUPABASE_CONNEXION_STRING"
  );
  const AI_PROVIDER_BASE_URL = validateEnvVariable(
    process.env.AI_PROVIDER_BASE_URL,
    "AI_PROVIDER_BASE_URL"
  );
  const AI_PROVIDER_API_KEY = validateEnvVariable(
    process.env.AI_PROVIDER_API_KEY,
    "AI_PROVIDER_API_KEY"
  );
  const AI_MODEL = validateEnvVariable(process.env.AI_MODEL, "AI_MODEL");
  const SUPABASE_URL = validateEnvVariable(process.env.SUPABASE_URL, "SUPABASE_URL");
  const SUPABASE_KEY = validateEnvVariable(process.env.SUPABASE_KEY, "SUPABASE_KEY");

  return {
    SUPABASE_CONNEXION_STRING,
    AI_MODEL,
    AI_PROVIDER_API_KEY,
    AI_PROVIDER_BASE_URL,
    SUPABASE_URL,
    SUPABASE_KEY
  };
};
