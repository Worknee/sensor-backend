import WebSocket, { WebSocketServer } from 'ws';
import { getLatestXuzhouReading } from './sensorService';

// 创建WebSocket服务器（端口8080）
export const wss = new WebSocketServer({ port: 8080 });

// 存储所有连接的客户端
const clients = new Set<WebSocket>();

/**
 * 初始化WebSocket服务
 */
export const initWebSocketServer = () => {
  // 客户端连接时
  wss.on('connection', (ws) => {
    console.log('新客户端连接WebSocket');
    clients.add(ws);

    // 给新连接的客户端发送当前最新数据
    sendLatestData(ws);

    // 客户端断开连接时
    ws.on('close', () => {
      console.log('客户端断开WebSocket连接');
      clients.delete(ws);
    });

    // 接收客户端消息（可选）
    ws.on('message', (message) => {
      console.log(`收到客户端消息: ${message}`);
    });
  });

  console.log('✅ WebSocket服务器启动成功，端口：8080');
};

/**
 * 向单个客户端发送最新数据
 */
const sendLatestData = async (ws: WebSocket) => {
  try {
    const data = await getLatestXuzhouReading();
    if (data) {
      ws.send(JSON.stringify({
        type: 'real_time_data', // 消息类型
        data: data,             // 温湿度数据
        time: new Date().toLocaleString() // 发送时间
      }));
    }
  } catch (error) {
    console.error('发送数据给客户端失败:', error);
  }
};

/**
 * 向所有连接的客户端广播最新数据
 */
export const broadcastLatestData = async () => {
  try {
    const data = await getLatestXuzhouReading();
    if (data) {
      const message = JSON.stringify({
        type: 'real_time_data',
        data: data,
        time: new Date().toLocaleString()
      });

      // 遍历所有客户端并发送
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  } catch (error) {
    console.error('广播数据失败:', error);
  }
};