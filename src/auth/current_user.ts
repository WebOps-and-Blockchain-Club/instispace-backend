import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    try {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req.user;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  },
);
