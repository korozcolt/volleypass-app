import { jest } from '@jest/globals';

describe('Basic Test Suite', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should work with mocks', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should handle objects', () => {
    const testObject = {
      id: 1,
      name: 'Test',
      active: true
    };
    
    expect(testObject).toEqual({
      id: 1,
      name: 'Test',
      active: true
    });
  });

  it('should handle arrays', () => {
    const testArray = [1, 2, 3];
    expect(testArray).toHaveLength(3);
    expect(testArray).toContain(2);
  });
});