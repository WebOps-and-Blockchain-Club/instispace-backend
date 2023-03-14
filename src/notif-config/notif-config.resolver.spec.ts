import { Test, TestingModule } from '@nestjs/testing';
import { NotifConfigResolver } from './notif-config.resolver';
import { NotifConfigService } from './notif-config.service';

describe('NotifConfigResolver', () => {
  let resolver: NotifConfigResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifConfigResolver, NotifConfigService],
    }).compile();

    resolver = module.get<NotifConfigResolver>(NotifConfigResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
