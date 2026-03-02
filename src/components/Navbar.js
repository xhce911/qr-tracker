import React from 'react';
import { Link } from 'react-router-dom';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react';
import { HiOutlineQrcode, HiOutlineHome, HiOutlineChartBar, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onLoginClick }) => {
  const { user, logout } = useAuth();

  return (
    <HeroNavbar className="bg-white/80 backdrop-blur border-b border-[var(--border)]">
      <NavbarBrand>
        <Link to="/" className="flex items-center gap-2 text-[var(--text)] hover:opacity-80 transition-opacity">
          <HiOutlineQrcode className="w-7 h-7 text-[var(--accent)]" />
          <span className="font-semibold text-lg">QR Tracker</span>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="center" className="gap-6">
        <NavbarItem>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-sm font-medium"
          >
            <HiOutlineHome className="w-4 h-4" />
            Generador
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-sm font-medium"
          >
            <HiOutlineChartBar className="w-4 h-4" />
            Dashboard
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                src={user.photoURL}
                alt={user.displayName || 'Usuario'}
                name={user.displayName || user.email?.slice(0, 1)}
                className="cursor-pointer w-9 h-9"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Menú usuario">
              <DropdownItem
                key="logout"
                startContent={<HiOutlineLogout className="w-4 h-4" />}
                className="text-red-600"
                onPress={logout}
              >
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            variant="flat"
            color="primary"
            size="sm"
            onPress={onLoginClick}
          >
            Iniciar sesión
          </Button>
        )}
      </NavbarContent>
    </HeroNavbar>
  );
};

export default Navbar;
