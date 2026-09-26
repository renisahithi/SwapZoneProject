import { createContext, useState, useEffect } from "react";

export const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    try{
    const stored = localStorage.getItem("bookmarks");
    return stored ? JSON.parse(stored) : [];
    }
    catch(err){
      localStorage.removeItem('bookmarks');
      return[];
    }
  });

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (listing) => {
    setBookmarks((prev) => {
      if (prev.some((item) => item._id === listing._id)) return prev;
      return [...prev, listing];
    });
  };

  const removeBookmark = (listingId) => {
    setBookmarks((prev) => prev.filter((item) => item._id !== listingId));
  };

  const isBookmarked = (listingId) => {
    return bookmarks.some((item) => item._id === listingId);
  };

  const toggleBookmark = (listing) => {
    if (isBookmarked(listing._id)) {
      removeBookmark(listing._id);
    } else {
      addBookmark(listing);
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
};