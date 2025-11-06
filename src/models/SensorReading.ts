/**
 * 温湿度数据模型（对应数据库表tdwd_scg_fqua_tempwet_collect）
 */
export interface SensorReading {
  id?: number;
  baseorgname: string;  // 仓库名（筛选前两个字为"徐州"）
  humidity: number;     // 湿度值
  recordtime: Date;     // 记录时间
  temperature: number;  // 温度值
  temppass: 'Y' | 'N';  // 温度是否正常（Y/N）
  thpass: 'Y' | 'N';    // 湿度是否正常（Y/N）
  location: string;     // 位置信息
}