"use client";
import { useState, useEffect, useCallback } from "react";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ContinueWatching } from "@/components/ContinueWatching";
import { usePlayHistoryStore } from "@/store/usePlayHistoryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { fetchRecommendations, loadUserTags, saveUserTags, defaultMovieTags, defaultTvTags, convertDoubanToMovie } from "@/lib/doubanApi";
import {
  MaterialSymbolsMovieOutlineRounded,
  MaterialSymbolsTvOutlineRounded,
  MaterialSymbolsSmartphoneOutline,
  MaterialSymbolsAdd,
  MaterialSymbolsChevronLeftRounded,
  MaterialSymbolsChevronRightRounded,
  MaterialSymbolsCloseRounded,
  MaterialSymbolsMenuRounded,
  MaterialSymbolsAnimationOutline,
  MaterialSymbolsLiveTvOutline,
} from "@/components/icons";

export default function Home() {
  const [mediaType, setMediaType] = useState("movie");
  const [currentTag, setCurrentTag] = useState("华语");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [movieTags, setMovieTags] = useState([]);
  const [tvTags, setTvTags] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const pageSize = 12;

  // 获取播放记录
  const playHistory = usePlayHistoryStore((state) => state.playHistory);
  // 获取豆瓣代理设置
  const doubanProxy = useSettingsStore((state) => state.doubanProxy);

  useEffect(() => {
    const { movieTags: loadedMovieTags, tvTags: loadedTvTags } = loadUserTags();
    setMovieTags(loadedMovieTags);
    setTvTags(loadedTvTags);
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
      } else {
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
    if (type === "movie") {
      setCurrentTag("华语");
    } else if (type === "tv") {
      setCurrentTag("国产剧");
    } else if (type === "anime") {
      setCurrentTag("国产动画");
    } else if (type === "variety") {
      setCurrentTag("国综");
    }
    setPage(0);
    setShowMediaMenu(false);
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

  const defaultTag = mediaType === "movie" ? "华语" : mediaType === "tv" ? "国产剧" : mediaType === "anime" ? "国产动画" : mediaType === "variety" ? "国综" : "热门";
  const rawTags = mediaType === "movie" ? movieTags : mediaType === "tv" ? tvTags : [];
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
      saveUserTags(newTags, tvTags);
    } else {
      if (tvTags.includes(trimmedTag)) {
        alert("标签已存在");
        return;
      }
      const newTags = [...tvTags, trimmedTag];
      setTvTags(newTags);
      saveUserTags(movieTags, newTags);
    }
  };

  const handleDeleteTag = (tag) => {
    if (tag === "热门") {
      alert("热门标签不能删除");
      return;
    }

    if (mediaType === "movie") {
      const newTags = movieTags.filter((t) => t !== tag);
      setMovieTags(newTags);
      saveUserTags(newTags, tvTags);
    } else {
      const newTags = tvTags.filter((t) => t !== tag);
      setTvTags(newTags);
      saveUserTags(movieTags, newTags);
    }

    if (currentTag === tag) {
      setCurrentTag("热门");
      setPage(0);
    }
  };

  const handleResetTags = () => {
    if (mediaType === "movie") {
      setMovieTags([...defaultMovieTags]);
      saveUserTags([...defaultMovieTags], tvTags);
    } else {
      setTvTags([...defaultTvTags]);
      saveUserTags(movieTags, [...defaultTvTags]);
    }
    setCurrentTag("热门");
    setPage(0);
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-8 pt-6 page-enter relative">
      {/* Hero Section - 媒体类型切换按钮 */}
      <div className="flex flex-col items-center justify-start gap-6 w-full max-w-3xl mx-auto">
        <button
          onClick={() => setShowMediaMenu(true)}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all btn-press flex items-center gap-3"
        >
          <MaterialSymbolsMenuRounded className="text-[24px]" />
          选择分类
        </button>
      </div>
      {/* Right Slide Menu */}
      {showMediaMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 modal-backdrop-enter" 
            onClick={() => setShowMediaMenu(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out slide-in-right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">媒体分类</h2>
                <button 
                  onClick={() => setShowMediaMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors btn-press"
                >
                  <MaterialSymbolsCloseRounded className="text-[24px]" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {/* 电影 */}
                  <button
                    onClick={() => handleMediaTypeChange("movie")}
                    className={`w-full p-4 rounded-xl border-2 transition-all btn-press flex items-center gap-4 ${
                      mediaType === "movie"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${mediaType === "movie" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <MaterialSymbolsMovieOutlineRounded className="text-[24px]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-base">电影</div>
                      <div className="text-xs text-gray-500 mt-0.5">华语 · 欧美 · 日韩</div>
                    </div>
                    {mediaType === "movie" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* 电视剧 */}
                  <button
                    onClick={() => handleMediaTypeChange("tv")}
                    className={`w-full p-4 rounded-xl border-2 transition-all btn-press flex items-center gap-4 ${
                      mediaType === "tv"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${mediaType === "tv" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <MaterialSymbolsTvOutlineRounded className="text-[24px]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-base">电视剧</div>
                      <div className="text-xs text-gray-500 mt-0.5">国产剧 · 美剧 · 日韩剧</div>
                    </div>
                    {mediaType === "tv" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* 动漫 */}
                  <button
                    onClick={() => handleMediaTypeChange("anime")}
                    className={`w-full p-4 rounded-xl border-2 transition-all btn-press flex items-center gap-4 ${
                      mediaType === "anime"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${mediaType === "anime" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <MaterialSymbolsAnimationOutline className="text-[24px]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-base">动漫</div>
                      <div className="text-xs text-gray-500 mt-0.5">国产动画 · 日本动漫 · 欧美动漫</div>
                    </div>
                    {mediaType === "anime" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* 综艺 */}
                  <button
                    onClick={() => handleMediaTypeChange("variety")}
                    className={`w-full p-4 rounded-xl border-2 transition-all btn-press flex items-center gap-4 ${
                      mediaType === "variety"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${mediaType === "variety" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <MaterialSymbolsLiveTvOutline className="text-[24px]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-base">综艺</div>
                      <div className="text-xs text-gray-500 mt-0.5">国综 · 韩综 · 日综</div>
                    </div>
                    {mediaType === "variety" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* 短剧 */}
                  <button
                    onClick={() => handleMediaTypeChange("short")}
                    className={`w-full p-4 rounded-xl border-2 transition-all btn-press flex items-center gap-4 ${
                      mediaType === "short"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${mediaType === "short" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <MaterialSymbolsSmartphoneOutline className="text-[24px]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-base">短剧</div>
                      <div className="text-xs text-gray-500 mt-0.5">红果短剧精选</div>
                    </div>
                    {mediaType === "short" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Categories - 短剧、动漫、综艺模式不显示标签 */}
      {(mediaType === "movie" || mediaType === "tv") && (
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
              <h3 className="text-xl font-bold text-gray-900">标签管理 ({mediaType === "movie" ? "电影" : "电视剧"})</h3>
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
