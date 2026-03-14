// Bangumi 番组计划 API工具函数

/**
 * 从 Bangumi 获取每日放送动画
 * 
 * @param {string} day - 星期几 (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
 * @returns {Promise<Array>} 动画列表
 */
export async function fetchBangumiDaily(day) {
  try {
    // Bangumi 每日放送 API
    const response = await fetch(`https://api.bgm.tv/calendar/${day}`);
    
    if (!response.ok) {
      throw new Error(`Bangumi API 请求失败：${response.status}`);
    }
    
    const data = await response.json();
    
    // 转换数据格式
    return data.items.map(item => ({
      id: item.id,
      title: item.name,
      titleCN: item.name_cn || item.name,
      poster: item.images ? item.images.common : '',
      rating: item.rating ? item.rating.score : '暂无',
      type: 'tv',
      bangumiUrl: `https://bgm.tv/subject/${item.id}`,
      airDate: item.date || '',
      episode: item.episode || 0,
    }));
  } catch (error) {
    console.error("获取 Bangumi 每日放送失败:", error);
    return [];
  }
}

/**
 * 从 Bangumi 获取热门动画
 * 
 * @param {string} type - 类型 (tv, movie, ova, special)
 * @param {number} limit - 返回数量
 * @param {number} offset - 偏移量
 * @returns {Promise<Array>} 动画列表
 */
export async function fetchBangumiRanking(type = 'tv', limit = 20, offset = 0) {
  try {
    const params = new URLSearchParams({
      type: type.toString(),
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const response = await fetch(`https://api.bgm.tv/v0/search/subjects?${params.toString()}`, {
      headers: {
        'User-Agent': 'TV-Website/1.0 (https://github.com/your-repo)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Bangumi API 请求失败：${response.status}`);
    }
    
    const data = await response.json();
    
    return data.data.map(item => ({
      id: item.id,
      title: item.name,
      titleCN: item.name_cn || item.name,
      poster: item.images ? item.images.large || item.images.common : '',
      rating: item.rating ? item.rating.score : '暂无',
      type: item.type === 2 ? 'movie' : 'tv',
      bangumiUrl: `https://bgm.tv/subject/${item.id}`,
      year: item.date ? new Date(item.date).getFullYear() : '',
      tags: item.tags ? item.tags.map(t => t.name).slice(0, 3) : [],
    }));
  } catch (error) {
    console.error("获取 Bangumi 排行失败:", error);
    return [];
  }
}

/**
 * 搜索 Bangumi 动画
 * 
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回数量
 * @returns {Promise<Array>} 动画列表
 */
export async function searchBangumi(keyword, limit = 20) {
  try {
    const params = new URLSearchParams({
      keyword: encodeURIComponent(keyword),
      limit: limit.toString(),
    });
    
    const response = await fetch(`https://api.bgm.tv/search/subject/${encodeURIComponent(keyword)}?${params.toString()}`, {
      headers: {
        'User-Agent': 'TV-Website/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Bangumi API 请求失败：${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.list) {
      return [];
    }
    
    return data.list.map(item => ({
      id: item.id,
      title: item.name,
      titleCN: item.name_cn || item.name,
      poster: item.images ? item.images.common : '',
      rating: item.rating ? item.rating.score : '暂无',
      type: item.type === 2 ? 'movie' : 'tv',
      bangumiUrl: `https://bgm.tv/subject/${item.id}`,
    }));
  } catch (error) {
    console.error("搜索 Bangumi 失败:", error);
    return [];
  }
}

/**
 * 将 Bangumi 数据转换为应用格式
 * 
 * @param {Object} item - Bangumi 项目
 * @returns {Object} 转换后的对象
 */
export function convertBangumiToMovie(item) {
  return {
    id: item.id,
    title: item.titleCN || item.title,
    rating: item.rating,
    type: "anime",
    poster: item.poster,
    backdrop: item.poster,
    bangumiUrl: item.bangumiUrl,
    year: item.year,
    tags: item.tags || [],
  };
}
