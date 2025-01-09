import { createClient } from "@supabase/supabase-js";

// Remplacez par votre URL et votre clé API Supabase
const supabaseUrl = "https://foljwqxbgfnbudbtjwcw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbGp3cXhiZ2ZuYnVkYnRqd2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjcwMjEsImV4cCI6MjA1MTkwMzAyMX0.oxkPk3xQfb-LbY2abdq6xjMjSl6uGtbiBCoVDXaeU5c";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
