import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sensorRoutes from './routes/sensorRoutes';
import { testDbConnection } from './config/db';
import { initWebSocketServer, broadcastLatestData } from './services/websocketService';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 允许跨域
app.use(cors());
// 解析JSON请求
app.use(express.json());

// 注册路由
app.use('/api/sensors', sensorRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: '正常', time: new Date().toLocaleString() });
});

// 启动服务
app.listen(port, async () => {
  console.log(`🚀 HTTP服务器启动成功：http://localhost:${port}`);
  await testDbConnection(); // 测试数据库连接
  initWebSocketServer();    // 初始化WebSocket
  
  // 每3秒广播一次最新数据（实时推送）
  setInterval(broadcastLatestData, 3000);
});