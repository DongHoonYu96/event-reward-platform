export enum EventStatus {
    DRAFT = 'DRAFT', // 초안, 아직 공개되지 않음
    ACTIVE = 'ACTIVE', // 진행 중
    INACTIVE = 'INACTIVE', // 임시 중단(버그 등)
    COMPLETED = 'COMPLETED', // 정상종료
}