"use client";
import { useState, useEffect, useCallback } from "react";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ContinueWatching } from "@/components/ContinueWatching";
import { SearchBox } from "@/components/SearchBox";
import { usePlayHistoryStore } from "@/store/usePlayHistoryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { fetchRecommendations, loadUserTags, saveUserTags, defaultMovieTags, defaultTvTags, defaultAnimeTags, defaultVarietyTags, convertDoubanToMovie } from "@/lib/doubanApi";
import {
  MaterialSymbolsMovieOutlineRounded,
  MaterialSymbolsTvOutlineRounded,
  MaterialSymbolsSmartphoneOutline,
  MaterialSymbolsAnimationRounded,
  MaterialSymbolsLiveTvRounded,
  MaterialSymbolsHomeRounded,
  MaterialSymbolsAdd,
  MaterialSymbolsChevronLeftRounded,
  MaterialSymbolsChevronRightRounded,
  MaterialSymbolsCloseRounded,
} from "@/components/icons";

// 媒体类型配置
const MEDIA_CONFIG = {
  home: { label: "首页", icon: MaterialSymbolsHomeRounded, defaultTag: "热门" },
  movie: { label: "电影", icon: MaterialSymbolsMovieOutlineRounded, defaultTag: "华语" },
  tv: { label: "电视剧", icon: MaterialSymbolsTvOutlineRounded, defaultTag: "国产剧" },
  anime: { label: "动漫", icon: MaterialSymbolsAnimationRounded, defaultTag: "热门" },
  variety: { label: "综艺", icon: MaterialSymbolsLiveTvRounded, defaultTag: "热门" },
  short: { label: "短剧", icon: MaterialSymbolsSmartphoneOutline, defaultTag: "热门" },
};

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
  const [showTagModal, setShowTagModal] = useState(false);
  const pageSize = 12;

  // 获取播放记录
  const playHistory = usePlayHistoryStore((state) => state.playHistory);
  // 获取豆瓣代理设置
  const doubanProxy = useSettingsStore((state) => state.doubanProxy);

  useEffect(() => {
    const { movieTags: loadedMovieTags, tvTags: loadedTvTags, animeTags: loadedAnimeTags, varietyTags: loadedVarietyTags } = loadUserTags();
    setMovieTags(loadedMovieTags);
    setTvTags(loadedTvTags);
    setAnimeTags(loadedAnimeTags);
    setVarietyTags(loadedVarietyTags);
  }, []);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      if (mediaType === "short") {
        const res = await fetch(`/api/hongguo?page_limit=${pageSize}&page_start=${page * pageSize}`);
        const data = await res.json();
        const converted = (data.list || []).map((item) => ({
          id: item.title,
          title: item.title,
          poster: item.poster,
          rating: "暂无",
          hongguoUrl: item.hongguoUrl,
        }));
        setMovies(converted);
      } else if (mediaType === "home") {
        // 首页加载所有类型的热门内容
        const [movieData, tvData, animeData, varietyData] = await Promise.all([
          fetchRecommendations("movie", "热门", 6, 0, doubanProxy),
          fetchRecommendations("tv", "热门", 6, 0, doubanProxy),
          fetchRecommendations("movie", "动画", 6, 0, doubanProxy),
          fetchRecommendations("tv", "综艺", 6, 0, doubanProxy),
        ]);
        const converted = [
          ...movieData.subjects.map((item) => ({ ...convertDoubanToMovie(item), type: "movie" })),
          ...tvData.subjects.map((item) => ({ ...convertDoubanToMovie(item), type: "tv" })),
          ...animeData.subjects.map((item) => ({ ...convertDoubanToMovie(item), type: "anime" })),
          ...varietyData.subjects.map((item) => ({ ...convertDoubanToMovie(item), type: "variety" })),
        ];
        setMovies(converted);
      } else {
        const type = mediaType === "anime" ? "movie" : mediaType === "variety" ? "tv" : mediaType;
        const data = await fetchRecommendations(type, currentTag, pageSize, page * pageSize, doubanProxy);
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
    setCurrentTag(MEDIA_CONFIG[type].defaultTag);
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

  const defaultTag = MEDIA_CONFIG[mediaType].defaultTag;
  const rawTags = mediaType === "movie" ? movieTags : 
                  mediaType === "tv" ? tvTags : 
                  mediaType === "anime" ? animeTags : 
                  mediaType === "variety" ? varietyTags : [];
  const currentTags = rawTags.includes(defaultTag) ? [defaultTag, ...rawTags.filter((t) => t !== defaultTag)] : rawTags;

  const handleAddTag = (tagName) => {
    const trimmedTag = tagName.trim();
    if (!trimmedTag) return;

    const updateTags = (currentTags, setTags, allTags) => {
      if (currentTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...currentTags, trimmedTag];
      setTags(newTags);
      saveUserTags(...allTags.map((t, i) => i === allTags.indexOf(currentTags) ? newTags : t));
    };

    if (mediaType === "movie") {
      updateTags(movieTags, setMovieTags, [movieTags, tvTags, animeTags, varietyTags]);
    } else if (mediaType === "tv") {
      updateTags(tvTags, setTvTags, [movieTags, tvTags, animeTags, varietyTags]);
    } else if (mediaType === "anime") {
      updateTags(animeTags, setAnimeTags, [movieTags, tvTags, animeTags, varietyTags]);
    } else if (mediaType === "variety") {
      updateTags(varietyTags, setVarietyTags, [movieTags, tvTags, animeTags, varietyTags]);
    }
  };

  const handleDeleteTag = (tag) => {
    if (tag === "热门") {
      alert("热门标签不能删除");
      return;
    }

    const deleteTag = (currentTags, setTags) => {
      const newTags = currentTags.filter((t) => t !== tag);
      setTags(newTags);
      return newTags;
    };

    let newMovieTags = movieTags;
    let newTvTags = tvTags;
    let newAnimeTags = animeTags;
    let newVarietyTags = varietyTags;

    if (mediaType === "movie") {
      newMovieTags = deleteTag(movieTags, setMovieTags);
    } else if (mediaType === "tv") {
      newTvTags = deleteTag(tvTags, setTvTags);
    } else if (mediaType === "anime") {
      newAnimeTags = deleteTag(animeTags, setAnimeTags);
    } else if (mediaType === "variety") {
      newVarietyTags = deleteTag(varietyTags, setVarietyTags);
    }

    saveUserTags(newMovieTags, newTvTags, newAnimeTags, newVarietyTags);

    if (currentTag === tag) {
      setCurrentTag("热门");
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
    }
    setCurrentTag("热门");
    setPage(0);
  };

  // 获取当前媒体类型的配置
  const currentMediaConfig = MEDIA_CONFIG[mediaType];
  const CurrentIcon = currentMediaConfig.icon;

  return (
    <div className="w-full max-w-7xl flex flex-col gap-8 pt-6 page-enter">
      {/* Search Hero */}
      <div className="flex flex-col items-center justify-start gap-6 w-full max-w-3xl mx-auto">
        <SearchBox />

        {/* 媒体类型切换 - 圆角按钮组 */}
        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex items-center gap-1">
          {Object.entries(MEDIA_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <label key={key} className="cursor-pointer relative">
                <input 
                  className="peer sr-only" 
                  name="media-type" 
                  type="radio" 
                  value={key} 
                  checked={mediaType === key} 
                  onChange={() => handleMediaTypeChange(key)} 
                />
                <div className="media-toggle-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-md flex items-center gap-2 transition-all duration-200 hover:bg-gray-200/50">
                  <Icon className="text-[18px]" />
                  {config.label}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Categories - 首页和短剧模式不显示标签 */}
      {mediaType !== "short" && mediaType !== "home" && rawTags.length > 0 && (
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

      {/* Popular Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            <CurrentIcon className="text-primary text-xl" />
            {mediaType === "short" ? "红果短剧 - 热门推荐" : 
             mediaType === "home" ? "热门推荐" :
             `豆瓣热门 - ${currentTag}`}
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

      {/* Continue Watching Section */}
      {playHistory && playHistory.length > 0 && <ContinueWatching playHistory={playHistory} />}

      {/* Tag Management Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 modal-backdrop-enter" onClick={() => setShowTagModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto modal-content-enter" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">标签管理 ({MEDIA_CONFIG[mediaType].label})</h3>
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
