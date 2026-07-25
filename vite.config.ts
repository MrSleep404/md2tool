import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import https from 'https'
import http from 'http'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许通过IP地址访问
    port: 5173, // 端口号，可以根据需要修改
  },
  plugins: [
    react(),
    {
      name: 'image-proxy',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/proxy-image?url=')) {
            const url = new URL(req.url, 'http://localhost');
            const imageUrl = url.searchParams.get('url');

            if (imageUrl) {
              console.log('代理图片请求:', imageUrl);

              const protocol = imageUrl.startsWith('https') ? https : http;

              protocol.get(imageUrl, (proxyRes) => {
                if (proxyRes.statusCode !== 200) {
                  console.error('图片获取失败:', proxyRes.statusCode);
                  res.writeHead(proxyRes.statusCode || 500);
                  res.end('Image fetch failed');
                  return;
                }

                // 设置响应头
                res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/*');
                res.setHeader('Access-Control-Allow-Origin', '*');

                // 流式传输图片数据
                proxyRes.pipe(res);
              }).on('error', (err) => {
                console.error('代理错误:', err);
                res.writeHead(500);
                res.end('Proxy Error');
              });

              return;
            }
          }
          next();
        });
      },
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})