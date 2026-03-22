import { ForestControls } from './ForestControls';
import { RootList } from './RootList';

interface ForestTabProps {
  bookmarks: import('../KilangTypes').Bookmark[];
  saveBookmark: (root: string, type: 'db' | 'custom', data: any, count: number) => void;
  showPlusOne: string | null;
  showMinusOne: string | null;
}

export const ForestTab = ({ 
  bookmarks, 
  saveBookmark,
  showPlusOne,
  showMinusOne
}: ForestTabProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      <ForestControls 
        showPlusOne={showPlusOne} 
        showMinusOne={showMinusOne} 
      />

      <div className="px-3 pb-20 space-y-2">
        <RootList 
          bookmarks={bookmarks} 
          saveBookmark={saveBookmark} 
          showPlusOne={showPlusOne}
          showMinusOne={showMinusOne}
        />
      </div>
    </div>
  );
};
