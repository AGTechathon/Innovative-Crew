
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  Home, 
  FileText, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Factory
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/dashboard', roles: ['admin', 'supervisor', 'worker', 'client'] },
  { title: 'Work Orders', icon: FileText, url: '/work-orders', roles: ['admin', 'supervisor', 'worker'] },
  { title: 'Inventory', icon: Package, url: '/inventory', roles: ['admin', 'supervisor'] },
  { title: 'Workers', icon: Users, url: '/workers', roles: ['admin', 'supervisor'] },
  { title: 'Analytics', icon: BarChart3, url: '/analytics', roles: ['admin', 'supervisor'] },
  { title: 'Settings', icon: Settings, url: '/settings', roles: ['admin'] },
];

export const AppSidebar = () => {
  const { user, logout } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'worker')
  );

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-2">
          <Factory className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Manufacturing ERP</h2>
            <p className="text-sm text-muted-foreground">{user?.name}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2 w-full">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="w-full text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
