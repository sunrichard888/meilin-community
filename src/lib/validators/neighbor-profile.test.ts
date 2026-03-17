import { describe, it, expect } from 'vitest';
import { validateNeighborProfile, validateFieldSingle } from './neighbor-profile';

describe('validateNeighborProfile', () => {
  it('接受有效的邻里认证数据', () => {
    const validData = {
      communityName: '阳光花园',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
      introduction: '你好，我是新邻居',
    };

    const errors = validateNeighborProfile(validData);
    expect(errors).toHaveLength(0);
  });

  it('接受不带自我介绍的数据', () => {
    const validData = {
      communityName: '阳光花园',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
    };

    const errors = validateNeighborProfile(validData);
    expect(errors).toHaveLength(0);
  });
});

describe('小区名称验证', () => {
  it('拒绝空的小区名称', () => {
    const data = {
      communityName: '',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
    };

    const errors = validateNeighborProfile(data);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('communityName');
    expect(errors[0].message).toBe('此字段为必填项');
  });

  it('拒绝少于 2 个字符的小区名称', () => {
    const data = {
      communityName: 'A',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
    };

    const errors = validateNeighborProfile(data);
    expect(errors.some(e => e.field === 'communityName')).toBe(true);
    expect(errors.some(e => e.message.includes('至少 2 个字符'))).toBe(true);
  });

  it('拒绝超过 50 个字符的小区名称', () => {
    const data = {
      communityName: 'A'.repeat(51),
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
    };

    const errors = validateNeighborProfile(data);
    expect(errors.some(e => e.field === 'communityName')).toBe(true);
    expect(errors.some(e => e.message.includes('不超过 50 个字符'))).toBe(true);
  });

  it('拒绝包含特殊符号的小区名称', () => {
    const data = {
      communityName: '小区@#$',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
    };

    const errors = validateNeighborProfile(data);
    expect(errors.some(e => e.field === 'communityName')).toBe(true);
    expect(errors.some(e => e.message.includes('只允许中文'))).toBe(true);
  });

  it('接受包含空格和连字符的小区名称', () => {
    const data = {
      communityName: '阳光花园 - 二期',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
    };

    const errors = validateNeighborProfile(data);
    expect(errors).toHaveLength(0);
  });
});

describe('楼栋号验证', () => {
  it('接受 1-999 的数字', () => {
    expect(validateFieldSingle('1', 'buildingNumber')).toBeNull();
    expect(validateFieldSingle('99', 'buildingNumber')).toBeNull();
    expect(validateFieldSingle('999', 'buildingNumber')).toBeNull();
  });

  it('接受单个大写字母 A-Z', () => {
    expect(validateFieldSingle('A', 'buildingNumber')).toBeNull();
    expect(validateFieldSingle('Z', 'buildingNumber')).toBeNull();
  });

  it('拒绝 0', () => {
    expect(validateFieldSingle('0', 'buildingNumber')).not.toBeNull();
  });

  it('拒绝 1000 及以上', () => {
    expect(validateFieldSingle('1000', 'buildingNumber')).not.toBeNull();
  });

  it('拒绝小写字母', () => {
    expect(validateFieldSingle('a', 'buildingNumber')).not.toBeNull();
  });

  it('拒绝多个字母', () => {
    expect(validateFieldSingle('AB', 'buildingNumber')).not.toBeNull();
  });

  it('拒绝前导零', () => {
    expect(validateFieldSingle('01', 'buildingNumber')).not.toBeNull();
  });

  it('拒绝空值', () => {
    expect(validateFieldSingle('', 'buildingNumber')).toBe('此字段为必填项');
  });
});

describe('单元号验证', () => {
  it('接受 1-99 的数字', () => {
    expect(validateFieldSingle('1', 'unitNumber')).toBeNull();
    expect(validateFieldSingle('99', 'unitNumber')).toBeNull();
    expect(validateFieldSingle('12', 'unitNumber')).toBeNull();
  });

  it('拒绝 0', () => {
    expect(validateFieldSingle('0', 'unitNumber')).not.toBeNull();
  });

  it('拒绝 100 及以上', () => {
    expect(validateFieldSingle('100', 'unitNumber')).not.toBeNull();
  });

  it('拒绝前导零', () => {
    expect(validateFieldSingle('01', 'unitNumber')).not.toBeNull();
  });
});

describe('房号验证', () => {
  it('接受 1-4 位数字', () => {
    expect(validateFieldSingle('1', 'roomNumber')).toBeNull();
    expect(validateFieldSingle('101', 'roomNumber')).toBeNull();
    expect(validateFieldSingle('1201', 'roomNumber')).toBeNull();
    expect(validateFieldSingle('9999', 'roomNumber')).toBeNull();
  });

  it('拒绝空值', () => {
    expect(validateFieldSingle('', 'roomNumber')).toBe('此字段为必填项');
  });

  it('拒绝 5 位及以上数字', () => {
    expect(validateFieldSingle('10000', 'roomNumber')).not.toBeNull();
  });

  it('拒绝字母', () => {
    expect(validateFieldSingle('A1', 'roomNumber')).not.toBeNull();
  });
});

describe('自我介绍验证', () => {
  it('接受空值（可选字段）', () => {
    const data = {
      communityName: '阳光花园',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
      introduction: '',
    };

    const errors = validateNeighborProfile(data);
    expect(errors).toHaveLength(0);
  });

  it('接受 500 字以内的自我介绍', () => {
    const data = {
      communityName: '阳光花园',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
      introduction: '你好，我是新搬来的邻居',
    };

    const errors = validateNeighborProfile(data);
    expect(errors).toHaveLength(0);
  });

  it('拒绝超过 500 字的自我介绍', () => {
    const data = {
      communityName: '阳光花园',
      buildingNumber: '3',
      unitNumber: '12',
      roomNumber: '1201',
      introduction: 'A'.repeat(501),
    };

    const errors = validateNeighborProfile(data);
    expect(errors.some(e => e.field === 'introduction')).toBe(true);
    expect(errors.some(e => e.message.includes('不超过 500 个字符'))).toBe(true);
  });
});

describe('多字段错误', () => {
  it('返回所有字段的错误', () => {
    const data = {
      communityName: '',
      buildingNumber: '',
      unitNumber: '',
      roomNumber: '',
    };

    const errors = validateNeighborProfile(data);
    expect(errors).toHaveLength(4);
    expect(errors.map(e => e.field)).toEqual([
      'communityName',
      'buildingNumber',
      'unitNumber',
      'roomNumber',
    ]);
  });
});
