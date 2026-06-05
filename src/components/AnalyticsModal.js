import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from '@heroui/react';
import {
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineLink,
  HiOutlineTrash,
} from 'react-icons/hi';

const QR_TYPE_LABELS = {
  url: 'URL',
  text: 'Texto',
  email: 'Email',
  phone: 'Teléfono',
  sms: 'SMS',
  wifi: 'WiFi',
};

const QR_TYPE_COLORS = {
  url: 'primary',
  text: 'secondary',
  email: 'success',
  phone: 'warning',
  sms: 'danger',
  wifi: 'default',
};

const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return '—';
  return new Date(timestamp.seconds * 1000).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateFull = (timestamp) => {
  if (!timestamp?.seconds) return '—';
  return new Date(timestamp.seconds * 1000).toLocaleString('es', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-5 h-5 mt-0.5 text-[var(--text-muted)] flex-shrink-0">
      <Icon className="w-full h-full" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
      <p className="text-sm text-[var(--text)] break-words mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const AnalyticsModal = ({ qr, isOpen, onClose, onDelete }) => {
  if (!qr) return null;

  const typeColor = QR_TYPE_COLORS[qr.type] || 'default';
  const typeLabel = QR_TYPE_LABELS[qr.type] || qr.type || 'URL';
  const hasBeenScanned = (qr.scanCount ?? 0) > 0;

  const renderTypeSpecificContent = () => {
    switch (qr.type) {
      case 'url':
        return (
          <DetailRow
            icon={HiOutlineLink}
            label="URL de destino"
            value={qr.originalUrl}
          />
        );
      case 'text':
        return (
          <DetailRow
            icon={HiOutlineLink}
            label="Contenido"
            value={qr.textContent}
          />
        );
      case 'email':
        return (
          <>
            <DetailRow icon={HiOutlineLink} label="Destinatario" value={qr.emailTo} />
            <DetailRow icon={HiOutlineLink} label="Asunto" value={qr.emailSubject} />
            <DetailRow icon={HiOutlineLink} label="Cuerpo" value={qr.emailBody} />
          </>
        );
      case 'phone':
        return (
          <DetailRow icon={HiOutlineLink} label="Número" value={qr.phoneNumber} />
        );
      case 'sms':
        return (
          <>
            <DetailRow icon={HiOutlineLink} label="Número" value={qr.smsNumber} />
            <DetailRow icon={HiOutlineLink} label="Mensaje" value={qr.smsMessage} />
          </>
        );
      case 'wifi':
        return (
          <>
            <DetailRow icon={HiOutlineLink} label="SSID" value={qr.wifiSsid} />
            <DetailRow icon={HiOutlineLink} label="Contraseña" value={qr.wifiPassword} />
            <DetailRow icon={HiOutlineLink} label="Cifrado" value={qr.wifiEncryption} />
          </>
        );
      default:
        return (
          <DetailRow
            icon={HiOutlineLink}
            label="URL de destino"
            value={qr.originalUrl}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="md" placement="center">
      <ModalContent className="border border-[var(--border)]">
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text)] font-semibold">Analíticas del QR</span>
            <Chip size="sm" variant="flat" color={typeColor}>
              {typeLabel}
            </Chip>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-normal">
            {qr.id}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-3 rounded-xl border ${hasBeenScanned ? 'border-green-200 bg-green-50' : 'border-[var(--border)] bg-[var(--bg-card)]'}`}>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Escaneos</p>
              <p className={`text-2xl font-bold mt-0.5 ${hasBeenScanned ? 'text-green-700' : 'text-[var(--text)]'}`}>
                {qr.scanCount ?? 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Creado</p>
              <p className="text-lg font-semibold text-[var(--text)] mt-0.5">
                {formatDate(qr.createdAt)}
              </p>
            </div>
          </div>

          <Divider className="my-2" />

          <div className="space-y-1">
            <DetailRow
              icon={HiOutlineCalendar}
              label="Fecha de creación"
              value={formatDateFull(qr.createdAt)}
            />
            <DetailRow
              icon={HiOutlineClock}
              label="Último escaneo"
              value={qr.lastScanned ? formatDateFull(qr.lastScanned) : 'Nunca'}
            />
            <DetailRow
              icon={HiOutlineEye}
              label="URL de escaneo"
              value={`${window.location.origin}/scan/${qr.id}`}
            />
            {qr.shortCode && (
              <DetailRow
                icon={HiOutlineLink}
                label="Link corto"
                value={`${window.location.origin}/s/${qr.shortCode}`}
              />
            )}
          </div>

          <Divider className="my-2" />

          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
            Contenido del QR
          </p>
          <div className="bg-[var(--bg-page)] rounded-lg p-3 border border-[var(--border)]">
            {renderTypeSpecificContent()}
          </div>

          {qr.logo && (
            <>
              <Divider className="my-2" />
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
                Logo
              </p>
              <img
                src={qr.logo}
                alt="Logo del QR"
                className="w-12 h-12 object-contain rounded-lg border border-[var(--border)]"
              />
            </>
          )}
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button
            variant="light"
            color="danger"
            size="sm"
            startContent={<HiOutlineTrash className="w-4 h-4" />}
            onPress={() => onDelete?.(qr.id)}
          >
            Eliminar
          </Button>
          <Button variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AnalyticsModal;
