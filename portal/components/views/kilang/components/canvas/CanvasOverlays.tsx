import React from 'react';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { KilangToolbox } from '../../KilangToolbox';
import { KilangDimensionsOverlay } from '../../KilangDimensionsOverlay';
import { KilangAction } from '../../kilangReducer';

interface CanvasOverlaysProps {
  showPerfMonitor: boolean;
  exporting: boolean;
  selectedRoot: string;
  layoutConfig: any;
  dispatch: React.Dispatch<KilangAction>;
  viewPos: any;
  treeRef: React.RefObject<HTMLDivElement>;
  showDimensions: boolean;
  rootPos: any;
  scale: number;
  isFit: boolean;
  fitTransform: any;
  forestBounds: any;
}

export const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({
  showPerfMonitor,
  exporting,
  selectedRoot,
  layoutConfig,
  dispatch,
  viewPos,
  treeRef,
  showDimensions,
  rootPos,
  scale,
  isFit,
  fitTransform,
  forestBounds,
}) => {
  if (!selectedRoot || exporting) return null;

  return (
    <>
      {showPerfMonitor && <PerformanceMonitor />}

      {layoutConfig.showToolbox && (
        <KilangToolbox
          layoutConfig={layoutConfig}
          dispatch={dispatch}
        />
      )}

      {showDimensions && (
        <KilangDimensionsOverlay
          viewPos={viewPos}
          treeRef={treeRef}
          showDimensions={showDimensions}
          rootPos={rootPos || null}
          scale={scale}
          isFit={isFit}
          fitTransform={fitTransform}
          forestBounds={forestBounds}
        />
      )}
    </>
  );
};
