import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DEBUG TEMPORAIRE — à retirer après test
console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey);