import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDateString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidateIf,
} from 'class-validator';
import { DiscountType } from '../../generated/prisma/client.js';

@ValidatorConstraint({ name: 'isEndDateGreaterThanStartDate', async: false })
export class IsEndDateGreaterThanStartDateConstraint implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const object = args.object as any;
    if (!object.startDate || !endDate) return false;
    return new Date(endDate) > new Date(object.startDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'endDate must be greater than startDate';
  }
}

@ValidatorConstraint({ name: 'maxDiscountPercentage', async: false })
export class MaxDiscountPercentageConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const object = args.object as any;
    if (object.discountType === DiscountType.PERCENTAGE) {
      return value <= 100;
    }
    return true; // if not percentage, any max is fine
  }

  defaultMessage(args: ValidationArguments) {
    return 'Discount percentage cannot be more than 100';
  }
}
export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Validate(MaxDiscountPercentageConstraint)
  discountValue: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchase?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Quota must be at least 1' })
  quota: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  userLimit?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  @Validate(IsEndDateGreaterThanStartDateConstraint)
  endDate: string;
}
