import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    root: "src", // Specify 'src' as the root directory
    plugins: [react()],
    server: {
        port: 3000,
    },
    build: {
        outDir: "src/build", // Adjust path since 'root' is now 'src'
    },
    base: "./", // Ensures relative paths for assets
});

