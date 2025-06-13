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
  Tab,
  Tabs
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {activeTab === 'login' ? 'Iniciar sesión' : 'Registrarse'}
        </ModalHeader>
        <ModalBody>
          <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <Tab label="Iniciar sesión" value="login" />
            <Tab label="Crear cuenta" value="register" />
          </Tabs>

          <form onSubmit={handleSubmit} className="mt-4">
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
              required
            />

            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-6"
              required
            />

            <Button 
              type="submit" 
              color="primary" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Procesando...' : activeTab === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </Button>
          </form>

          <Divider className="my-6">o</Divider>

          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="mr-2 text-lg" />
            Continuar con Google
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
