import './About.css';

function About() {
    return (
        <div className="container">
            <section className="about-header">
                <h1>À propos de Sandy's Art Photography</h1>
            </section>

            <section className="about-content">
                <div className="about-text">
                    <h2>Qui suis-je ?</h2>
                    <p>
                        Je suis Sandy, photographe passionnée depuis 20 ans.
                        Originaire de Marcq-en-Barœul, dans le Nord de la France et maman de trois enfants,
                        je capture vos plus beaux instants avec sensibilité et authenticité.
                    </p>
                    <p>
                        Mon univers varie entre douceur, élégance et caractère, s'adaptant à chaque histoire.
                        Chaque image que je crée est le reflet de votre singularité, portée par mon expérience
                        et mon regard affûté.
                    </p>
                    <p>
                        Ensemble, donnons vie à vos souvenirs.
                    </p>

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
                    <p>
                        Et si la photographie a marqué ma vie, c'est pour mieux raconter la vôtre…
                    </p>
                    <p style={{ fontStyle: 'italic', marginTop: '1.5rem' }}>
                        "Un regard sensible, une touche d'âme d'artiste, une grande dose d'émotion et une infinie
                        patience… Je suis une passionnée qui a transformé son rêve en réalité, et chaque jour, je le
                        vis avec le cœur."
                    </p>

                    <h2>Un peu de moi…</h2>
                    <p>
                        Mon équilibre, je le trouve avant tout auprès de mes trois enfants. Chacun d'eux a son propre
                        univers, ses envies et sa façon de voir la vie. Avec cinq ans d'écart entre eux, ils me rappellent
                        chaque jour combien chaque instant est unique.
                    </p>
                    <p>
                        J'aime les choses simples, celles qui réchauffent le cœur et donnent du sens à la vie.
                        Je ressens profondément les émotions des autres, et voir quelqu'un de triste me touche toujours.
                        J'aimerais pouvoir aider tout le monde… À l'inverse, je n'ai aucune tolérance pour la méchanceté
                        gratuite et l'égoïsme.
                    </p>
                    <p>
                        Je suis quelqu'un qui donne sans compter, toujours prête à aider, à soutenir, à être là.
                        Mais parfois, souvent même, je suis déçue… car les retours se font rares. Pourtant, ça ne
                        m'empêche pas d'aimer écouter, comprendre et partager.
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

                    <h2>Contact</h2>
                    <p>
                        Envie de réserver une séance ou simplement discuter de votre projet ?
                        N'hésitez pas à me contacter !
                    </p>
                    <div className="contact-info">
                        <p>📧 Email : <a href="mailto:sandysartphotographies@hotmail.com">sandysartphotographies@hotmail.com</a></p>
                        <p>📱 Téléphone : <a href="tel:+33684902214">06 84 90 22 14</a></p>
                        <p>📍 Basée à Vernet</p>
                    </div>
                </div>

                <div className="about-image">
                    <div className="placeholder-image">
                        <p>📷</p>
                        <p>Photo de Sandy</p>
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            (À ajouter plus tard)
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;
