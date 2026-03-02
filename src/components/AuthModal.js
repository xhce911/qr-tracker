import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Divider,
  Tabs,
  Tab,
} from '@heroui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || 'Error con Google');
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} placement="center">
      <ModalContent className="border border-[var(--border)]">
        <ModalHeader className="flex flex-col gap-1 text-[var(--text)]">
          {activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </ModalHeader>
        <ModalBody>
          <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} size="sm">
            <Tab key="login" title="Iniciar sesión" />
            <Tab key="register" title="Crear cuenta" />
          </Tabs>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
            )}
            <Input
              type="email"
              label="Correo"
              value={email}
              onValueChange={setEmail}
              variant="bordered"
              isRequired
            />
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onValueChange={setPassword}
              variant="bordered"
              isRequired
            />
            <Button type="submit" color="primary" className="w-full" isLoading={loading}>
              {activeTab === 'login' ? 'Entrar' : 'Registrarse'}
            </Button>
          </form>

          <Divider className="my-4" />

          <Button
            variant="bordered"
            className="w-full"
            startContent={<FcGoogle className="w-5 h-5" />}
            onPress={handleGoogleLogin}
          >
            Continuar con Google
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
