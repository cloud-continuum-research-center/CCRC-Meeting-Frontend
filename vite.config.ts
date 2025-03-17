import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
    ],
    server: {
      // https: { // 잠시 주석처리
      //   key: fs.readFileSync('./localhost+1-key.pem'),
      //   cert: fs.readFileSync('./localhost+1.pem'),
      // },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        // AI 관련 프록시
        '/AI': {
          target: env.VITE_AI_URL,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/AI/, ''),

        },
      },
      build: {
        assetsDir: 'assets',
      },
    },
  };
});
