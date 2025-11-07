import './About.css';

function About() {
    return (
        <>
            {/* Hero */}
            <section className="about-hero">
                <h1>À Propos</h1>
            </section>

            {/* Main Content */}
            <div className="about-content">
                <div className="container">

                    {/* Grid 2 colonnes : Image + Texte */}
                    <div className="about-grid fade-in">

                        {/* Image de Sandy (placeholder pour l'instant) */}
                        <div className="about-image-section">
                            <div className="about-image-wrapper">
                                <div className="about-image-placeholder">
                                    <span className="about-image-placeholder-icon">📷</span>
                                    <p>Photo de Sandy</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
                                        (À ajouter plus tard)
                                    </p>
                                </div>
                                {/* Quand tu auras la photo, remplace par :
                <img src="/path/to/sandy.jpg" alt="Sandy, photographe" />
                */}
                            </div>
                        </div>

                        {/* Contenu texte */}
                        <div className="about-text-section">

                            {/* Intro forte */}
                            <div className="about-intro">
                                Je suis Sandy, photographe passionnée depuis 20 ans. Originaire de Marcq-en-Barœul,
                                dans le Nord de la France et maman de trois enfants, je capture vos plus beaux instants
                                avec sensibilité et authenticité.
                            </div>

                            {/* Qui suis-je */}
                            <section className="about-section">
                                <h2>Qui suis-je ?</h2>
                                <p>
                                    Mon univers varie entre douceur, élégance et caractère, s'adaptant à chaque histoire.
                                    Chaque image que je crée est le reflet de votre singularité, portée par mon expérience
                                    et mon regard affûté.
                                </p>
                                <p>
                                    Ensemble, donnons vie à vos souvenirs.
                                </p>
                            </section>

                            {/* Pourquoi photographe */}
                            <section className="about-section">
                                <h2>Pourquoi je suis devenue photographe ?</h2>
                                <h3>Le jour où la photographie est devenue une évidence…</h3>
                                <p>
                                    J'ai toujours eu ce besoin de liberté, d'exprimer ma créativité et surtout, de donner
                                    du sens à ce que je fais. La photographie s'est imposée à moi comme un moyen de capturer
                                    l'instant, de figer les émotions et de raconter des histoires uniques.
                                </p>
                                <p>
                                    Plus qu'un métier, c'est une passion qui me permet de rencontrer des personnes formidables
                                    et de partager avec elles des moments intenses et précieux. Ce que j'aime le plus ?
                                    Voir briller une étincelle dans vos yeux en découvrant vos images, savoir que ces souvenirs
                                    resteront gravés pour vous et vos proches.
                                </p>
                                <p>
                                    C'est un échange, une relation de confiance, un instant suspendu où tout prend son sens.
                                    Chaque séance est une nouvelle aventure, une parenthèse où les rires, la tendresse et les
                                    émotions prennent toute leur place.
                                </p>
                                <p className="about-quote">
                                    "Un regard sensible, une touche d'âme d'artiste, une grande dose d'émotion et une infinie
                                    patience… Je suis une passionnée qui a transformé son rêve en réalité, et chaque jour, je le
                                    vis avec le cœur."
                                </p>
                            </section>

                            {/* Spécialités */}
                            <section className="about-section">
                                <h2>Mes spécialités</h2>
                                <ul className="specialties-list">
                                    <li className="specialty-item">
                                        <h4>
                                            <span className="specialty-icon">🤰</span>
                                            Photographie de grossesse
                                        </h4>
                                        <p>Célébrez l'attente avec des photos pleines de douceur et d'émotion</p>
                                    </li>
                                    <li className="specialty-item">
                                        <h4>
                                            <span className="specialty-icon">👶</span>
                                            Nouveau-nés
                                        </h4>
                                        <p>Capturez les premiers jours de votre bébé avec des clichés tendres et intemporels</p>
                                    </li>
                                    <li className="specialty-item">
                                        <h4>
                                            <span className="specialty-icon">👨‍👩‍👧‍👦</span>
                                            Famille
                                        </h4>
                                        <p>Des séances conviviales pour immortaliser votre bonheur familial</p>
                                    </li>
                                    <li className="specialty-item">
                                        <h4>
                                            <span className="specialty-icon">💍</span>
                                            Mariage
                                        </h4>
                                        <p>Racontez l'histoire de votre plus beau jour en images</p>
                                    </li>
                                    <li className="specialty-item">
                                        <h4>
                                            <span className="specialty-icon">👤</span>
                                            Portraits
                                        </h4>
                                        <p>Des portraits qui capturent votre essence et votre personnalité unique</p>
                                    </li>
                                </ul>
                            </section>

                            {/* Un peu de moi */}
                            <section className="about-section">
                                <h2>Un peu de moi…</h2>
                                <p>
                                    Mon équilibre, je le trouve avant tout auprès de mes trois enfants. Chacun d'eux a son propre
                                    univers, ses envies et sa façon de voir la vie. Avec cinq ans d'écart entre eux, ils me rappellent
                                    chaque jour combien chaque instant est unique.
                                </p>
                                <p>
                                    J'aime les choses simples, celles qui réchauffent le cœur et donnent du sens à la vie.
                                    Je ressens profondément les émotions des autres, et voir quelqu'un de triste me touche toujours.
                                </p>
                                <p>
                                    Et puis, il y a ces petites choses qui font partie de moi : j'adoooore voyager, la sensation
                                    de liberté sur une moto, et les plaisirs de la table !
                                </p>
                                <p>
                                    M'engager pour les autres a toujours été une évidence. Je suis devenue présidente de
                                    l'association GIEL (Groupement Indépendant d'Entrepreneurs Local), avec la volonté d'accompagner
                                    et de soutenir ceux qui, comme moi, ont choisi de tracer leur propre chemin.
                                </p>
                            </section>

                        </div>
                    </div>

                    {/* Section Contact */}
                    <section className="contact-section fade-in">
                        <h2>Travaillons ensemble</h2>
                        <p>
                            Envie de réserver une séance ou simplement discuter de votre projet ?
                            N'hésitez pas à me contacter !
                        </p>
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="contact-icon">📧</span>
                                <a href="mailto:sandysartphotographies@hotmail.com">
                                    sandysartphotographies@hotmail.com
                                </a>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📱</span>
                                <a href="tel:+33684902214">06 84 90 22 14</a>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span>Basée à Vernet</span>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}

export default About;