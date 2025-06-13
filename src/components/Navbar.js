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
  DropdownItem
} from '@heroui/react';
import {Button} from "@heroui/button";
import { HiOutlineQrcode, HiOutlineHome, HiOutlineChartBar, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth'; // Asumiremos que crearemos este hook

const Navbar = () => {
  const { user, logout } = useAuth(); // Hook para manejar autenticación

  return (
    <HeroNavbar className="shadow-sm bg-white">
      <NavbarBrand>
        <Link to="/" className="flex items-center">
          <HiOutlineQrcode className="w-8 h-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-800">QR Tracker</span>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <Link to="/" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
            <HiOutlineHome className="mr-1" />
            Generador
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
            <HiOutlineChartBar className="mr-1" />
            Dashboard
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown>
            <DropdownTrigger>
              <Avatar 
                src={user.photoURL} 
                alt={user.displayName} 
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="profile" className="flex items-center">
                <HiOutlineUser className="mr-2" />
                Perfil
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                className="flex items-center text-red-600"
                onClick={logout}
              >
                <HiOutlineLogout className="mr-2" />
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem>
              <Link to="/login">
                <Button variant="light">Iniciar sesión</Button>
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link to="/register">
                <Button color="primary">Registrarse</Button>
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </HeroNavbar>
  );
};

export default Navbar;