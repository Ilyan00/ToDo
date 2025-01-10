import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();
// Remplacez par votre URL et votre clé API Supabase dans le .env ou ici directement
const supabaseUrl: string = process.env.SUPABASE_URL || "";
const supabaseKey: string = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
