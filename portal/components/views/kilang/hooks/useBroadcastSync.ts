import { useEffect, useRef } from 'react';
import { KilangAction, KilangState } from '../kilangReducer';

export const useBroadcastSync = (
  state: KilangState,
  dispatch: React.Dispatch<KilangAction>,
  isStandalone: boolean
) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isInternalUpdate = useRef(false);
  const stateRef = useRef(state);
  
  // Sync state ref for listeners
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const channel = new BroadcastChannel('kilang_sync_channel');
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload, source } = event.data;
      
      // Ignore own messages
      if (source === (isStandalone ? 'popout' : 'main')) return;

      if (type === 'ACTION') {
        isInternalUpdate.current = true;
        dispatch(payload as KilangAction);
        setTimeout(() => { isInternalUpdate.current = false; }, 50);
      } else if (type === 'FULL_SYNC') {
        isInternalUpdate.current = true;
        dispatch({ type: 'SYNC_STATE', state: payload });
        setTimeout(() => { isInternalUpdate.current = false; }, 50);
      } else if (type === 'REQUEST_SYNC' && !isStandalone) {
        // Main window responds to sync requests
        const s = stateRef.current;
        const syncPayload = {
          theme: s.layoutConfig.theme,
          layoutConfig: s.layoutConfig,
          searchTerm: s.searchTerm,
          branchFilter: s.branchFilter,
          morphMode: s.morphMode,
          sourceFilter: s.sourceFilter,
          landingVersion: s.landingVersion,
          logoStyles: s.logoStyles,
          logoSettings: s.logoSettings,
          showThemeBar: s.showThemeBar,
          showFloatingPalette: s.showFloatingPalette
        };
        channel.postMessage({ 
          type: 'FULL_SYNC', 
          payload: syncPayload,
          source: 'main' 
        });
      }
    };

    channel.addEventListener('message', handleMessage);

    // Initial sync request if popout
    if (isStandalone) {
      channel.postMessage({ type: 'REQUEST_SYNC', source: 'popout' });
    }

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [isStandalone, dispatch]); 

  // Broadcast changes from this window (debounced by React state cycle)
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

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'FULL_SYNC',
        payload: currentSyncPayload,
        source: isStandalone ? 'popout' : 'main'
      });
    }
  }, [
    isStandalone,
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
