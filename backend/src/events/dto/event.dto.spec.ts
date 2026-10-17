import { validate } from 'class-validator';
import { RevenueSource, WorkShift } from '@prisma/client';
import { CreateEventDto } from './create-event.dto.js';
import { UpdateEventDto } from './update-event.dto.js';
import { QueryEventDto } from './query-event.dto.js';

const validEvent = {
  title: 'Live nhạc tối thứ Bảy',
  source: RevenueSource.POS,
  amount: 0,
  eventDate: '2026-10-17',
  shift: WorkShift.CA_TOI,
};

describe('Event amount validation', () => {
  it.each([CreateEventDto, UpdateEventDto])('rejects a negative amount in %p', async (Dto) => {
    const dto = Object.assign(new Dto(), validEvent, { amount: -1 });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'amount')).toBe(true);
  });

  it('accepts zero for a new event', async () => {
    const errors = await validate(Object.assign(new CreateEventDto(), validEvent));

    expect(errors).toHaveLength(0);
  });

  it('rejects a page size above 100', async () => {
    const errors = await validate(Object.assign(new QueryEventDto(), { pageSize: 101 }));

    expect(errors.some((error) => error.property === 'pageSize')).toBe(true);
  });
});
