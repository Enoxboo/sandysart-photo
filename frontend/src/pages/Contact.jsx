import { useState } from 'react';
import './Contact.css';
import SEO from '../components/SEO';
import { getPhone, getPhoneTel } from '../utils/contact';
import { sendContactMessage } from '../services/api';

const SESSION_TYPES = [
    { value: '', label: 'Type de séance' },
    { value: 'grossesse', label: 'Grossesse' },
    { value: 'nouveau-ne', label: 'Nouveau-né' },
    { value: 'famille', label: 'Famille' },
    { value: 'mariage', label: 'Mariage' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'autre', label: 'Autre' },
];

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', sessionType: '', message: '' });
    const [status, setStatus] = useState(null); // 'sending' | 'success' | 'error'

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await sendContactMessage(form);
            setStatus('success');
            setForm({ name: '', email: '', phone: '', sessionType: '', message: '' });
        } catch {
            setStatus('error');
        }
    };

    return (
        <>
            <SEO
                title="Contact"
                description="Contactez Sandy Limousin, photographe professionnelle au Vernet. Disponible par téléphone ou via le formulaire de contact pour réserver votre séance photo."
            />

            {/* Hero */}
            <section className="contact-hero">
                <div className="contact-hero-content">
                    <h1>Contactez-moi</h1>
                    <p className="contact-hero-subtitle">
                        Envie de capturer vos moments précieux ?
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="contact-content">
                <div className="container">

                    {/* Intro */}
                    <div className="contact-intro fade-in">
                        <p>
                            Je serais ravie d'échanger avec vous sur votre projet photo.
                            Que ce soit pour une séance famille, grossesse, nouveau-né ou mariage,
                            n'hésitez pas à me contacter pour discuter de vos envies.
                        </p>
                    </div>

                    {/* Carte de contact principale */}
                    <div className="contact-card fade-in">
                        <div className="contact-card-icon" aria-hidden="true">📞</div>
                        <h2>Appelez-moi directement</h2>
                        <p className="contact-card-subtitle">
                            Pour réserver votre séance ou obtenir un devis personnalisé
                        </p>

                        <a href={`tel:${getPhoneTel()}`} className="contact-phone-link">
                            {getPhone()}
                        </a>

                        <div className="contact-card-info">
                            <p>
                                <strong>Disponible :</strong><br />
                                Lundi - Samedi : 9h - 19h
                            </p>
                            <p className="contact-card-note">
                                Je privilégie les échanges téléphoniques pour mieux comprendre
                                vos attentes et vous proposer une prestation sur mesure.
                            </p>
                        </div>
                    </div>

                    {/* Formulaire de contact */}
                    <div className="contact-form-wrapper fade-in">
                        <h2>Envoyez-moi un message</h2>
                        <p className="contact-form-subtitle">
                            Préférez l'écrit ? Remplissez ce formulaire et je vous réponds sous 24h.
                        </p>

                        {status === 'success' ? (
                            <div className="contact-form-success">
                                <span aria-hidden="true">✅</span>
                                <p>Message envoyé ! Je vous répondrai dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form" noValidate>
                                <div className="contact-form-row">
                                    <div className="form-field">
                                        <label htmlFor="contact-name">Nom et prénom *</label>
                                        <input
                                            id="contact-name"
                                            name="name"
                                            type="text"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            autoComplete="name"
                                            disabled={status === 'sending'}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="contact-email">Adresse e-mail *</label>
                                        <input
                                            id="contact-email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            autoComplete="email"
                                            disabled={status === 'sending'}
                                        />
                                    </div>
                                </div>

                                <div className="contact-form-row">
                                    <div className="form-field">
                                        <label htmlFor="contact-phone">Téléphone (optionnel)</label>
                                        <input
                                            id="contact-phone"
                                            name="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={handleChange}
                                            autoComplete="tel"
                                            disabled={status === 'sending'}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="contact-session">Type de séance</label>
                                        <select
                                            id="contact-session"
                                            name="sessionType"
                                            value={form.sessionType}
                                            onChange={handleChange}
                                            disabled={status === 'sending'}
                                        >
                                            {SESSION_TYPES.map(({ value, label }) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-message">Message *</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Parlez-moi de votre projet, de la date souhaitée, du lieu..."
                                        disabled={status === 'sending'}
                                    />
                                </div>

                                {status === 'error' && (
                                    <p className="contact-form-error">
                                        Une erreur s'est produite. Veuillez réessayer ou m'appeler directement.
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="btn contact-form-submit"
                                    disabled={status === 'sending'}
                                >
                                    {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Infos complémentaires */}
                    <div className="contact-grid fade-in">
                        <div className="contact-info-card">
                            <div className="contact-info-icon" aria-hidden="true">📍</div>
                            <h3>Localisation</h3>
                            <p>Le Vernet</p>
                            <p>Haute-Garonne (31810)</p>
                            <p className="contact-info-detail">
                                Je me déplace dans toute la région
                            </p>
                        </div>

                        <div className="contact-info-card">
                            <div className="contact-info-icon" aria-hidden="true">⏰</div>
                            <h3>Délai de réponse</h3>
                            <p>Réponse rapide</p>
                            <p>généralement sous 24h</p>
                            <p className="contact-info-detail">
                                Les week-ends peuvent être plus longs
                            </p>
                        </div>

                        <div className="contact-info-card">
                            <div className="contact-info-icon" aria-hidden="true">💼</div>
                            <h3>Prestations</h3>
                            <p>Famille • Grossesse</p>
                            <p>Nouveau-né • Mariage</p>
                            <p className="contact-info-detail">
                                Tarifs personnalisés selon vos besoins
                            </p>
                        </div>
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="contact-social fade-in">
                        <h3>Retrouvez-moi sur les réseaux</h3>
                        <div className="contact-social-links">
                            <a
                                href="https://www.instagram.com/sandysartphotographies/"
                                className="contact-social-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Suivre Sandy sur Instagram"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                Instagram
                            </a>
                            <a
                                href="https://www.facebook.com/Sandysartphotographies/"
                                className="contact-social-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Suivre Sandy sur Facebook"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </a>
                        </div>
                    </div>

                    {/* CTA vers portfolio */}
                    <div className="contact-cta fade-in">
                        <h3>Pas encore convaincu ?</h3>
                        <p>Découvrez mon travail avant de me contacter</p>
                        <a href="/gallery" className="btn">
                            Voir le portfolio
                        </a>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Contact;
