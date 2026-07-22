process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_USERNAME = 'sandy';

import bcrypt from 'bcryptjs';

process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse-battery-staple', 10);

import {describe, it, expect} from 'vitest';
import request from 'supertest';
import app from '../../server.js';

describe('POST /api/auth/login', () => {
    it('rejects missing credentials with 400', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).toBe(400);
    });

    it('rejects an unknown username with 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({username: 'not-sandy', password: 'correct-horse-battery-staple'});
        expect(res.status).toBe(401);
    });

    it('rejects the wrong password with 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({username: 'sandy', password: 'wrong-password'});
        expect(res.status).toBe(401);
    });

    it('logs in with correct credentials and sets an httpOnly cookie', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({username: 'sandy', password: 'correct-horse-battery-staple'});

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('sandy');
        expect(res.body.token).toBeUndefined();

        const setCookie = res.headers['set-cookie'];
        expect(setCookie).toBeDefined();
        expect(setCookie[0]).toMatch(/^token=/);
        expect(setCookie[0]).toMatch(/HttpOnly/);
    });
});

describe('GET /api/auth/verify', () => {
    it('rejects when no session cookie is sent', async () => {
        const res = await request(app).get('/api/auth/verify');
        expect(res.status).toBe(401);
    });

    it('succeeds with a cookie obtained from login', async () => {
        const agent = request.agent(app);
        await agent
            .post('/api/auth/login')
            .send({username: 'sandy', password: 'correct-horse-battery-staple'});

        const res = await agent.get('/api/auth/verify');
        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(true);
        expect(res.body.username).toBe('sandy');
    });
});

describe('POST /api/auth/logout', () => {
    it('clears the session cookie so a subsequent verify fails', async () => {
        const agent = request.agent(app);
        await agent
            .post('/api/auth/login')
            .send({username: 'sandy', password: 'correct-horse-battery-staple'});

        const logoutRes = await agent.post('/api/auth/logout');
        expect(logoutRes.status).toBe(200);

        const verifyRes = await agent.get('/api/auth/verify');
        expect(verifyRes.status).toBe(401);
    });
});
