import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from '@nestjs/common';
import { Observable } from 'rxjs';
import { plainToClass } from 'class-transformer';
import { KeySetPaginationDto } from '../dto/keyset-pagination.dto';
import { CreateEventDto } from '../../modules/events/dto/create-event.dto';
import { UpdateEventDto } from '../../modules/events/dto/update-event.dto';
// ... 다른 DTO들 import

// DTO 매핑 설정
const DTO_MAPPINGS = {
    paginationDto: KeySetPaginationDto,
    createEventDto: CreateEventDto,
    updateEventDto: UpdateEventDto,
    // ... 다른 DTO 매핑 추가
};

@Injectable()
export class TransformDtoInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TransformDtoInterceptor.name);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // RPC 컨텍스트인 경우에만 처리
        this.logger.debug(`Execution context type: ${context.getType()}`);
        if (context.getType() === 'rpc') {
            const request = context.switchToRpc().getData();
            this.logger.debug(`Transforming DTO for request: ${JSON.stringify(request)}`);

            // request의 모든 키를 순회하면서 DTO 변환
            Object.keys(request).forEach(key => {
                if (DTO_MAPPINGS[key]) {
                    request[key] = plainToClass(DTO_MAPPINGS[key], request[key]);
                }
            });
        }

        return next.handle();
    }
}