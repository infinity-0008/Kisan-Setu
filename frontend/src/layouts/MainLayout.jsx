import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav/BottomNav';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const location = useLocation();
  // Hide bottom nav on specific routes like login, splash, onboarding
  const hideBottomNavRoutes = ['/', '/login', '/onboarding'];
  const showBottomNav = !hideBottomNavRoutes.includes(location.pathname);

  return (
    <div className={styles.layout}>
      <main className={`${styles.mainContent} ${showBottomNav ? styles.withBottomNav : ''}`}>
        <Outlet />
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
