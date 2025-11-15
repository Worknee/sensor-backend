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

// ... 保留原有导入 ...

/**
 * 根据仓库名、楼层、库方向、货位号查询数据
 * @param warehouse 完整仓库名（如“徐州厂区原料仓库1号库”）
 * @param floor 楼层（如“4”→ 第4层）
 * @param direction 库方向（如“南库”“东库”）
 * @param position 货位号（如“13”）
 * @returns 匹配的记录数组
 */
/**
 * 新增：添加 startTime 和 endTime 参数（可选）
 * @param startTime 开始时间（格式：YYYY-MM-DD HH:MM:SS，如"2025-11-01 00:00:00"）
 * @param endTime 结束时间（同上）
 */
export const getByWarehouseConditions = async (
  warehouse: string,
  floor: string,
  direction: string,
  position: string,
  startTime?: string, // 新增：可选参数
  endTime?: string    // 新增：可选参数
): Promise<SensorReading[]> => {
  try {
    // 1. 保留原有参数验证逻辑（仓库名、楼层等）
    if (!warehouse || !floor || !direction || !position) {
      throw new Error("仓库名、楼层、库方向、货位号均为必填参数");
    }

    // 2. 库方向编码转换（原有逻辑不变）
    let dirCode: string | null = null;
    if (warehouse.includes('厂区原料仓库')) {
      dirCode = direction === '南库' ? '01' : direction === '北库' ? '02' : null;
    } else if (warehouse.includes('苏山头')) {
      dirCode = direction === '东库' ? '01' : direction === '西库' ? '02' : null;
    }
    if (!dirCode) {
      throw new Error(`仓库类型与库方向不匹配（${warehouse}支持${warehouse.includes('厂区原料') ? '南库/北库' : '东库/西库'}）`);
    }

    // 3. 构造查询条件（核心：新增时间筛选）
    const locationPattern = `%-${floor}-${dirCode}-${position}`;
    // 基础SQL和参数
    let sql = `SELECT * FROM tdwd_scg_fqua_tempwet_collect 
               WHERE baseorgname = ? 
               AND location LIKE ?`;
    const params: any[] = [warehouse, locationPattern];

    // 新增：如果有 startTime，添加时间起始条件
    if (startTime) {
      sql += " AND recordtime >= ?";
      params.push(startTime);
    }

    // 新增：如果有 endTime，添加时间结束条件
    if (endTime) {
      sql += " AND recordtime <= ?";
      params.push(endTime);
    }

    // 保持排序（按时间倒序）
    sql += " ORDER BY recordtime DESC";

    // 4. 执行查询
    const [rows] = await pool.execute(sql, params);
    return Array.isArray(rows) ? (rows as SensorReading[]) : [];
  } catch (error) {
    console.error('按条件查询失败:', error);
    throw error;
  }
};