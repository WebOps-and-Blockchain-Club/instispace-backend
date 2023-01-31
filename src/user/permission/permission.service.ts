import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { PermissionInput } from './type/permission.input';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  getAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  getOne(permissionInput: PermissionInput): Promise<Permission> {
    return this.permissionRepository.findOne({
      where: {
        account: Raw((alias) => `${alias} = :account`, {
          account: permissionInput.account,
        }),
        livePosts: Raw((alias) => `${alias} = :livePosts`, {
          livePosts: permissionInput.livePosts,
        }),
        hostel: Raw((alias) => `${alias} = :hostel`, {
          hostel: permissionInput.hostel,
        }),
        createTag: permissionInput.createTag
          ? permissionInput.createTag
          : false,
        createNotification: permissionInput.createNotification
          ? permissionInput.createNotification
          : false,
        handleReports: permissionInput.handleReports
          ? permissionInput.handleReports
          : false,
        approvePosts: permissionInput.approvePosts
          ? permissionInput.approvePosts
          : false,
      },
      relations: ['users'],
    });
  }

  create(permissionInput: PermissionInput): Promise<Permission> {
    const permission = this.permissionRepository.create({ ...permissionInput });
    return this.permissionRepository.save(permission);
  }
}
