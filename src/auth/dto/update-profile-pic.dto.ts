import { IsNotEmpty, ValidationArguments, IsEnum, Length } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from 'src/config/common.config';
import { IsValidDate } from 'src/decorator/is-valid-date.decorator';
import { Gender } from 'src/enum/gender.enum';

export class UpdateProfilePicDto {
    @ApiProperty({
        type: "string",
        format: "binary",
        description: "profile Picture Url (Allow Only 'JPG,JPEG,PNG')",
        example: "profile.jpg",
    })
    profile_pic: string;
}