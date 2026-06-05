import React, { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Card, Tooltip } from '@heroui/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from '@heroui/react';
import {
  HiDownload, HiOutlinePhotograph, HiOutlineCode,
  HiOutlineMail, HiOutlinePhone, HiOutlineChat,
  HiOutlineWifi, HiOutlineLink, HiOutlineClipboard,
} from 'react-icons/hi';

const QR_TYPES = [
  { key: 'url', label: 'URL', icon: HiOutlineLink, description: 'Redirige a una URL' },
  { key: 'text', label: 'Texto', icon: HiOutlineChat, description: 'Muestra texto al escanear' },
  { key: 'email', label: 'Email', icon: HiOutlineMail, description: 'Abre un correo' },
  { key: 'phone', label: 'Teléfono', icon: HiOutlinePhone, description: 'Inicia una llamada' },
  { key: 'sms', label: 'SMS', icon: HiOutlineChat, description: 'Abre un SMS' },
  { key: 'wifi', label: 'WiFi', icon: HiOutlineWifi, description: 'Conecta a una red WiFi' },
];

const generateShortCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

const QRGenerator = ({ user }) => {
  const [qrType, setQrType] = useState('url');
  const [formData, setFormData] = useState({
    url: '',
    text: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    phone: '',
    smsPhone: '',
    smsMessage: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
  });
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(48);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  const getEmptyFormData = (type) => ({
    url: '',
    text: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    phone: '',
    smsPhone: '',
    smsMessage: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
  });

  const handleTypeChange = (type) => {
    setQrType(type);
    setFormData(getEmptyFormData(type));
    setError('');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } catch {
      // fallback
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getQrPayload = useCallback(() => {
    switch (qrType) {
      case 'url':
        return { originalUrl: formData.url, qrPayload: formData.url };
      case 'text':
        return { textContent: formData.text, qrPayload: formData.text };
      case 'email':
        return {
          emailTo: formData.emailTo,
          emailSubject: formData.emailSubject,
          emailBody: formData.emailBody,
          qrPayload: `mailto:${formData.emailTo}?subject=${encodeURIComponent(formData.emailSubject)}&body=${encodeURIComponent(formData.emailBody)}`,
        };
      case 'phone':
        return { phoneNumber: formData.phone, qrPayload: `tel:${formData.phone}` };
      case 'sms':
        return {
          smsNumber: formData.smsPhone,
          smsMessage: formData.smsMessage,
          qrPayload: `sms:${formData.smsPhone}?body=${encodeURIComponent(formData.smsMessage)}`,
        };
      case 'wifi':
        return {
          wifiSsid: formData.wifiSsid,
          wifiPassword: formData.wifiPassword,
          wifiEncryption: formData.wifiEncryption,
          qrPayload: `WIFI:S:${formData.wifiSsid};T:${formData.wifiEncryption};P:${formData.wifiPassword};;`,
        };
      default:
        return { originalUrl: formData.url, qrPayload: formData.url };
    }
  }, [qrType, formData]);

  const validate = () => {
    switch (qrType) {
      case 'url':
        if (!formData.url?.trim()) return 'Ingresa una URL';
        break;
      case 'text':
        if (!formData.text?.trim()) return 'Ingresa el texto';
        break;
      case 'email':
        if (!formData.emailTo?.trim()) return 'Ingresa el destinatario';
        break;
      case 'phone':
        if (!formData.phone?.trim()) return 'Ingresa el número de teléfono';
        break;
      case 'sms':
        if (!formData.smsPhone?.trim()) return 'Ingresa el número de teléfono';
        break;
      case 'wifi':
        if (!formData.wifiSsid?.trim()) return 'Ingresa el nombre de la red (SSID)';
        break;
      default:
        break;
    }
    return null;
  };

  const generateQR = async () => {
    if (!user) {
      setError('Inicia sesión para crear códigos QR');
      return;
    }
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = getQrPayload();
      const shortCode = generateShortCode();
      const docData = {
        type: qrType,
        createdAt: serverTimestamp(),
        scanCount: 0,
        lastScanned: null,
        createdBy: user.uid,
        logo: logo,
        shortCode,
      };

      switch (qrType) {
        case 'url':
          docData.originalUrl = formData.url;
          break;
        case 'text':
          docData.textContent = formData.text;
          break;
        case 'email':
          docData.emailTo = formData.emailTo;
          docData.emailSubject = formData.emailSubject;
          docData.emailBody = formData.emailBody;
          break;
        case 'phone':
          docData.phoneNumber = formData.phone;
          break;
        case 'sms':
          docData.smsNumber = formData.smsPhone;
          docData.smsMessage = formData.smsMessage;
          break;
        case 'wifi':
          docData.wifiSsid = formData.wifiSsid;
          docData.wifiPassword = formData.wifiPassword;
          docData.wifiEncryption = formData.wifiEncryption;
          break;
        default:
          break;
      }

      const docRef = await addDoc(collection(db, 'qrcodes'), docData);
      const scanUrl = `${window.location.origin}/scan/${docRef.id}`;

      setQrData({
        id: docRef.id,
        scanUrl,
        shortUrl: `${window.location.origin}/s/${shortCode}`,
        type: qrType,
        payload: payload.qrPayload,
        logo: logo,
        logoSize: logoSize,
      });
      setFormData(getEmptyFormData(qrType));
      setLogo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Error al generar el QR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setError('La imagen debe ser menor a 100 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogo(ev.target.result);
      setError('');
    };
    reader.onerror = () => {
      setError('Error al leer la imagen');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadSVG = () => {
    if (!qrRef.current || !qrData) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `qr-${qrData.id}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const downloadPNG = () => {
    if (!qrRef.current || !qrData) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `qr-${qrData.id}.png`;
      a.click();
    };
    img.src = URL.createObjectURL(blob);
  };

  const activeType = QR_TYPES.find(t => t.key === qrType);
  const TypeIcon = activeType?.icon || HiOutlineLink;

  const renderTypeFields = () => {
    switch (qrType) {
      case 'url':
        return (
          <Input
            type="url"
            label="URL de destino"
            placeholder="https://ejemplo.com"
            value={formData.url}
            onValueChange={(v) => updateField('url', v)}
            isRequired
            variant="bordered"
            size="md"
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            label="Contenido de texto"
            placeholder="Mensaje que se mostrará al escanear"
            value={formData.text}
            onValueChange={(v) => updateField('text', v)}
            isRequired
            variant="bordered"
            size="md"
          />
        );
      case 'email':
        return (
          <div className="space-y-3">
            <Input
              type="email"
              label="Destinatario"
              placeholder="correo@ejemplo.com"
              value={formData.emailTo}
              onValueChange={(v) => updateField('emailTo', v)}
              isRequired
              variant="bordered"
              size="md"
            />
            <Input
              type="text"
              label="Asunto"
              placeholder="Asunto del correo"
              value={formData.emailSubject}
              onValueChange={(v) => updateField('emailSubject', v)}
              variant="bordered"
              size="md"
            />
            <Input
              type="text"
              label="Cuerpo"
              placeholder="Texto del correo"
              value={formData.emailBody}
              onValueChange={(v) => updateField('emailBody', v)}
              variant="bordered"
              size="md"
            />
          </div>
        );
      case 'phone':
        return (
          <Input
            type="tel"
            label="Número de teléfono"
            placeholder="+1234567890"
            value={formData.phone}
            onValueChange={(v) => updateField('phone', v)}
            isRequired
            variant="bordered"
            size="md"
          />
        );
      case 'sms':
        return (
          <div className="space-y-3">
            <Input
              type="tel"
              label="Número de teléfono"
              placeholder="+1234567890"
              value={formData.smsPhone}
              onValueChange={(v) => updateField('smsPhone', v)}
              isRequired
              variant="bordered"
              size="md"
            />
            <Input
              type="text"
              label="Mensaje"
              placeholder="Texto del SMS"
              value={formData.smsMessage}
              onValueChange={(v) => updateField('smsMessage', v)}
              variant="bordered"
              size="md"
            />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-3">
            <Input
              type="text"
              label="Nombre de la red (SSID)"
              placeholder="Mi WiFi"
              value={formData.wifiSsid}
              onValueChange={(v) => updateField('wifiSsid', v)}
              isRequired
              variant="bordered"
              size="md"
            />
            <Input
              type="password"
              label="Contraseña"
              placeholder="Contraseña de la red"
              value={formData.wifiPassword}
              onValueChange={(v) => updateField('wifiPassword', v)}
              variant="bordered"
              size="md"
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Cifrado
              </label>
              <div className="flex gap-3">
                {['WPA', 'WEP', 'nopass'].map((enc) => (
                  <label
                    key={enc}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                      formData.wifiEncryption === enc
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="wifiEncryption"
                      value={enc}
                      checked={formData.wifiEncryption === enc}
                      onChange={(e) => updateField('wifiEncryption', e.target.value)}
                      className="sr-only"
                    />
                    {enc === 'nopass' ? 'Sin contraseña' : enc}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card className="p-8 border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--text)] mb-1">Nuevo código QR</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Selecciona el tipo y completa los datos. Cada escaneo se contabiliza.
        </p>

        {!user && (
          <p className="text-sm text-[var(--text-muted)] mb-4 p-3 rounded-lg bg-amber-50 text-amber-800">
            Inicia sesión para generar y guardar códigos QR.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-4 p-3 rounded-lg bg-red-50">{error}</p>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Tipo de QR
          </label>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="w-full justify-between"
                isDisabled={!user}
              >
                <span className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4" />
                  {activeType?.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{activeType?.description}</span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={new Set([qrType])}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                if (val) handleTypeChange(val);
              }}
            >
              {QR_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <DropdownItem
                    key={t.key}
                    startContent={<Icon className="w-4 h-4" />}
                    description={t.description}
                  >
                    {t.label}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="space-y-4">
          {renderTypeFields()}

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Logo (opcional)
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="bordered"
                size="sm"
                startContent={<HiOutlinePhotograph className="w-4 h-4" />}
                onPress={() => fileInputRef.current?.click()}
                isDisabled={!user}
              >
                {logo ? 'Cambiar logo' : 'Subir logo'}
              </Button>
              {logo && (
                <Button
                  variant="light"
                  size="sm"
                  color="danger"
                  onPress={removeLogo}
                >
                  Quitar
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {logo && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain rounded-lg border border-[var(--border)]"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--text-muted)]">Tamaño:</label>
                  <select
                    value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="text-xs border border-[var(--border)] rounded-md px-2 py-1 bg-transparent text-[var(--text)]"
                  >
                    <option value={32}>32px</option>
                    <option value={48}>48px</option>
                    <option value={64}>64px</option>
                    <option value={80}>80px</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          color="primary"
          onPress={generateQR}
          isLoading={loading}
          isDisabled={!user}
          className="w-full font-medium mt-5"
        >
          Generar QR
        </Button>

        {qrData && (
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center" ref={qrRef}>
            <div className="inline-flex p-4 bg-white rounded-xl border border-[var(--border)]">
              <QRCodeSVG
                value={qrData.scanUrl}
                size={200}
                includeMargin
                level={qrData.logo ? 'H' : 'M'}
                fgColor="#111827"
                bgColor="#ffffff"
                imageSettings={qrData.logo ? {
                  src: qrData.logo,
                  height: qrData.logoSize,
                  width: qrData.logoSize,
                  excavate: true,
                  opacity: 1,
                } : undefined}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Chip size="sm" variant="flat" color="primary">
                {activeType?.label}
              </Chip>
              <span className="text-sm text-[var(--text-muted)]">
                Escaneos: {0}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    size="sm"
                    startContent={<HiDownload className="w-4 h-4" />}
                  >
                    Descargar
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={(key) => (key === 'png' ? downloadPNG() : downloadSVG())}>
                  <DropdownItem key="png" startContent={<HiOutlinePhotograph className="w-4 h-4" />}>
                    PNG
                  </DropdownItem>
                  <DropdownItem key="svg" startContent={<HiOutlineCode className="w-4 h-4" />}>
                    SVG
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button
                variant="bordered"
                size="sm"
                onPress={() => { setQrData(null); setError(''); }}
              >
                Generar otro QR
              </Button>
              <Button
                as={Link}
                to="/dashboard"
                variant="flat"
                size="sm"
                color="primary"
              >
                Ver Dashboard
              </Button>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xs text-[var(--text-muted)] truncate max-w-[200px] sm:max-w-[300px]">
                  {qrData.shortUrl}
                </span>
                <Tooltip content={copiedShort ? '¡Copiado!' : 'Copiar enlace corto'}>
                  <button
                    onClick={() => copyToClipboard(qrData.shortUrl)}
                    className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors flex-shrink-0"
                  >
                    <HiOutlineClipboard className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                {qrData.scanUrl}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRGenerator;
