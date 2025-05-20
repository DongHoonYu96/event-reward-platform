describe('Claims', () => {
    let adminJwt = '';
    let userJwt = '';
    let eventId;
    let rewardId;

    beforeAll(async () => {
        const adminUser = await createAdminUser();
        const commonUser = await createCommonUser();
        adminJwt = await getJwtTokenFrom(adminUser);
        userJwt = await getJwtTokenFrom(commonUser);
        eventId = await createEventFrom(adminJwt);
        rewardId = await createRewardFrom(adminJwt,eventId);
    });

    test('조건에 맞을경우 요청은 승인되어야 한다.', async () => {
        const claim = {
            eventId: eventId,
        }
        const response = await fetch('http://gateway-server:3004/EVENT-SERVICE/claims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminJwt}`,
            },
            body: JSON.stringify(claim),
        });

        const data = await response.json();
        // console.log('Create Claim Response:', data);
        expect(data).toBeDefined();
        expect(data.status).toBe('APPROVED');
        expect(data.eventId).toBe(eventId);
        expect(data.rewards).toContain(rewardId);
    });

    test('중복된 요청은 거절되어야 한다.', async () => {
        const claim = {
            eventId: eventId,
        }
        const response1 = await fetch('http://gateway-server:3004/EVENT-SERVICE/claims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminJwt}`,
            },
            body: JSON.stringify(claim),
        });
        const response2 = await fetch('http://gateway-server:3004/EVENT-SERVICE/claims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminJwt}`,
            },
            body: JSON.stringify(claim),
        });
        const response3 = await fetch('http://gateway-server:3004/EVENT-SERVICE/claims/my', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminJwt}`,
            },
        });

        const data = await response3.json();
        const secondClaim = data[1];
        expect(secondClaim).toBeDefined();
        console.log('data.status', data.status);
        expect(secondClaim.status).toBe('REJECTED');
    });
});

async function createAdminUser() {
    const user = {
        username: 'maple-admin',
        password: '123456',
        email: 'maple@nexon.com',
        role: 'ADMIN',
    }
    await fetch('http://gateway-server:3004/AUTH-SERVICE/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return user;
}

async function getJwtTokenFrom(user) {
    const response = await fetch('http://gateway-server:3004/AUTH-SERVICE/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: user.username, password: user.password}),
    });
    // JSON으로 파싱
    //  {"accessToken":"eyJhbGciOiJJzdWIiOiI2ODI4"}
    const data = await response.json();

    return data.accessToken;
}

async function createCommonUser() {
    const user = {
        username: 'bisu',
        password: '123456',
        email: 'bisu@nexon.com',
        role: 'USER',
    }
    await fetch('http://gateway-server:3004/AUTH-SERVICE/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return user;
}

async function createEventFrom(jwt) {
    const event = {
        title: '여름 출석 이벤트',
        description: '이벤트 기간동안 출석 1일 이상하고 보상 받으세요!',
        startDate: "2025-05-15T00:00:00.000Z",
        endDate: "2025-06-15T00:00:00.000Z",
        status: 'ACTIVE',
        conditions: {
            type: 'CONTINUOUS_LOGIN',
            value: 1
        }
    }

    const response = await fetch('http://gateway-server:3004/EVENT-SERVICE/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(event),
    });
    const data = await response.json();
    return data._id;
}

async function createRewardFrom(adminJwt, eventId) {
    const reward = {
        eventId: eventId,
        name: "가입 축하 포인트",
        type: "POINT",
        amount: 1000,
        description: "신규 가입자를 위한 환영 포인트 보상",
    }

    const response = await fetch('http://gateway-server:3004/EVENT-SERVICE/rewards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminJwt}`,
        },
        body: JSON.stringify(reward),
    });
    const data = await response.json();
    return data._id;
}