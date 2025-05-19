import {ApiProperty} from "@nestjs/swagger";

export class KeySetPaginationResultDto<T> {
    @ApiProperty({ description: '현재 페이지의 데이터 목록' })
    items: T[];

    @ApiProperty({ description: '다음 페이지 조회를 위한 마지막 항목 ID' })
    nextCursor?: string;

    @ApiProperty({ description: '더 조회할 데이터가 있는지 여부' })
    hasMore: boolean;
}