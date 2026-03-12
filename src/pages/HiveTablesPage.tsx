import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tabs, Tooltip } from 'antd';
import { LeftOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Row = { id: string; databaseName: string; tableName: string; alias?: string; fieldCount: number; rowCount: number };

const SOURCE_NAME_MAP: Record<string, string> = { 'src-001': 'hive-prod', 'src-002': 'duckdb-local-a' };

const mockFields = [
  { name: 'user_id', type: 'BIGINT', comment: '用户ID' },
  { name: 'event_type', type: 'STRING', comment: '事件类型' },
  { name: 'event_time', type: 'TIMESTAMP', comment: '事件时间' },
  { name: 'amount', type: 'DOUBLE', comment: '金额' },
  { name: 'channel', type: 'STRING', comment: '渠道' }
];

const data: Row[] = [
  { id: 'htb-001', databaseName: 'dwd', tableName: 'user_events_di', alias: '用户事件日表', fieldCount: 5, rowCount: 1280000 },
  { id: 'htb-002', databaseName: 'dwd', tableName: 'user_profile', alias: '用户画像宽表', fieldCount: 18, rowCount: 350000 }
];

const HIVE_TYPES = ['STRING', 'INT', 'BIGINT', 'DOUBLE', 'FLOAT', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'DECIMAL', 'ARRAY', 'MAP', 'STRUCT'];

export default function HiveTablesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-001';
  const databaseName = searchParams.get('databaseName') ?? 'dwd';
  const sourceName = SOURCE_NAME_MAP[sourceId] ?? sourceId;
  const [createOpen, setCreateOpen] = useState(false);
  const [fieldDetailOpen, setFieldDetailOpen] = useState(false);

  const fieldColumns = [
    { title: t('pages.hiveTables.fieldDetailColumns.name'), dataIndex: 'name' },
    { title: t('pages.hiveTables.fieldDetailColumns.type'), dataIndex: 'type' },
    { title: t('pages.hiveTables.fieldDetailColumns.comment'), dataIndex: 'comment' }
  ];

  const columns: ColumnsType<Row> = [
    { title: t('pages.hiveTables.columns.database'), dataIndex: 'databaseName' },
    { title: t('pages.hiveTables.columns.table'), dataIndex: 'tableName' },
    { title: t('pages.hiveTables.columns.alias'), dataIndex: 'alias' },
    {
      title: t('pages.hiveTables.columns.objectCount'),
      dataIndex: 'fieldCount',
      render: (count: number) => <a onClick={() => setFieldDetailOpen(true)}>{t('pages.hiveTables.containsFields', { count })}</a>
    },
    {
      title: t('pages.hiveTables.columns.rowCount'),
      dataIndex: 'rowCount',
      render: (v: number) => v.toLocaleString()
    }
  ];

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t('pages.hiveTables.backToHiveDatabases')}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() =>
                navigate(`/hive-databases?sourceId=${encodeURIComponent(sourceId)}`, {
                  state: { sessionTabMode: 'replace' }
                })
              }
            />
          </Tooltip>
          <span>{t('pages.hiveTables.title')} ({t('pages.hiveTables.sourceLabel')}: {sourceName})</span>
        </Space>
      }
      extra={<Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data.map((item) => ({ ...item, databaseName }))} />

      <Modal open={createOpen} title={t('pages.hiveTables.createTitle')} footer={null} onCancel={() => setCreateOpen(false)} width={640}>
        <Tabs
          items={[
            {
              key: 'sql',
              label: t('pages.hiveTables.createBySql'),
              children: (
                <Form layout="vertical" onFinish={() => setCreateOpen(false)}>
                  <Form.Item label={t('pages.hiveTables.form.sql')} name="sql" rules={[{ required: true }]}>
                    <Input.TextArea rows={8} placeholder="CREATE TABLE ..." />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">{t('common.submit')}</Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'fields',
              label: t('pages.hiveTables.createByFields'),
              children: (
                <Form layout="vertical" onFinish={() => setCreateOpen(false)}>
                  <Form.Item label={t('pages.hiveTables.form.tableName')} name="tableName" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('pages.hiveTables.form.alias')} name="alias">
                    <Input />
                  </Form.Item>
                  <Form.List name="fields">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                            <Form.Item {...restField} name={[name, 'fieldName']} rules={[{ required: true }]}>
                              <Input placeholder={t('pages.hiveTables.form.fieldName')} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'fieldType']} rules={[{ required: true }]}>
                              <Select
                                placeholder={t('pages.hiveTables.form.fieldType')}
                                style={{ width: 150 }}
                                options={HIVE_TYPES.map((tp) => ({ value: tp, label: tp }))}
                              />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            {t('pages.hiveTables.form.addField')}
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">{t('common.submit')}</Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Modal>

      <Modal
        open={fieldDetailOpen}
        title={t('pages.hiveTables.fieldDetailTitle')}
        footer={null}
        onCancel={() => setFieldDetailOpen(false)}
      >
        <Table rowKey="name" columns={fieldColumns} dataSource={mockFields} pagination={false} />
      </Modal>
    </Card>
  );
}
