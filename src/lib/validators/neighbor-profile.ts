/**
 * 邻里认证验证规则
 */

export interface NeighborProfileData {
  communityName: string;
  buildingNumber: string;
  unitNumber: string;
  roomNumber: string;
  introduction?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

const VALIDATION_RULES = {
  communityName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-]+$/,
    patternMessage: '只允许中文、英文、数字、空格和连字符',
  },
  buildingNumber: {
    required: true,
    pattern: /^([1-9]\d{0,2}|[A-Z])$/,
    patternMessage: '楼栋号：1-999 或 A-Z',
  },
  unitNumber: {
    required: true,
    pattern: /^[1-9]\d?$/,
    patternMessage: '单元号：1-99',
  },
  roomNumber: {
    required: true,
    pattern: /^\d{1,4}$/,
    patternMessage: '房号：1-4 位数字',
  },
  introduction: {
    required: false,
    maxLength: 500,
  },
} as const;

export function validateNeighborProfile(
  data: NeighborProfileData
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 小区名称验证
  const communityError = validateField(
    data.communityName,
    'communityName',
    VALIDATION_RULES.communityName
  );
  if (communityError) errors.push(communityError);

  // 楼栋号验证
  const buildingError = validateField(
    data.buildingNumber,
    'buildingNumber',
    VALIDATION_RULES.buildingNumber
  );
  if (buildingError) errors.push(buildingError);

  // 单元号验证
  const unitError = validateField(
    data.unitNumber,
    'unitNumber',
    VALIDATION_RULES.unitNumber
  );
  if (unitError) errors.push(unitError);

  // 房号验证
  const roomError = validateField(
    data.roomNumber,
    'roomNumber',
    VALIDATION_RULES.roomNumber
  );
  if (roomError) errors.push(roomError);

  // 自我介绍验证（可选）
  if (data.introduction) {
    const introError = validateField(
      data.introduction,
      'introduction',
      VALIDATION_RULES.introduction
    );
    if (introError) errors.push(introError);
  }

  return errors;
}

function validateField(
  value: string,
  fieldName: string,
  rules: (typeof VALIDATION_RULES)[keyof typeof VALIDATION_RULES]
): ValidationError | null {
  // 必填检查
  if (rules.required && (!value || value.trim() === '')) {
    return { field: fieldName, message: '此字段为必填项' };
  }

  // 空值跳过后续验证
  if (!value) return null;

  // 最小长度检查
  const minLength = (rules as any).minLength;
  if (minLength !== undefined && value.length < minLength) {
    return {
      field: fieldName,
      message: `至少 ${minLength} 个字符`,
    };
  }

  // 最大长度检查
  const maxLength = (rules as any).maxLength;
  if (maxLength !== undefined && value.length > maxLength) {
    return {
      field: fieldName,
      message: `不超过 ${maxLength} 个字符`,
    };
  }

  // 格式验证
  const pattern = (rules as any).pattern;
  if (pattern !== undefined && !pattern.test(value)) {
    const patternMessage = (rules as any).patternMessage || '格式不正确';
    return {
      field: fieldName,
      message: patternMessage,
    };
  }

  return null;
}

export function validateFieldSingle(
  value: string,
  fieldName: keyof typeof VALIDATION_RULES
): string | null {
  const error = validateField(
    value,
    fieldName,
    VALIDATION_RULES[fieldName]
  );
  return error?.message || null;
}
