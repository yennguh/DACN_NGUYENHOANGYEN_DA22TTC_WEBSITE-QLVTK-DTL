import React from 'react';
import LostItems from '../page/lost/LostItems';
import TopPosters from '../page/home/TopPosters';

export default function Content() {
  return (
    <main className="site-content">
      <LostItems />
      <TopPosters />
    </main>
  );
}
