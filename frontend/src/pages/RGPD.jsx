import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './RGPD.css';
import SEO from "../components/SEO.jsx";

function RGPD() {
    const location = useLocation();

    // Scroll vers la section si hash présent dans l'URL
    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <div className="rgpd-page">
            <SEO
                title="RGPD"
                description="Politique de confidentialité et RGPD - Sandy's Art Photographies. Protection de vos données personnelles."
            />
            {/* Hero */}
            <section className="rgpd-hero">
                <h1>RGPD & Confidentialité</h1>
                <p>Transparence et protection de vos données personnelles</p>
            </section>

            {/* Contenu */}
            <div className="rgpd-content">
                <div className="container">

                    {/* Introduction */}
                    <section className="rgpd-section fade-in">
                        <p className="rgpd-intro">
                            Cette politique de confidentialité a pour objectif de vous informer sur mes politiques
                            et pratiques concernant la collecte, l'utilisation et la divulgation de toute information
                            que vous soumettez via mon site internet.
                        </p>
                    </section>

                    {/* Responsabilité */}
                    <section className="rgpd-section fade-in">
                        <h2>Responsabilité pour le traitement des données</h2>
                        <p>
                            SANDY'S ART PHOTOGRAPHIES représenté par Sandy LIMOUSIN est responsable du traitement
                            de vos données collectées sur son site Internet{' '}
                            <a href="https://www.sandysartphotographies.com">www.sandysartphotographies.com</a>{' '}
                            (formulaire de contact, etc.).
                        </p>
                    </section>

                    {/* Finalités */}
                    <section className="rgpd-section fade-in">
                        <h2>Finalités des données</h2>
                        <p>
                            Les données que vous me communiquez ne seront utilisées que pour la bonne gestion
                            de notre relation client-prestataire (organisation de votre séance, remise de devis,
                            facture, etc.). Elles ne sont enregistrées que dans ce but.
                        </p>
                        <p>
                            Je collecte également les informations que vous me fournissez dans vos emails ou de
                            vive voix. Ces informations sont collectées pour m'aider à fournir un service de qualité
                            selon vos attentes.
                        </p>
                    </section>

                    {/* Formulaire de contact */}
                    <section className="rgpd-section fade-in">
                        <h2>Formulaire de contact</h2>
                        <p>
                            Lorsque vous soumettez une demande de contact depuis mon site internet, je collecte vos
                            données telles que votre nom et prénom, votre adresse e-mail, votre numéro de téléphone
                            et les informations précisées dans le message. Vous n'êtes nullement obligé de répondre
                            à toutes les questions si vous souhaitez éviter de fournir certaines informations.
                        </p>
                        <p>
                            SANDY'S ART PHOTOGRAPHIES représenté par Sandy LIMOUSIN ne vend pas, ne loue pas et ne
                            partage pas vos informations avec des tiers. Aucune information que vous transmettez ne
                            sera divulguée.
                        </p>
                    </section>

                    {/* Droits */}
                    <section className="rgpd-section fade-in">
                        <h2>Droit d'Accès et réclamation</h2>
                        <p>
                            En tant que détenteur des données, vous avez le droit d'accéder, de mettre à jour, de
                            corriger des données inexactes ou de demander la suppression des données. Vous avez aussi
                            le droit de faire une réclamation concernant toute question relative au traitement de ces
                            données.
                        </p>
                        <p>
                            Vous pouvez exercer ces droits en envoyant un mail à{' '}
                            <a href="mailto:sandysartphotographies@hotmail.com">sandysartphotographies@hotmail.com</a>{' '}
                            ou par téléphone au <a href="tel:+33684902214">06 84 90 22 14</a>.
                        </p>
                    </section>

                    {/* Sécurité */}
                    <section className="rgpd-section fade-in">
                        <h2>Sécurité de vos données</h2>
                        <p>
                            SANDY'S ART PHOTOGRAPHIES représenté par Sandy LIMOUSIN s'engage à prendre toutes les
                            mesures en son pouvoir pour protéger les données mises à sa disposition par ses clients.
                            Il s'agit d'une plateforme professionnelle et sécurisée.
                        </p>
                    </section>

                    {/* Conservation */}
                    <section className="rgpd-section fade-in">
                        <h2>Durée de conservation de vos données</h2>
                        <p>
                            Je conserve vos informations aussi longtemps que nécessaire pour fournir les services que
                            vous avez demandé ou pour d'autres raisons essentielles telles que le respect des obligations
                            légales, la résolution des litiges et l'application de mes politiques.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section className="rgpd-section fade-in">
                        <h2>Statistiques et mesures d'audience</h2>
                        <p>
                            Des cookies enregistrent votre navigation à des fins statistiques. Ils me permettent par
                            exemple de mesurer la fréquentation de mon site et d'analyser votre parcours sur celui-ci
                            avant de vous offrir une meilleure expérience.
                        </p>
                    </section>

                    {/* Mentions légales */}
                    <section className="rgpd-section fade-in" id="mentions">
                        <h2>Mentions légales</h2>
                        <div className="mentions-grid">
                            <div className="mention-item">
                                <h3>Éditeur du site</h3>
                                <p>Sandy's Art Photographies</p>
                                <p>Représenté par Sandy LIMOUSIN</p>
                                <p>Vernet, France</p>
                            </div>
                            <div className="mention-item">
                                <h3>Contact</h3>
                                <p>Email : sandysartphotographies@hotmail.com</p>
                                <p>Téléphone : 06 84 90 22 14</p>
                            </div>
                            <div className="mention-item">
                                <h3>Hébergement</h3>
                                <p>Ce site est hébergé sur un serveur privé</p>
                                <p>Localisation : France</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact rapide */}
                    <section className="rgpd-contact fade-in">
                        <h3>Une question concernant vos données ?</h3>
                        <p>N'hésitez pas à me contacter pour toute demande relative à vos données personnelles.</p>
                        <a href="mailto:sandysartphotographies@hotmail.com" className="btn">
                            Me contacter
                        </a>
                    </section>

                </div>
            </div>
        </div>
    );
}

export default RGPD;