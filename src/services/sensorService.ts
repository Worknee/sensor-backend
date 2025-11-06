import { pool } from '../config/db';
import { SensorReading } from '../models/SensorReading';

/**
 * 获取徐州地区最新的温湿度数据
 */
export const getLatestXuzhouReading = async (): Promise<SensorReading | null> => {
  try {
    // 筛选baseorgname前两个字为"徐州"的最新数据
    const [rows] = await pool.execute(
      `SELECT * FROM tdwd_scg_fqua_tempwet_collect 
       WHERE LEFT(baseorgname, 2) = '徐州' 
       ORDER BY recordtime DESC LIMIT 1`
    );
    
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as SensorReading) : null;
  } catch (error) {
    console.error('获取最新数据失败:', error);
    throw error;
  }
};

/**
 * 获取徐州地区最近N条数据
 */
export const getRecentXuzhouReadings = async (count: number = 100): Promise<SensorReading[]> => {
  try {
    const validCount = Math.max(1, Math.min(1000, count)); // 限制1-1000条
    const [rows] = await pool.execute(
      `SELECT * FROM tdwd_scg_fqua_tempwet_collect 
       WHERE LEFT(baseorgname, 2) = '徐州' 
       ORDER BY recordtime DESC LIMIT ?`,
      [validCount]
    );
    
    return Array.isArray(rows) ? (rows as SensorReading[]) : [];
  } catch (error) {
    console.error('获取最近数据失败:', error);
    throw error;
  }
};