import { useEffect, useRef } from 'react';
import { KilangAction, KilangState } from '../kilangReducer';

export const useBroadcastSync = (
  state: KilangState,
  dispatch: React.Dispatch<KilangAction>,
  isStandalone: boolean
) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isInternalUpdate = useRef(false);
  const lastReceivedRef = useRef<string | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('kilang_sync_channel');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload, source } = event.data;
      if (source === (isStandalone ? 'popout' : 'main')) return; // Ignore own messages

      if (type === 'ACTION') {
        isInternalUpdate.current = true;
        dispatch(payload as KilangAction);
        // We don't cache ACTIONs easily, but they are usually targeted
      } else if (type === 'FULL_SYNC') {
        const payloadStr = JSON.stringify(payload);
        if (payloadStr === lastReceivedRef.current) return; // Skip if already seen
        
        lastReceivedRef.current = payloadStr;
        isInternalUpdate.current = true;
        dispatch({ type: 'SYNC_STATE', state: payload });
      }
      
      // Safety reset after a tick to ensure render cycle is captures isInternalUpdate
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 50);
    };

    // If we just opened as standalone, request full state from main
    if (isStandalone) {
      channel.postMessage({ type: 'REQUEST_SYNC', source: 'popout' });
    } else {
      // Main window listens for sync requests
      channel.addEventListener('message', (e) => {
        if (e.data.type === 'REQUEST_SYNC') {
          const syncPayload = {
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
          };
          channel.postMessage({ 
            type: 'FULL_SYNC', 
            payload: syncPayload,
            source: 'main' 
          });
        }
      });
    }

    return () => channel.close();
  }, [isStandalone, state.layoutConfig.theme, state.layoutConfig, state.searchTerm]); 

  // Broadcast changes from this window
  useEffect(() => {
    if (isInternalUpdate.current) return;

    const currentSyncPayload = {
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
    };

    const currentStr = JSON.stringify(currentSyncPayload);
    if (currentStr === lastReceivedRef.current) return;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'FULL_SYNC',
        payload: currentSyncPayload,
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
