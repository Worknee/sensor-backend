import express from 'express';
import { getLatestXuzhouReading, getRecentXuzhouReadings ,getByWarehouseConditions} from '../services/sensorService';

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

// ... 保留原有导入 ...

/**
 * @route   GET /api/sensors/xuzhou/query
 * @desc    按仓库名、楼层、库方向、货位号查询数据
 * @query   warehouse - 完整仓库名（如“徐州厂区原料仓库1号库”）
 * @query   floor - 楼层（如“4”）
 * @query   direction - 库方向（如“南库”“东库”）
 * @query   position - 货位号（如“13”）
 */
/**
 * 新增：添加 startTime 和 endTime 作为可选查询参数
 */
router.get('/xuzhou/query', async (req, res) => {
  try {
    // 获取所有参数（新增 startTime 和 endTime）
    const { warehouse, floor, direction, position, startTime, endTime } = req.query;

    // 验证必填参数（原有逻辑）
    if (
      typeof warehouse !== 'string' ||
      typeof floor !== 'string' ||
      typeof direction !== 'string' ||
      typeof position !== 'string'
    ) {
      return res.status(400).json({ message: '仓库名、楼层、库方向、货位号必须为字符串' });
    }

    // 新增：验证时间格式（可选，格式为 YYYY-MM-DD HH:MM:SS）
    const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (startTime && (typeof startTime !== 'string' || !timeRegex.test(startTime))) {
      return res.status(400).json({ message: 'startTime格式错误，应为YYYY-MM-DD HH:MM:SS' });
    }
    if (endTime && (typeof endTime !== 'string' || !timeRegex.test(endTime))) {
      return res.status(400).json({ message: 'endTime格式错误，应为YYYY-MM-DD HH:MM:SS' });
    }

    // 调用服务层方法（传入时间参数）
    const results = await getByWarehouseConditions(
      warehouse, 
      floor, 
      direction, 
      position, 
      startTime as string, // 传递可选的时间参数
      endTime as string
    );

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: '未找到匹配的记录' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;