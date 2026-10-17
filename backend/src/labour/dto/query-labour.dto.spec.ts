import { validate } from 'class-validator';
import { QueryLabourDto } from './query-labour.dto.js';

describe('QueryLabourDto', () => {
  it('rejects a page size above 100', async () => {
    const errors = await validate(Object.assign(new QueryLabourDto(), { pageSize: 101 }));

    expect(errors.some((error) => error.property === 'pageSize')).toBe(true);
  });
});
