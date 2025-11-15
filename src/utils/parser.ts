/**
 * 解析仓库名称和位置字段的工具函数
 */
export const parseWarehouseNumber = (baseorgname: string): string => {
  const match = baseorgname.match(/(\d+号库)/);
  return match ? match[1] : '未知仓库';
};

export const parseLocation = (location: string, baseorgname: string): {
  floor: string;
  direction: string;
  position: string;
} => {
  const parts = location.split('-');
  if (parts.length < 4) {
    return { floor: '未知楼层', direction: '未知库', position: '未知货位' };
  }

  // 解析楼层
  const floorNum = parts[1];
  const floor = /^\d+$/.test(floorNum) ? `第${floorNum}层` : '未知楼层';

  // 解析库方向
  const dirCode = parts[2];
  let direction = '未知库';
  if (baseorgname.includes('厂区原料仓库')) {
    direction = dirCode === '01' ? '南库' : dirCode === '02' ? '北库' : direction;
  } else if (baseorgname.includes('苏山头')) {
    direction = dirCode === '01' ? '东库' : dirCode === '02' ? '西库' : direction;
  }

  // 解析货位号
  const positionNum = parts[3];
  const position = /^\d{1,2}$/.test(positionNum) ? `${positionNum}号` : '未知货位';

  return { floor, direction, position };
};

export const formatWarehouseInfo = (baseorgname: string, location: string): string => {
  const warehouseNumber = parseWarehouseNumber(baseorgname);
  const { floor, direction, position } = parseLocation(location, baseorgname);
  return `${warehouseNumber}${floor}${direction}${position}`;
};