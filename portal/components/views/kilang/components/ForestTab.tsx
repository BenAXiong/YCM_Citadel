import { ForestControls } from './ForestControls';
import { RootList } from './RootList';
import { BookmarkLibrary } from './BookmarkLibrary';
import { useSidebar } from '../SidebarContext';

interface ForestTabProps {
  bookmarks: import('../KilangTypes').Bookmark[];
  sortedBookmarks: import('../KilangTypes').Bookmark[];
  saveBookmark: (root: string, type: 'db' | 'custom', data: any, count: number) => void;
  togglePin: (id: string, e: React.MouseEvent) => void;
  deleteBookmark: (id: string, e: React.MouseEvent) => void;
  loadBookmark: (bookmark: import('../KilangTypes').Bookmark) => void;
  showPlusOne: boolean;
  showMinusOne: boolean;
}

export const ForestTab = ({ 
  bookmarks, 
  sortedBookmarks, 
  saveBookmark,
  togglePin,
  deleteBookmark,
  loadBookmark,
  showPlusOne,
  showMinusOne
}: ForestTabProps) => {
  const { showMyTrees } = useSidebar();

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      <ForestControls 
        showPlusOne={showPlusOne} 
        showMinusOne={showMinusOne} 
      />

      <div className="px-6 pb-20 space-y-2">
        {!showMyTrees ? (
          <RootList 
            bookmarks={bookmarks} 
            saveBookmark={saveBookmark} 
          />
        ) : (
          <BookmarkLibrary
            bookmarks={bookmarks}
            sortedBookmarks={sortedBookmarks}
            loadBookmark={loadBookmark}
            togglePin={togglePin}
            deleteBookmark={deleteBookmark}
          />
        )}
      </div>
    </div>
  );
};
