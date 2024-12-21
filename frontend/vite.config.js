import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    root: "src", // Define 'src' as the root directory
    plugins: [react()],
    server: {
        port: 8000, // Local development server port
    },
    build: {
        outDir: "../build", // Output directory in the project root
        emptyOutDir: true,  // Ensures 'build' folder is cleaned before each build
    },
    base: "./", // Ensures relative paths for assets
});

