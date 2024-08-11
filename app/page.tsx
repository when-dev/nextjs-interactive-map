import dynamic from 'next/dynamic';
import UserAvatar from './components/UserAvatar';
import ActionMenu from './components/ActionMenu';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      <Map />
      <UserAvatar />
      <ActionMenu />
    </main>
  );
}
