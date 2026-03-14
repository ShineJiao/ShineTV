"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MaterialSymbolsCloseRounded,
  MaterialSymbolsMovieOutlineRounded,
  MaterialSymbolsTvOutlineRounded,
  MaterialSymbolsSmartphoneOutline,
  MaterialSymbolsAnimationRounded,
  MaterialSymbolsLiveTvRounded,
  MaterialSymbolsHomeRounded,
} from "@/components/icons";

export function SideMenu({ mediaType, onMediaTypeChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !toggleBtnRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMediaTypeChange = (type) => {
    onMediaTypeChange(type);
    setIsOpen(false);
  };

  const mediaOptions = [
    { value: "home", label: "首页", icon: MaterialSymbolsHomeRounded },
    { value: "movie", label: "电影", icon: MaterialSymbolsMovieOutlineRounded },
    { value: "tv", label: "电视剧", icon: MaterialSymbolsTvOutlineRounded },
    { value: "anime", label: "动漫", icon: MaterialSymbolsAnimationRounded },
    { value: "variety", label: "综艺", icon: MaterialSymbolsLiveTvRounded },
    { value: "short", label: "短剧", icon: MaterialSymbolsSmartphoneOutline },
  ];

  return (
    <>
      {/* 切换按钮 - 在屏幕右边缘 */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-20 rounded-l-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
          isOpen
            ? "bg-gray-100 text-gray-900"
            : "bg-primary text-white hover:bg-primary-dark"
        }`}
        title={isOpen ? "收起菜单" : "展开菜单"}
      >
        {isOpen ? (
          <MaterialSymbolsCloseRounded className="text-2xl" />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="w-4 h-0.5 bg-white rounded"></div>
            <div className="w-4 h-0.5 bg-white rounded"></div>
            <div className="w-4 h-0.5 bg-white rounded"></div>
          </div>
        )}
      </button>

      {/* 侧边菜单栏 */}
      <div
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">分类选择</h2>
            <p className="text-sm text-gray-500 mt-1">选择您想看的内容类型</p>
          </div>

          {/* 媒体类型选项 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mediaOptions.map((option) => {
              const IconComponent = option.icon;
              const isActive = mediaType === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleMediaTypeChange(option.value)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 btn-press ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent
                    className={`text-2xl ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className="font-semibold text-base">{option.label}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 底部提示 */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              点击类型切换查看对应内容
            </p>
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
