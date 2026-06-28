import React from "react";
import DashboardHeader from "@/components/common/DashboardHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;