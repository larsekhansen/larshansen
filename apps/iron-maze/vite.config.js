import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// iron-maze was migrated from Create React App. The JSX entry points use the
// .jsx extension; the remaining .js helpers are plain jQuery (no JSX).
export default defineConfig({
  plugins: [react()],
});
