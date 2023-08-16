import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, Generated, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Submission } from '../submissions/submission.entity';
import { User } from 'src/user/user.entity';

@Entity()
@ObjectType()
export class Group {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({nullable:true})
  @Column({nullable:true})
  name: string;

  @Column({ type: "text", array: true })
  order: string[];

  // @Column({ unique: true })
  // @Generated('increment')
  // @PrimaryColumn()
  // @Field()
  // code: string;

  @Field({nullable:true})
  @Column({nullable:true,unique:true},)
 // @Generated('increment')
  code:string


  @OneToMany((_type) => User, (users) => users.group ,{nullable:true})
  @Field(()=>[User])
  users: User[];

  @OneToMany((_type) => Submission, (submission) => submission.group, {
    nullable: true,
  })
  submissions: Submission[];

}
