import React from 'react';
import HomePostsList from '../page/home/HomePostsList';
import TopPosters from '../page/home/TopPosters';

export default function Content() {
  return (
    <main className="site-content">
      <HomePostsList />
      <TopPosters />
    </main>
  );
}
