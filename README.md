# 이벤트/보상 관리 시스템

NestJS + MSA + MongoDB 기반의 이벤트/보상 관리 시스템입니다.

## 시스템 구조

이 프로젝트는 다음과 같은 3개의 서버로 구성됩니다:

1. **Gateway Server**: 모든 API 진입점, JWT 검증 및 역할(Role) 검사
2. **Auth Server**: 사용자 관리, 인증, JWT 발급
3. **Event Server**: 이벤트 관리, 보상 관리, 조건 검증
```mermaid
flowchart TB
    subgraph "클라이언트"
        Client[클라이언트]
    end

    subgraph "Gateway Server"
        GW[API Gateway]
        GAUTH[인증/권한 검증]
        GROUTE[라우팅]
    end

    subgraph "Auth Server"
        AUTH[인증 서버]
        USER_DB[(사용자 DB)]
        JWT[JWT 관리]
        ROLE[역할 관리]
    end

    subgraph "Event Server"
        EVENT[이벤트 관리]
        REWARD[보상 관리]
        REQ[보상 요청 처리]
        EVENT_DB[(이벤트/보상 DB)]
    end

    Client --> GW
    GW --> GAUTH
    GAUTH --> GROUTE
    
    GROUTE --> AUTH
    GROUTE --> EVENT
    
    AUTH --> USER_DB
    AUTH --> JWT
    AUTH --> ROLE
    
    EVENT --> EVENT_DB
    EVENT --> REWARD
    EVENT --> REQ
    
    %% 통신 방식
    GROUTE -- "HTTP 또는 TCP 또는 메시지 큐" --> AUTH
    GROUTE -- "HTTP 또는 TCP 또는 메시지 큐" --> EVENT
```

## 실행 방법

### 사전 요구사항

- Docker
- Docker Compose

### 설치 및 실행

1. 저장소 클론

```bash
git clone https://github.com/your-username/event-reward-platform.git
cd event-reward-platform
```

2. Docker Compose로 서비스 시작

```bash
docker-compose up -d
```

3. 서비스 접근

- Gateway API: http://localhost:3000
- Auth API: http://localhost:3001
- Event API: http://localhost:3002

## API 문서

각 서버의 API 문서는 Swagger를 통해 확인할 수 있습니다:

- Gateway API 문서: http://localhost:3000/api
- Auth API 문서: http://localhost:3001/api
- Event API 문서: http://localhost:3002/api

## 설계 선택 이유
 todo : 


