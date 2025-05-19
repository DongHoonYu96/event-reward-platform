## API 문서

### 인증 API (AUTH-SERVICE)

#### 로그인

- **URL**: `/AUTH-SERVICE/users/login`
- **Method**: `POST`
- **Description**: 사용자 로그인
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "string",
    "user": {
      "userId": "string",
      "username": "string",
      "role": "USER"
    }
  }
  ```

#### 회원가입

- **URL**: `/AUTH-SERVICE/users/register`
- **Method**: `POST`
- **Description**: 새로운 사용자 등록
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string"
  }
  ```
- **Response**:
  ```json
  {
    "userId": "string",
    "username": "string",
    "role": "USER"
  }
  ```

#### 사용자 정보 조회

- **URL**: `/AUTH-SERVICE/users/info`
- **Method**: `GET`
- **Description**: 현재 로그인한 사용자의 정보 조회
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "userId": "string",
    "username": "string",
    "role": "USER"
  }
  ```

### 이벤트 API (EVENT-SERVICE)

#### 이벤트 생성

- **URL**: `/EVENT-SERVICE/events`
- **Method**: `POST`
- **Description**: 새로운 이벤트 생성
- **Headers**: `Authorization: Bearer {token}`
- **Required Role**: ADMIN, OPERATOR
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "status": "DRAFT",
    "conditions": [
      {
        "type": "CONTINUOUS_LOGIN",
        "value": 7,
        "description": "7일 연속 로그인"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "status": "DRAFT",
    "conditions": [...],
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-01T00:00:00Z"
  }
  ```

#### 이벤트 목록 조회

- **URL**: `/EVENT-SERVICE/events`
- **Method**: `GET`
- **Description**: 이벤트 목록 조회
- **Query Parameters**:
    - `status` (optional): 이벤트 상태 (DRAFT, ACTIVE, INACTIVE, COMPLETED)
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "startDate": "2024-06-01T00:00:00Z",
      "endDate": "2024-08-31T23:59:59Z",
      "status": "ACTIVE",
      "conditions": [...],
      "createdAt": "2024-05-01T00:00:00Z",
      "updatedAt": "2024-05-01T00:00:00Z"
    }
  ]
  ```

#### 이벤트 상세 조회

- **URL**: `/EVENT-SERVICE/events/{id}`
- **Method**: `GET`
- **Description**: 특정 이벤트 상세 정보 조회
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "status": "ACTIVE",
    "conditions": [...],
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-01T00:00:00Z"
  }
  ```

### 보상 API (EVENT-SERVICE)

#### 보상 생성

- **URL**: `/EVENT-SERVICE/rewards`
- **Method**: `POST`
- **Description**: 새로운 보상 생성
- **Headers**: `Authorization: Bearer {token}`
- **Required Role**: ADMIN, OPERATOR
- **Request Body**:
  ```json
  {
    "name": "string",
    "type": "POINT",
    "amount": 1000,
    "description": "string",
    "eventId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "POINT",
    "amount": 1000,
    "description": "string",
    "eventId": "string",
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-01T00:00:00Z"
  }
  ```

#### 이벤트별 보상 목록 조회

- **URL**: `/EVENT-SERVICE/rewards/event/{eventId}`
- **Method**: `GET`
- **Description**: 특정 이벤트의 보상 목록 조회
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "type": "POINT",
      "amount": 1000,
      "description": "string",
      "eventId": "string",
      "createdAt": "2024-05-01T00:00:00Z",
      "updatedAt": "2024-05-01T00:00:00Z"
    }
  ]
  ```

### 보상 청구 API (EVENT-SERVICE)

#### 보상 청구 생성

- **URL**: `/EVENT-SERVICE/claims`
- **Method**: `POST`
- **Description**: 새로운 보상 청구 생성
- **Headers**: `Authorization: Bearer {token}`
- **Required Role**: USER
- **Request Body**:
  ```json
  {
    "eventId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "status": "REQUESTED",
    "rewards": [...],
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-01T00:00:00Z"
  }
  ```

#### 보상 청구 목록 조회

- **URL**: `/EVENT-SERVICE/claims`
- **Method**: `GET`
- **Description**: 보상 청구 목록 조회
- **Headers**: `Authorization: Bearer {token}`
- **Required Role**: ADMIN, OPERATOR, AUDITOR
- **Query Parameters**:
    - `status` (optional): 청구 상태
    - `eventId` (optional): 이벤트 ID
    - `userId` (optional): 사용자 ID
- **Response**:
  ```json
  [
    {
      "id": "string",
      "userId": "string",
      "eventId": "string",
      "status": "REQUESTED",
      "rewards": [...],
      "createdAt": "2024-05-01T00:00:00Z",
      "updatedAt": "2024-05-01T00:00:00Z"
    }
  ]
  ```

#### 내 보상 청구 목록 조회

- **URL**: `/EVENT-SERVICE/claims/my`
- **Method**: `GET`
- **Description**: 현재 사용자의 보상 청구 목록 조회
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "userId": "string",
      "eventId": "string",
      "status": "REQUESTED",
      "rewards": [...],
      "createdAt": "2024-05-01T00:00:00Z",
      "updatedAt": "2024-05-01T00:00:00Z"
    }
  ]
  ```

#### 보상 청구 처리

- **URL**: `/EVENT-SERVICE/claims/{id}/make-decision`
- **Method**: `PUT`
- **Description**: 보상 청구 승인/거절 처리
- **Headers**: `Authorization: Bearer {token}`
- **Required Role**: ADMIN, OPERATOR
- **Request Body**:
  ```json
  {
    "status": "APPROVED",
    "rejectionReason": "string" // status가 REJECTED일 때만 필요
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "status": "APPROVED",
    "rewards": [...],
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-01T00:00:00Z"
  }
  ```

### 상태 코드

- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증되지 않은 요청
- `403 Forbidden`: 권한 없는 요청
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류