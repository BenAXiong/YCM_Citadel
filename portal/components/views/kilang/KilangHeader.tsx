'use client';

import React from 'react';
import { useKilangContext } from './KilangContext';
import { WeavingPattern } from './WeavingPattern';

// Modularized Components
import { HeaderLogo } from './components/header/HeaderLogo';
import { QuickActions } from './components/header/QuickActions';
import { SourceSelector } from './components/header/SourceSelector';
import { LayoutControls } from './components/header/LayoutControls';
import { ZoomControls } from './components/header/ZoomControls';
import { BreadcrumbPath } from './components/header/BreadcrumbPath';
import { GlobalMetrics } from './components/header/GlobalMetrics';
import { EngineSettings } from './components/header/EngineSettings';

export const KilangHeader = () => {
  const { state } = useKilangContext();
  const { selectedRoot } = state;

  return (
    <header className="h-16 border-b border-[var(--kilang-border)] bg-[var(--kilang-bg-base)]/80 backdrop-blur-md flex items-center justify-between pl-0 pr-3 lg:pr-8 z-[150] shrink-0">
      <div className="flex items-center shrink-0 h-full">
        {/* 1. Brand Section (Static Sidebar Width) */}
        <div
          className="shrink-0 flex items-center h-full"
          style={{ width: 'var(--sidebar-width, 328px)', paddingLeft: 'clamp(0.75rem, 2vw, 1.5rem)' }}
        >
          <HeaderLogo />
          <div className="flex-1" />
          <QuickActions />
          <div className="w-[1px] h-4 bg-[var(--kilang-border-std)] ml-4" />
        </div>

        {/* 2. Source Selection Section */}
        <SourceSelector />
      </div>

      {/* 3. Central Control Section (Layout, Zoom, Breadcrumbs) */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-3 lg:px-8 mx-2 lg:mx-6 h-full relative">
        {selectedRoot ? (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500 shrink-0">
            <LayoutControls />
            <ZoomControls />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <WeavingPattern />
          </div>
        )}

        <BreadcrumbPath />
      </div>

      {/* 4. Statistics & Engine Settings */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <GlobalMetrics />
        <EngineSettings />
      </div>
    </header>
  );
};
