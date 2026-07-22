process.env.JWT_SECRET = 'test-jwt-secret';

import {describe, it, expect, vi} from 'vitest';
import jwt from 'jsonwebtoken';
import {verifyToken, generateToken} from './auth.js';

function mockRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('generateToken', () => {
    it('signs a JWT containing the username, verifiable with the same secret', () => {
        const token = generateToken('sandy');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.username).toBe('sandy');
    });

    it('sets a 24h expiry', () => {
        const token = generateToken('sandy');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60);
    });
});

describe('verifyToken', () => {
    it('rejects with 401 when no cookie is present', () => {
        const req = {cookies: {}};
        const res = mockRes();
        const next = vi.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects with 401 when req.cookies is undefined', () => {
        const req = {};
        const res = mockRes();
        const next = vi.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects with 403 on an invalid token', () => {
        const req = {cookies: {token: 'not-a-real-token'}};
        const res = mockRes();
        const next = vi.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects with 403 on an expired token', () => {
        const expired = jwt.sign({username: 'sandy'}, process.env.JWT_SECRET, {expiresIn: -10});
        const req = {cookies: {token: expired}};
        const res = mockRes();
        const next = vi.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('calls next() and attaches req.user on a valid token', () => {
        const token = generateToken('sandy');
        const req = {cookies: {token}};
        const res = mockRes();
        const next = vi.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user.username).toBe('sandy');
        expect(res.status).not.toHaveBeenCalled();
    });
});
