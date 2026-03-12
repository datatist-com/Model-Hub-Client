import { Button, Card, Descriptions, Form, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';

export default function LicensePage() {
  const { t } = useTranslation();
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card className="page-card" title={t('pages.license.title')}>
        <Form layout="inline">
          <Form.Item label="licenseKey" name="licenseKey" rules={[{ required: true }]}>
            <Input style={{ width: 300 }} placeholder="LIC-XXXX-XXXX-XXXX" />
          </Form.Item>
          <Button type="primary">Activate (Mock)</Button>
        </Form>
      </Card>
      <Card className="page-card" title="License Status (Mock)">
        <Descriptions column={2}>
          <Descriptions.Item label="licenseKeyMasked">AB12********WXYZ</Descriptions.Item>
          <Descriptions.Item label="licensee">ACME Corp</Descriptions.Item>
          <Descriptions.Item label="activatedAt">2026-03-03T09:30:00Z</Descriptions.Item>
          <Descriptions.Item label="expiresAt">2027-03-03T23:59:59Z</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}
