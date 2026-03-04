import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// 공통 레이아웃 - 모든 페이지에 Navbar 표시
export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
