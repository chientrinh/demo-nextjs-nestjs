"use client";

import { usePathname } from "@/i18n/navigation";
import type React from "react";
import { useEffect } from "react";
import { create } from "zustand";

export interface SidebarState {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  setIsMobileOpen: (isOpen: boolean) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isExpanded: true,
  isMobileOpen: false,
  isMobile: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setIsHovered: (isHovered) => set({ isHovered }),
  setActiveItem: (item) => set({ activeItem: item }),
  toggleSubmenu: (item) =>
    set((state) => ({ openSubmenu: state.openSubmenu === item ? null : item })),
  setIsMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
  setIsExpanded: (isExpanded) => set({ isExpanded }),
  setIsMobile: (isMobile) => set({ isMobile }),
}));

export const useSidebar = () => {
  const isExpanded = useSidebarStore((s) => s.isExpanded);
  const isMobile = useSidebarStore((s) => s.isMobile);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const isHovered = useSidebarStore((s) => s.isHovered);
  const activeItem = useSidebarStore((s) => s.activeItem);
  const openSubmenu = useSidebarStore((s) => s.openSubmenu);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useSidebarStore((s) => s.toggleMobileSidebar);
  const setIsHovered = useSidebarStore((s) => s.setIsHovered);
  const setActiveItem = useSidebarStore((s) => s.setActiveItem);
  const toggleSubmenu = useSidebarStore((s) => s.toggleSubmenu);

  return {
    isExpanded: isMobile ? false : isExpanded,
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
  };
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const setIsMobileOpen = useSidebarStore((s) => s.setIsMobileOpen);
  const setIsMobile = useSidebarStore((s) => s.setIsMobile);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsMobile, setIsMobileOpen]);

  return <>{children}</>;
};
