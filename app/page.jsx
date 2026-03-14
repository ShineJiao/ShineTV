"use client";
import { useState, useEffect, useCallback } from "react";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ContinueWatching } from "@/components/ContinueWatching";
import { SideMenu } from "@/components/SideMenu";
import { usePlayHistoryStore } from "@/store/usePlayHistoryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { fetchRecommendations, loadUserTags, saveUserTags, defaultMovieTags, defaultTvTags, defaultAnimeTags, defaultVarietyTags, defaultShortDramaTags, convertDoubanToMovie } from "@/lib/doubanApi";
import { fetchBangumiDaily, fetchBangumiRanking, convertBangumiToMovie } from "@/lib/bangumiApi";
import {
  MaterialSymbolsChevronLeftRounded,
  MaterialSymbolsChevronRightRounded,
  MaterialSymbolsCloseRounded,
  MaterialSymbolsAdd,
} from "@/components/icons";

export default function Home() {
  const [mediaType, setMediaType] = useState("home");
  const [currentTag, setCurrentTag] = useState("热门");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [movieTags, setMovieTags] = useState([]);
  const [tvTags, setTvTags] = useState([]);
  const [animeTags, setAnimeTags] = useState([]);
  const [varietyTags, setVarietyTags] = useState([]);
  const [shortDramaTags, setShortDramaTags] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const pageSize = 12;

  // 获取播放记录
  const playHistory = usePlayHistoryStore((state) => state.playHistory);
  // 获取豆瓣代理设置
  const doubanProxy = useSettingsStore((state) => state.doubanProxy);

  useEffect(() => {
    const { movieTags: loadedMovieTags, tvTags: loadedTvTags, animeTags: loadedAnimeTags, varietyTags: loadedVarietyTags, shortDramaTags: loadedShortDramaTags } = loadUserTags();
    setMovieTags(loadedMovieTags);
    setTvTags(loadedTvTags);
    setAnimeTags(loadedAnimeTags);
    setVarietyTags(loadedVarietyTags);
    setShortDramaTags(loadedShortDramaTags);
  }, []);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      if (mediaType === "short") {
        // 短剧使用红果数据，按标签筛选
        const shortDramaTagMap = {
          "热门": "hot",
          "最新": "newest",
          "高分推荐": "recommend",
          "全部": "all",
          "都市": "city",
          "言情": "romance",
          "逆袭": "counterattack",
          "战神": "warrior",
          "神医": "doctor",
          "穿越": "time-travel",
        };
        const shortTag = shortDramaTagMap[currentTag] || currentTag;
        const res = await fetch(`/api/hongguo?page_limit=${pageSize}&page_start=${page * pageSize}&tag=${shortTag}`);
        const data = await res.json();
        const converted = (data.list || []).map((item) => ({
          id: item.title,
          title: item.title,
          poster: item.poster,
          rating: item.rating || "暂无",
          hongguoUrl: item.hongguoUrl,
        }));
        setMovies(converted);
      } else if (mediaType === "anime") {
        // 动漫使用 Bangumi 数据
        let converted = [];
        
        if (currentTag === "热门") {
          // 获取热门动画
          const bangumiData = await fetchBangumiRanking('tv', pageSize, page * pageSize);
          converted = bangumiData.map(convertBangumiToMovie);
        } else if (["周一", "周二", "周三", "周四", "周五", "周六", "周日"].includes(currentTag)) {
          // 每日放送
          const dayMap = {
            "周一": "monday",
            "周二": "tuesday",
            "周三": "wednesday",
            "周四": "thursday",
            "周五": "friday",
            "周六": "saturday",
            "周日": "sunday",
          };
          const bangumiData = await fetchBangumiDaily(dayMap[currentTag]);
          converted = bangumiData.map(convertBangumiToMovie);
        } else if (currentTag === "每日放送") {
          // 显示今日放送
          const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const today = days[new Date().getDay()];
          const bangumiData = await fetchBangumiDaily(today);
          converted = bangumiData.map(convertBangumiToMovie);
        } else if (currentTag === "番剧") {
          // TV 动画
          const bangumiData = await fetchBangumiRanking('tv', pageSize, page * pageSize);
          converted = bangumiData.map(convertBangumiToMovie);
        } else if (currentTag === "剧场版") {
          // 剧场版
          const bangumiData = await fetchBangumiRanking('movie', pageSize, page * pageSize);
          converted = bangumiData.map(convertBangumiToMovie);
        }
        
        setMovies(converted);
      } else if (mediaType === "movie") {
        // 电影使用豆瓣数据，按标签筛选
        const movieTagMap = {
          "热门": "热门",
          "最新": "最新",
          "豆瓣高分": "豆瓣高分",
          "冷门佳片": "冷门佳片",
          "全部": "",
          "华语": "华语",
          "欧美": "欧美",
          "韩国": "韩国",
          "日本": "日本",
        };
        const movieTag = movieTagMap[currentTag] || currentTag;
        const data = await fetchRecommendations("movie", movieTag, pageSize, page * pageSize, doubanProxy);
        const converted = data.subjects.map(convertDoubanToMovie);
        setMovies(converted);
      } else if (mediaType === "variety") {
        // 综艺使用豆瓣数据，按标签筛选
        const tagMap = {
          "最近热门": "热门",
          "全部": "综艺",
          "国内": "大陆",
          "国外": "韩国",
        };
        const varietyTag = tagMap[currentTag] || "综艺";
        const data = await fetchRecommendations("tv", varietyTag, pageSize, page * pageSize, doubanProxy);
        const converted = data.subjects.map(convertDoubanToMovie).map(item => ({
          ...item,
          type: "variety",
        }));
        setMovies(converted);
      } else {
        // 其他类型使用豆瓣数据
        const data = await fetchRecommendations(mediaType, currentTag, pageSize, page * pageSize, doubanProxy);
        const converted = data.subjects.map(convertDoubanToMovie);
        setMovies(converted);
      }
    } catch (error) {
      console.error("加载失败:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [mediaType, currentTag, page, doubanProxy]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    if (type === "home") {
      setCurrentTag("热门");
    } else if (type === "movie") {
      setCurrentTag("热门");
    } else if (type === "tv") {
      setCurrentTag("国产剧");
    } else if (type === "anime") {
      setCurrentTag("热门动漫");
    } else if (type === "variety") {
      setCurrentTag("热门综艺");
    } else if (type === "short") {
      setCurrentTag("热门短剧");
    }
    setPage(0);
  };

  const handleTagClick = (tag) => {
    setCurrentTag(tag);
    setPage(0);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const defaultTag = mediaType === "home" ? "热门" : mediaType === "movie" ? "热门" : mediaType === "tv" ? "国产剧" : mediaType === "anime" ? "热门" : mediaType === "variety" ? "最近热门" : "热门";
  const rawTags = mediaType === "movie" ? movieTags : mediaType === "tv" ? tvTags : mediaType === "anime" ? animeTags : mediaType === "variety" ? varietyTags : mediaType === "short" ? shortDramaTags : [];
  const currentTags = rawTags.includes(defaultTag) ? [defaultTag, ...rawTags.filter((t) => t !== defaultTag)] : rawTags;

  const handleAddTag = (tagName) => {
    const trimmedTag = tagName.trim();
    if (!trimmedTag) return;

    if (mediaType === "movie") {
      if (movieTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...movieTags, trimmedTag];
      setMovieTags(newTags);
      saveUserTags(newTags, tvTags, animeTags, varietyTags);
    } else if (mediaType === "tv") {
      if (tvTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...tvTags, trimmedTag];
      setTvTags(newTags);
      saveUserTags(movieTags, newTags, animeTags, varietyTags);
    } else if (mediaType === "anime") {
      if (animeTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...animeTags, trimmedTag];
      setAnimeTags(newTags);
      saveUserTags(movieTags, tvTags, newTags, varietyTags);
    } else if (mediaType === "variety") {
      if (varietyTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...varietyTags, trimmedTag];
      setVarietyTags(newTags);
      saveUserTags(movieTags, tvTags, animeTags, newTags);
    } else if (mediaType === "short") {
      if (shortDramaTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...shortDramaTags, trimmedTag];
      setShortDramaTags(newTags);
      saveUserTags(movieTags, tvTags, animeTags, varietyTags, newTags);
    }
  };

  const handleDeleteTag = (tag) => {
    if (tag === "热门" || tag === "每日放送" || tag === "番剧" || tag === "剧场版" || tag === "最近热门" || tag === "全部" || tag === "高分推荐") {
      alert("热门标签不能删除");
      return;
    }

    if (mediaType === "movie") {
      const newTags = movieTags.filter((t) => t !== tag);
      setMovieTags(newTags);
      saveUserTags(newTags, tvTags, animeTags, varietyTags);
    } else if (mediaType === "tv") {
      const newTags = tvTags.filter((t) => t !== tag);
      setTvTags(newTags);
      saveUserTags(movieTags, newTags, animeTags, varietyTags);
    } else if (mediaType === "anime") {
      const newTags = animeTags.filter((t) => t !== tag);
      setAnimeTags(newTags);
      saveUserTags(movieTags, tvTags, newTags, varietyTags);
    } else if (mediaType === "variety") {
      const newTags = varietyTags.filter((t) => t !== tag);
      setVarietyTags(newTags);
      saveUserTags(movieTags, tvTags, animeTags, newTags);
    } else if (mediaType === "short") {
      const newTags = shortDramaTags.filter((t) => t !== tag);
      setShortDramaTags(newTags);
      saveUserTags(movieTags, tvTags, animeTags, varietyTags, newTags);
    }

    if (currentTag === tag) {
      setCurrentTag(mediaType === "anime" ? "热门" : mediaType === "variety" ? "最近热门" : "热门");
      setPage(0);
    }
  };

  const handleResetTags = () => {
    if (mediaType === "movie") {
      setMovieTags([...defaultMovieTags]);
      saveUserTags([...defaultMovieTags], tvTags, animeTags, varietyTags);
    } else if (mediaType === "tv") {
      setTvTags([...defaultTvTags]);
      saveUserTags(movieTags, [...defaultTvTags], animeTags, varietyTags);
    } else if (mediaType === "anime") {
      setAnimeTags([...defaultAnimeTags]);
      saveUserTags(movieTags, tvTags, [...defaultAnimeTags], varietyTags);
    } else if (mediaType === "variety") {
      setVarietyTags([...defaultVarietyTags]);
      saveUserTags(movieTags, tvTags, animeTags, [...defaultVarietyTags]);
    } else if (mediaType === "short") {
      setShortDramaTags([...defaultShortDramaTags]);
      saveUserTags(movieTags, tvTags, animeTags, varietyTags, [...defaultShortDramaTags]);
    }
    setCurrentTag("热门");
    setPage(0);
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-8 pt-6 page-enter">
      {/* Side Menu */}
      <SideMenu mediaType={mediaType} onMediaTypeChange={handleMediaTypeChange} />

      {/* Categories - 短剧模式不显示标签 */}
      {mediaType !== "short" && mediaType !== "home" && (
      <div className="w-full overflow-hidden relative group/scroll">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2 px-1">
          <button
            onClick={() => setShowTagModal(true)}
            className="shrink-0 px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer btn-press flex items-center"
          >
            <MaterialSymbolsAdd className="text-[16px] mr-1" />
            管理标签
          </button>
          {currentTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`shrink-0 px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer btn-press ${
                tag === currentTag
                  ? "bg-primary/10 border border-primary text-primary font-semibold hover:bg-primary hover:text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-background-light to-transparent pointer-events-none"></div>
      </div>
      )}

      {/* Continue Watching Section */}
      {playHistory && playHistory.length > 0 && <ContinueWatching playHistory={playHistory} />}

      {/* Popular Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            {mediaType === "short" ? "红果短剧 - 热门推荐" : `豆瓣热门 - ${currentTag}`}
          </h2>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all btn-press ${
                page === 0 ? "border-gray-200 text-gray-300 cursor-not-allowed opacity-50" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary cursor-pointer"
              }`}
              title="上一页"
            >
              <MaterialSymbolsChevronLeftRounded className="text-[20px]" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={movies.length < pageSize}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all btn-press ${
                movies.length < pageSize
                  ? "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary cursor-pointer"
              }`}
              title="下一页"
            >
              <MaterialSymbolsChevronRightRounded className="text-[20px]" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
            {Array.from({ length: pageSize }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
            {movies.map((movie, index) => (
              <div key={movie.id} className="grid-item-animate">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag Management Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 modal-backdrop-enter" onClick={() => setShowTagModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto modal-content-enter" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                标签管理 ({mediaType === "movie" ? "电影" : mediaType === "tv" ? "电视剧" : mediaType === "anime" ? "动漫" : mediaType === "variety" ? "综艺" : "短剧"})
              </h3>
              <button onClick={() => setShowTagModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors btn-press">
                <MaterialSymbolsCloseRounded />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">当前标签</h4>
                <button onClick={handleResetTags} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors btn-press">
                  恢复默认
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                  <div key={tag} className="group bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg text-sm font-medium flex items-center gap-2">
                    <span>{tag}</span>
                    {tag !== "热门" && (
                      <button onClick={() => handleDeleteTag(tag)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer btn-press">
                        <MaterialSymbolsCloseRounded className="text-[16px]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">添加新标签</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.tagName;
                  handleAddTag(input.value);
                  input.value = "";
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="tagName"
                  placeholder="输入标签名称..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors btn-press">
                  添加
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
