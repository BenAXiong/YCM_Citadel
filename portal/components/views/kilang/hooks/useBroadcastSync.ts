import { useEffect, useRef } from 'react';
import { KilangAction, KilangState } from '../kilangReducer';

export const useBroadcastSync = (
  state: KilangState,
  dispatch: React.Dispatch<KilangAction>,
  isStandalone: boolean
) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    const channel = new BroadcastChannel('kilang_sync_channel');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload, source } = event.data;
      if (source === (isStandalone ? 'popout' : 'main')) return; // Ignore own messages

      isInternalUpdate.current = true;
      if (type === 'ACTION') {
        dispatch(payload as KilangAction);
      } else if (type === 'FULL_SYNC') {
        dispatch({ type: 'SYNC_STATE', state: payload });
      }
      isInternalUpdate.current = false;
    };

    // If we just opened as standalone, request full state from main
    if (isStandalone) {
      channel.postMessage({ type: 'REQUEST_SYNC', source: 'popout' });
    } else {
      // Main window listens for sync requests
      channel.addEventListener('message', (e) => {
        if (e.data.type === 'REQUEST_SYNC') {
          channel.postMessage({ 
            type: 'FULL_SYNC', 
            payload: {
              theme: state.layoutConfig.theme,
              layoutConfig: state.layoutConfig,
              searchTerm: state.searchTerm,
              branchFilter: state.branchFilter,
              morphMode: state.morphMode,
              sourceFilter: state.sourceFilter,
              landingVersion: state.landingVersion,
              logoStyles: state.logoStyles,
              logoSettings: state.logoSettings,
              showThemeBar: state.showThemeBar,
              showFloatingPalette: state.showFloatingPalette
            },
            source: 'main' 
          });
        }
      });
    }

    return () => channel.close();
  }, [isStandalone]); // Only run once on mount

  // Broadcast changes from this window
  // In a real app, we'd wrap dispatch. For this PoC, we'll watch specific state changes.
  useEffect(() => {
    if (isInternalUpdate.current) return;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'FULL_SYNC',
        payload: {
          theme: state.layoutConfig.theme,
          layoutConfig: state.layoutConfig,
          searchTerm: state.searchTerm,
          branchFilter: state.branchFilter,
          morphMode: state.morphMode,
          sourceFilter: state.sourceFilter,
          landingVersion: state.landingVersion,
          logoStyles: state.logoStyles,
          logoSettings: state.logoSettings,
          showThemeBar: state.showThemeBar,
          showFloatingPalette: state.showFloatingPalette
        },
        source: isStandalone ? 'popout' : 'main'
      });
    }
  }, [
    state.layoutConfig.theme,
    state.layoutConfig,
    state.searchTerm,
    state.branchFilter,
    state.morphMode,
    state.sourceFilter,
    state.landingVersion,
    state.logoStyles,
    state.logoSettings,
    state.showThemeBar,
    state.showFloatingPalette
  ]);
};
