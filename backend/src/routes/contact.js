/**
 * @fileoverview Contact form route — sends an email via nodemailer
 * @requires nodemailer
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const {AppError} = require('../middleware/errorHandler');

/**
 * Wrapper pour gérer les erreurs async
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Limite dédiée : un formulaire de contact public est une cible classique de
// spam. 5 envois / 15 min / IP est largement suffisant pour un usage légitime.
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {error: 'Trop de messages envoyés. Réessayez dans quelques minutes.'},
    standardHeaders: true,
    legacyHeaders: false,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let cachedTransporter = null;

/**
 * Lazily builds (and caches) the nodemailer transporter from env vars.
 * Lazy so the app can still boot without CONTACT_EMAIL_PASSWORD configured
 * in environments that don't need the contact form (e.g. tests).
 */
function getTransporter() {
    if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: process.env.CONTACT_EMAIL,
                pass: process.env.CONTACT_EMAIL_PASSWORD,
            },
        });
    }
    return cachedTransporter;
}

router.post('/', contactLimiter, asyncHandler(async (req, res) => {
    const {name, email, phone, sessionType, message} = req.body;

    if (!name || !email || !message) {
        throw new AppError('Champs requis manquants', 400, 'MISSING_FIELDS');
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new AppError('Adresse e-mail invalide', 400, 'INVALID_EMAIL');
    }

    if (!process.env.CONTACT_EMAIL || !process.env.CONTACT_EMAIL_PASSWORD) {
        throw new AppError(
            "L'envoi de messages n'est pas configuré sur le serveur",
            503,
            'CONTACT_NOT_CONFIGURED'
        );
    }

    await getTransporter().sendMail({
        from: process.env.CONTACT_EMAIL,
        to: process.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `Demande de séance – ${sessionType || 'Non précisé'} – ${name}`,
        text: `Nom : ${name}\nEmail : ${email}\nTéléphone : ${phone || '—'}\nType : ${sessionType || '—'}\n\n${message}`,
    });

    res.json({ok: true});
}));

module.exports = router;
