import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {

  transform(value: string, metadata: ArgumentMetadata) {
    
    //console.log({value, metadata});

    if ( !isValidObjectId(value) ){ //Si el value no es un mongoId, retornamos un error
      throw new BadRequestException(`${value} is not a valid mongo Id`);
    }
    
    return value;
  }
}
