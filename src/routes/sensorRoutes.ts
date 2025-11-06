import express from 'express';
import { getLatestXuzhouReading, getRecentXuzhouReadings } from '../services/sensorService';

const router = express.Router();

// 获取徐州地区最新数据
router.get('/xuzhou/latest', async (req, res) => {
  try {
    const data = await getLatestXuzhouReading();
    data ? res.json(data) : res.status(404).json({ message: '无徐州地区数据' });
  } catch (error) {
    res.status(500).json({ message: '获取数据失败', error: (error as Error).message });
  }
});

// 获取徐州地区最近N条数据
router.get('/xuzhou/recent', async (req, res) => {
  try {
    const count = req.query.count ? parseInt(req.query.count as string) : 100;
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({ message: 'count必须是正整数' });
    }
    const data = await getRecentXuzhouReadings(count);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: '获取数据失败', error: (error as Error).message });
  }
});

export default router;