import './Contact.css';
import SEO from '../components/SEO';

function Contact() {
    return (
        <>
            <SEO
                title="Contact"
                description="Contactez Sandy Limousin, photographe professionnelle au Vernet. Disponible par téléphone pour réserver votre séance photo."
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
                        <div className="contact-card-icon">📞</div>
                        <h2>Appelez-moi directement</h2>
                        <p className="contact-card-subtitle">
                            Pour réserver votre séance ou obtenir un devis personnalisé
                        </p>

                        <a href="tel:+33684902214" className="contact-phone-link">
                            06 84 90 22 14
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

                    {/* Infos complémentaires */}
                    <div className="contact-grid fade-in">
                        <div className="contact-info-card">
                            <div className="contact-info-icon">📍</div>
                            <h3>Localisation</h3>
                            <p>Le Vernet</p>
                            <p>Haute-Garonne (31810)</p>
                            <p className="contact-info-detail">
                                Je me déplace dans toute la région
                            </p>
                        </div>

                        <div className="contact-info-card">
                            <div className="contact-info-icon">⏰</div>
                            <h3>Délai de réponse</h3>
                            <p>Réponse rapide</p>
                            <p>généralement sous 24h</p>
                            <p className="contact-info-detail">
                                Les week-ends peuvent être plus longs
                            </p>
                        </div>

                        <div className="contact-info-card">
                            <div className="contact-info-icon">💼</div>
                            <h3>Prestations</h3>
                            <p>Famille • Grossesse</p>
                            <p>Nouveau-né • Mariage</p>
                            <p className="contact-info-detail">
                                Tarifs personnalisés selon vos besoins
                            </p>
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