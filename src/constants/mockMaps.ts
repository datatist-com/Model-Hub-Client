/** Mock data-source name lookup (shared by all data-source-related pages) */
export const SOURCE_NAME_MAP: Record<string, string> = {
  'src-001': 'hive-prod',
  'src-002': 'duckdb-local-a'
};

/** Full mock model record shared across model-related pages */
export type MockModel = {
  id: string;
  modelName: string;
  portrait: string;
  target: string;
  algorithm: string;
  auc?: number;
  liftTop10?: number;
  published?: boolean;
};

export const MOCK_MODELS: MockModel[] = [
  { id: 'mod-001', modelName: '新疆工行长尾客群资产提升模型', portrait: 'AUM资产客群画像', target: '新疆工行长尾客群资产提升', algorithm: '画龙模型A (2026.01)', auc: 0.83, liftTop10: 3.2, published: true },
  { id: 'mod-002', modelName: '信用卡激活预测模型', portrait: '三方支付客群画像', target: '信用卡激活预测', algorithm: '画龙模型A (2026.01)', auc: 0.77, liftTop10: 2.8, published: false },
  { id: 'mod-003', modelName: '客户流失预警模型', portrait: '贷款客群画像', target: '客户流失预警', algorithm: '画龙模型A (2026.01)' }
];

/** Mock model name lookup (shared by model-related pages) */
export const MODEL_NAME_MAP: Record<string, string> = Object.fromEntries(
  MOCK_MODELS.map((m) => [m.id, m.modelName])
);
