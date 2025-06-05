
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Calendar, 
  LogOut,
  Settings
} from 'lucide-react';

interface SidebarProps {
  role: 'manager' | 'engineer';
}

export const Sidebar = ({ role }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const managerLinks = [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/engineers', icon: Users, label: 'Engineers' },
    { to: '/manager/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/manager/assignments', icon: Calendar, label: 'Assignments' },
  ];

  const engineerLinks = [
    { to: '/engineer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/engineer/assignments', icon: Calendar, label: 'My Assignments' },
  ];

  const links = role === 'manager' ? managerLinks : engineerLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          Engineering RM
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {role === 'manager' ? 'Manager Portal' : 'Engineer Portal'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};
