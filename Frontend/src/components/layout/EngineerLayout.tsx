
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const EngineerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="engineer" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
