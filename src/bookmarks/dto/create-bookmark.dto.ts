import { IsInt, Min } from 'class-validator';

export class CreateBookmarkDto {
  @IsInt()
  @Min(1)
  packageId!: number;
}
