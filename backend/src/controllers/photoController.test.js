process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_USERNAME = 'sandy';

import bcrypt from 'bcryptjs';

process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse-battery-staple', 10);

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {describe, it, expect, beforeAll} from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import app from '../../server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

// Uploads a small in-memory JPEG through the real upload pipeline, and
// deletes it via the API afterwards so tests don't leave files behind in
// the real uploads/ directory (multer's storage destination isn't
// configurable per-environment, unlike the DB).
async function withUploadedPhoto(agent, buffer, filename, fn) {
    const uploadRes = await agent
        .post('/api/photos/upload-multiple')
        .attach('photos', buffer, filename);

    try {
        await fn(uploadRes);
    } finally {
        const id = uploadRes.body?.success?.[0]?.id;
        if (id) {
            await agent.delete(`/api/photos/${id}`);
        }
    }
}

describe('POST /api/photos/upload-multiple', () => {
    let agent;
    let jpegBuffer;

    beforeAll(async () => {
        agent = request.agent(app);
        await agent
            .post('/api/auth/login')
            .send({username: 'sandy', password: 'correct-horse-battery-staple'});

        jpegBuffer = await sharp({
            create: {width: 20, height: 20, channels: 3, background: {r: 200, g: 50, b: 50}},
        }).jpeg().toBuffer();
    });

    it('rejects unauthenticated requests with 401', async () => {
        const res = await request(app)
            .post('/api/photos/upload-multiple')
            .attach('photos', jpegBuffer, 'test.jpg');
        expect(res.status).toBe(401);
    });

    it('rejects a non-image file', async () => {
        const res = await agent
            .post('/api/photos/upload-multiple')
            .attach('photos', Buffer.from('not an image'), 'notes.txt');
        // multer's fileFilter rejects before a file is ever processed
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('uploads a valid image, persists it, and generates responsive variants', async () => {
        await withUploadedPhoto(agent, jpegBuffer, 'test-photo.jpg', async (uploadRes) => {
            expect(uploadRes.status).toBe(201);
            expect(uploadRes.body.success).toHaveLength(1);
            expect(uploadRes.body.failed).toHaveLength(0);

            const {id, filename} = uploadRes.body.success[0];

            const getRes = await agent.get(`/api/photos/${id}`);
            expect(getRes.status).toBe(200);
            expect(getRes.body.filename).toBe(filename);
            expect(getRes.body.has_variants).toBe(1);

            expect(fs.existsSync(path.join(uploadsDir, filename))).toBe(true);
            const base = filename.replace(/\.[^.]+$/, '');
            for (const width of [400, 800, 1600]) {
                expect(fs.existsSync(path.join(uploadsDir, `${base}-${width}w.webp`))).toBe(true);
            }
        });
    });

    it('deleting a photo removes its main file and variants from disk', async () => {
        const uploadRes = await agent
            .post('/api/photos/upload-multiple')
            .attach('photos', jpegBuffer, 'to-delete.jpg');

        const {id, filename} = uploadRes.body.success[0];
        const base = filename.replace(/\.[^.]+$/, '');
        const variantPaths = [400, 800, 1600].map((w) => path.join(uploadsDir, `${base}-${w}w.webp`));

        expect(fs.existsSync(path.join(uploadsDir, filename))).toBe(true);

        const deleteRes = await agent.delete(`/api/photos/${id}`);
        expect(deleteRes.status).toBe(200);

        expect(fs.existsSync(path.join(uploadsDir, filename))).toBe(false);
        variantPaths.forEach((p) => expect(fs.existsSync(p)).toBe(false));
    });
});
