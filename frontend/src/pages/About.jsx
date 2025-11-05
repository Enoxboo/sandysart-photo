import './About.css';

function About() {
    return (
        <div className="container">
            <section className="about-header">
                <h1>À propos de Sandy's Art Photography</h1>
            </section>

            <section className="about-content">
                <div className="about-text">
                    <h2>Notre histoire</h2>
                    <p>
                        Passionnée par la photographie depuis mon plus jeune âge, j'ai transformé
                        cette passion en métier il y a plusieurs années. Mon objectif est simple :
                        capturer vos moments précieux avec authenticité et émotion.
                    </p>
                    <p>
                        Chaque séance photo est unique, pensée et préparée avec soin pour refléter
                        votre personnalité et vos souhaits. Que ce soit pour immortaliser l'attente
                        d'un heureux événement, célébrer l'amour d'une famille ou capturer la magie
                        d'un mariage, je mets tout mon cœur dans chaque cliché.
                    </p>

                    <h2>Ma philosophie</h2>
                    <p>
                        Je crois fermement que les meilleures photos sont celles prises dans la
                        spontanéité et la joie. Mon approche se veut naturelle et bienveillante,
                        créant une atmosphère détendue où vous pouvez être vous-même.
                    </p>
                    <p>
                        Chaque instant est précieux, chaque sourire est unique. Mon rôle est de
                        les préserver pour que vous puissiez les revivre encore et encore.
                    </p>

                    <h2>Mes spécialités</h2>
                    <ul className="specialties">
                        <li>
                            <strong>📸 Photographie de grossesse</strong>
                            <p>Célébrez l'attente avec des photos pleines de douceur et d'émotion</p>
                        </li>
                        <li>
                            <strong>👶 Nouveau-nés</strong>
                            <p>Capturez les premiers jours de votre bébé avec des clichés tendres</p>
                        </li>
                        <li>
                            <strong>👨‍👩‍👧‍👦 Famille</strong>
                            <p>Des séances conviviales pour immortaliser votre bonheur familial</p>
                        </li>
                        <li>
                            <strong>💍 Mariage</strong>
                            <p>Racontez l'histoire de votre plus beau jour en images</p>
                        </li>
                        <li>
                            <strong>🎂 Événements</strong>
                            <p>Anniversaires, baptêmes, et tous vos moments spéciaux</p>
                        </li>
                    </ul>

                    <h2>Contact</h2>
                    <p>
                        Envie de réserver une séance ou simplement discuter de votre projet ?
                        N'hésitez pas à me contacter !
                    </p>
                    <div className="contact-info">
                        <p>📧 Email : <a href="mailto:contact@sandysart-photo.fr">contact@sandysart-photo.fr</a></p>
                        <p>📱 Téléphone : <a href="tel:+33123456789">01 23 45 67 89</a></p>
                        <p>📍 Basée à Toulouse et ses alentours</p>
                    </div>
                </div>

                {/* Optionnel : Tu pourras ajouter une photo de Sandy ici plus tard */}
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