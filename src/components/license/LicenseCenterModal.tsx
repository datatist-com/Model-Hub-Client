import { Button, Descriptions, Input, Modal, Tag, Typography } from 'antd';
import { formatDisplayDate } from './licenseUtils';

export type LicenseState = 'missing' | 'expired' | 'active';

export type LicenseInfo = {
  licenseKeyMasked: string;
  licensee: string;
  activatedAt: string;
  expiresAt: string;
};

export type LicenseCenterModalProps = {
  open: boolean;
  onCancel: () => void;
  className?: string;
  state: LicenseState;
  stateText: string;
  title: string;
  subtitle: string;
  licenseInfo: LicenseInfo | null;
  keyLabel: string;
  organizationLabel: string;
  validUntilLabel: string;
  activatedAtLabel: string;
  inputHint: string;
  inputPlaceholder: string;
  activateButtonText: string;
  licenseKeyInput: string;
  onLicenseKeyInputChange: (value: string) => void;
  onActivate: () => void;
};

const STATE_COLOR_MAP: Record<LicenseState, string> = {
  missing: 'gold',
  expired: 'volcano',
  active: 'green'
};

export default function LicenseCenterModal({
  open,
  onCancel,
  className,
  state,
  stateText,
  title,
  subtitle,
  licenseInfo,
  keyLabel,
  organizationLabel,
  validUntilLabel,
  activatedAtLabel,
  inputHint,
  inputPlaceholder,
  activateButtonText,
  licenseKeyInput,
  onLicenseKeyInputChange,
  onActivate
}: LicenseCenterModalProps) {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} title={null} className={className}>
      <div className="login-license-modal-head">
        <div className="login-license-modal-title-wrap">
          <Typography.Title level={4} className="login-license-modal-title">
            {title}
          </Typography.Title>
          <Tag color={STATE_COLOR_MAP[state]} className="login-license-state-tag">
            {stateText}
          </Tag>
        </div>
      </div>

      <Typography.Paragraph className="login-license-modal-subtitle">{subtitle}</Typography.Paragraph>

      {licenseInfo && (
        <Descriptions column={1} size="small" className="app-license-status login-license-status-block">
          <Descriptions.Item label={keyLabel}>{licenseInfo.licenseKeyMasked}</Descriptions.Item>
          <Descriptions.Item label={organizationLabel}>{licenseInfo.licensee}</Descriptions.Item>
          <Descriptions.Item label={validUntilLabel}>{formatDisplayDate(licenseInfo.expiresAt)}</Descriptions.Item>
          <Descriptions.Item label={activatedAtLabel}>{formatDisplayDate(licenseInfo.activatedAt)}</Descriptions.Item>
        </Descriptions>
      )}

      <div className="login-license-action-panel">
        <Typography.Text className="login-license-input-label">{inputHint}</Typography.Text>
        <div className="login-license-action-row">
          <Input
            value={licenseKeyInput}
            onChange={(e) => onLicenseKeyInputChange(e.target.value)}
            placeholder={inputPlaceholder}
          />
          <Button type="primary" onClick={onActivate}>
            {activateButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
