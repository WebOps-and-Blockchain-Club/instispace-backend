import { Test, TestingModule } from '@nestjs/testing';
import { NotifConfigService } from './notif-config.service';

describe('NotifConfigService', () => {
  let service: NotifConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifConfigService],
    }).compile();

    service = module.get<NotifConfigService>(NotifConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
