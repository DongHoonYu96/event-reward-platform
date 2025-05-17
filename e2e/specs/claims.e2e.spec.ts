describe('Claims', () => {
    beforeAll(async () => {
        const user = {
            username: 'bisu',
            password: '123456',
            email : 'bisu@nexon.com',
            role: 'ADMIN',
        }
        await fetch('http://gateway-server:3004/AUTH-SERVICE/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        const response = await fetch('http://gateway-server:3004/AUTH-SERVICE/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username, password: user.password }),
        });

        const jwt = await response.text();
        console.log(jwt);
    });

    test('Create', () => {
        expect(true).toBe(true);
    })
});