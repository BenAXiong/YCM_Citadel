import { BookmarkControls } from './BookmarkControls';
import { BookmarkLibrary } from './BookmarkLibrary';

interface BookmarkTabProps {
  bookmarks: import('../KilangTypes').Bookmark[];
  sortedBookmarks: import('../KilangTypes').Bookmark[];
  loadBookmark: (bookmark: import('../KilangTypes').Bookmark) => void;
  togglePin: (id: string, e: React.MouseEvent) => void;
  deleteBookmark: (id: string, e: React.MouseEvent) => void;
  showPlusOne: string | null;
  showMinusOne: string | null;
}

export const BookmarkTab = ({ 
  bookmarks, 
  sortedBookmarks, 
  loadBookmark,
  togglePin,
  deleteBookmark,
  showPlusOne,
  showMinusOne
}: BookmarkTabProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      <BookmarkControls 
        showPlusOne={showPlusOne} 
        showMinusOne={showMinusOne} 
      />

      <div className="px-3 pb-20 space-y-2">
        <BookmarkLibrary
          bookmarks={bookmarks}
          sortedBookmarks={sortedBookmarks}
          loadBookmark={loadBookmark}
          togglePin={togglePin}
          deleteBookmark={deleteBookmark}
          showPlusOne={showPlusOne}
          showMinusOne={showMinusOne}
        />
      </div>
    </div>
  );
};
