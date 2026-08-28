import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Store, BarChart2, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Yojnayein', path: '/schemes', icon: List },
    { name: 'Becho', path: '/sell', icon: Store },
    { name: 'Sales', path: '/sales', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <item.icon className={styles.icon} size={24} />
          <span className={styles.label}>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
