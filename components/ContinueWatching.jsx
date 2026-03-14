"use client";

import { useRouter } from "next/navigation";
import { formatTimeRemaining } from "@/lib/util";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePlayHistoryStore } from "@/store/usePlayHistoryStore";
import { useEffect, useState } from "react";
import {
  MaterialSymbolsPlayArrowRounded,
  MaterialSymbolsCloseRounded,
  MaterialSymbolsHistoryRounded,
  MaterialSymbolsPlayCircleOutlineRounded,
} from "@/components/icons";

export function ContinueWatching({ playHistory }) {
  const router = useRouter();
  const { videoSources } = useSettingsStore();
  const removePlayRecord = usePlayHistoryStore((state) => state.removePlayRecord);
  const [updatedEpisodes, setUpdatedEpisodes] = useState({});
  const [activeTab, setActiveTab] = useState("continue"); // 'continue' | 'history'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!playHistory || playHistory.length === 0) return;

    const checkUpdates = async () => {
      // 1. 取前6条记录
      const recentHistory = playHistory.slice(0, 6);

      // 2. 按 source 分组
      const groupedBySource = recentHistory.reduce((acc, item) => {
        if (!acc[item.source]) {
          acc[item.source] = [];
        }
        acc[item.source].push(item);
        return acc;
      }, {});

      // 3. 遍历分组请求更新
      const updates = {};

      await Promise.all(
        Object.entries(groupedBySource).map(async ([sourceKey, items]) => {
          // 获取该 source 的 API 地址
          const sourceConfig = videoSources.find(s => s.key === sourceKey);
          if (!sourceConfig || !sourceConfig.url) return;

          const ids = items.map(item => item.id).join(',');

          try {
            const res = await fetch(
              `/api/upgrade?ids=${ids}&sourceUrl=${sourceConfig.url}`
            );
            const data = await res.json();

            // 处理可能的嵌套结构
            const episodeLengths = data.episodeLength?.episodeLength || data.episodeLength;

            if (Array.isArray(episodeLengths)) {
              // 根据 id 匹配，而不是依赖数组索引顺序
              episodeLengths.forEach(({ id, length }) => {
                const item = items.find(i => i.id === id);
                if (!item) return;

                const currentTotal = item.totalEpisodes || 0;
                // 如果获取到的总集数大于记录的总集数，说明有更新
                if (length > currentTotal) {
                  updates[`${item.source}-${item.id}`] = length - currentTotal;
                }
              });
            }
          } catch (error) {
            console.error(`Failed to check updates for source ${sourceKey}:`, error);
          }
        })
      );

      setUpdatedEpisodes(updates);
    };

    checkUpdates();
  }, [playHistory, videoSources]);

  if (!playHistory || playHistory.length === 0) {
    return null;
  }

  // 格式化集数信息
  function formatEpisodeInfo(record) {
    const remainingTime = formatTimeRemaining(record.duration - record.currentTime);
    if (record.totalEpisodes > 1) {
      return `第${record.currentEpisodeIndex + 1}集 • 剩余 ${remainingTime}`;
    }
    return `剩余 ${remainingTime}`;
  }

  function handlePlayClick(record) {
    router.push(`/play/${record.id}?source=${record.source}`);
  }

  function handleDeleteClick(e, record) {
    e.stopPropagation();
    setShowDeleteConfirm(`${record.source}-${record.id}`);
  }

  function confirmDelete(e, record) {
    e.stopPropagation();
    removePlayRecord(record.source, record.id);
    setShowDeleteConfirm(null);
  }

  function cancelDelete(e) {
    e.stopPropagation();
    setShowDeleteConfirm(null);
  }

  return (
    <div className="w-full">
      {/* 标题和标签页切换 */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          {activeTab === "continue" ? "继续观看" : "观看历史"}
        </h2>
        
        {/* 标签页切换按钮 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("continue")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "continue"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MaterialSymbolsPlayCircleOutlineRounded className="text-[18px]" />
            <span className="hidden sm:inline">继续观看</span>
            {continueWatching.length > 0 && (
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-xs font-bold">
                {continueWatching.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MaterialSymbolsHistoryRounded className="text-[18px]" />
            <span className="hidden sm:inline">观看历史</span>
            {watchHistory.length > 0 && (
              <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md text-xs font-bold">
                {watchHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {displayData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">
            {activeTab === "continue" 
              ? "没有未看完的视频，快去观看吧～" 
              : "还没有观看记录哦～"}
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {displayData.slice(0, 6).map((record) => (
            <div
              key={`${record.source}-${record.id}`}
              className="group relative shrink-0 w-[280px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary transition-colors duration-300 cursor-pointer"
              onClick={() => handlePlayClick(record)}
            >
              {activeTab === "continue" && updatedEpisodes[`${record.source}-${record.id}`] > 0 && (
                <div className="absolute top-0 right-0 z-20">
                  <div className="relative">
                    <span className="absolute -left-1 top-1 animate-ping inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative flex items-center justify-center bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold shadow-sm">
                      更新 {updatedEpisodes[`${record.source}-${record.id}`]} 集
                    </span>
                  </div>
                </div>
              )}
              
              {/* 删除按钮 */}
              <button
                onClick={(e) => handleDeleteClick(e, record)}
                className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:scale-110"
                title="删除记录"
              >
                <MaterialSymbolsCloseRounded className="text-[18px]" />
              </button>
              
              {/* 删除确认弹窗 */}
              {showDeleteConfirm === `${record.source}-${record.id}` && (
                <div
                  className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={cancelDelete}
                >
                  <div
                    className="bg-white rounded-xl p-4 max-w-[240px] text-center shadow-2xl scale-100 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      确定删除这条记录吗？
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelDelete}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={(e) => confirmDelete(e, record)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            
            <div className="flex gap-4 p-4">
              {/* 海报 */}
              <div className="relative w-24 h-36 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img
                  src={record.poster}
                  alt={record.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {record.source && (
                  <div className="absolute top-1 left-1 z-10">
                    <span className="bg-primary/90 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                      {record.source_name || record.source}
                    </span>
                  </div>
                )}
                {/* 播放图标 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <MaterialSymbolsPlayArrowRounded className="text-primary text-2xl ml-0.5" />
                  </div>
                </div>
              </div>

              {/* 信息区域 */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {record.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {formatEpisodeInfo(record)}
                  </p>
                  {record.year && (
                    <p className="text-xs text-gray-400">{record.year}</p>
                  )}
                </div>

                {/* 进度条 */}
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(record.progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.floor(record.progress)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
