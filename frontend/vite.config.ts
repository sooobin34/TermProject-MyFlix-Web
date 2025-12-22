import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/WSD-Assignment-02-netflix/",   // GitHub repo 이름과 동일해야 함!!!
})
