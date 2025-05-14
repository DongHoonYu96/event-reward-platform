// common/types.ts - 공통 타입 정의

// 사용자 역할 정의
export enum UserRole {
    USER = 'USER',         // 보상 요청 가능
    OPERATOR = 'OPERATOR', // 이벤트/보상 등록 가능
    AUDITOR = 'AUDITOR',   // 보상 이력 조회만 가능
    ADMIN = 'ADMIN',       // 모든 기능 접근 가능
}

// 사용자 인터페이스
export interface User {
    _id: string;
    username: string;
    password: string;      // DB에는 해시된 값으로 저장됨
    email: string;
    roles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
}

// 이벤트 인터페이스
export interface Event {
    _id: string;
    name: string;
    description: string;
    conditions: EventCondition[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdBy: string;     // 생성자 ID
    createdAt: Date;
    updatedAt: Date;
}

// 이벤트 조건 인터페이스
export interface EventCondition {
    type: string;          // 예: 'LOGIN_STREAK', 'FRIEND_INVITE' 등
    requiredValue: number; // 예: 7일 로그인, 3명 친구 초대
    description: string;   // 사람이 읽을 수 있는 설명
}

// 보상 인터페이스
export interface Reward {
    _id: string;
    eventId: string;       // 연결된 이벤트
    name: string;
    type: string;          // 예: 'POINTS', 'ITEM', 'COUPON'
    value: number;         // 보상의 양/수량
    description: string;
    createdBy: string;     // 생성자 ID
    createdAt: Date;
    updatedAt: Date;
}

// 보상 요청 인터페이스
export interface RewardRequest {
    _id: string;
    userId: string;        // 보상을 요청한 사용자
    eventId: string;
    rewardId: string;
    status: RequestStatus; // PENDING, APPROVED, REJECTED
    processedBy?: string;  // 요청을 처리한 관리자/운영자
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 요청 상태 열거형
export enum RequestStatus {
    PENDING = 'PENDING',   // 대기중
    APPROVED = 'APPROVED', // 승인됨
    REJECTED = 'REJECTED', // 거절됨
}

// JWT 페이로드 인터페이스
export interface JwtPayload {
    sub: string;           // 사용자 ID
    username: string;
    roles: UserRole[];
    iat?: number;          // 발급 시간
    exp?: number;          // 만료 시간
}