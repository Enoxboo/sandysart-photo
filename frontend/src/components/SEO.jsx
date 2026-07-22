import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

/**
 * Composant SEO pour gérer les balises meta de chaque page
 * @param {string} title - Titre de la page
 * @param {string} description - Description de la page
 * @param {string} image - URL de l'image Open Graph (optionnel)
 * @param {string} type - Type de contenu Open Graph (par défaut: website)
 */
function SEO({
                 title,
                 description,
                 image = '/about.webp',
                 type = 'website'
             }) {
    const location = useLocation();

    // Informations de base du site
    const siteInfo = {
        name: "Sandy's Art Photographies",
        url: import.meta.env.VITE_SITE_URL || '',
        locale: 'fr_FR',
        author: 'Sandy Limousin',
        phone: import.meta.env.VITE_CONTACT_PHONE_TEL || '',
        email: import.meta.env.VITE_CONTACT_EMAIL || '',
        address: {
            street: import.meta.env.VITE_CONTACT_ADDRESS || '',
            city: 'Le Vernet',
            region: 'Haute-Garonne',
            postalCode: '31810',
            country: 'France'
        }
    };

    // Titre complet (titre de la page + nom du site)
    const fullTitle = title
        ? `${title} | ${siteInfo.name}`
        : siteInfo.name;

    // URL complète de la page actuelle
    const currentUrl = `${siteInfo.url}${location.pathname}`;

    // URL complète de l'image Open Graph
    const fullImageUrl = image.startsWith('http')
        ? image
        : `${siteInfo.url}${image}`;

    useEffect(() => {
        // Mise à jour du titre de la page
        document.title = fullTitle;

        // Fonction pour mettre à jour ou créer une balise meta
        const updateMetaTag = (property, content, isProperty = true) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${property}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, property);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // === BALISES META STANDARDS ===
        updateMetaTag('description', description, false);
        updateMetaTag('keywords', 'photographe Le Vernet, photographe Haute-Garonne, photo grossesse, photo nouveau-né, photo famille, photographe mariage, photographe 31810, Sandy Limousin', false);
        updateMetaTag('author', siteInfo.author, false);

        // === OPEN GRAPH (Facebook, LinkedIn...) ===
        updateMetaTag('og:title', fullTitle);
        updateMetaTag('og:description', description);
        updateMetaTag('og:type', type);
        updateMetaTag('og:url', currentUrl);
        updateMetaTag('og:image', fullImageUrl);
        updateMetaTag('og:image:width', '1200');
        updateMetaTag('og:image:height', '630');
        updateMetaTag('og:site_name', siteInfo.name);
        updateMetaTag('og:locale', siteInfo.locale);

        // === TWITTER CARDS ===
        updateMetaTag('twitter:card', 'summary_large_image', false);
        updateMetaTag('twitter:title', fullTitle, false);
        updateMetaTag('twitter:description', description, false);
        updateMetaTag('twitter:image', fullImageUrl, false);

        // === BALISES SPÉCIFIQUES POUR LE SEO LOCAL ===
        updateMetaTag('geo.region', 'FR-31', false);
        updateMetaTag('geo.placename', 'Le Vernet', false);
        updateMetaTag('geo.position', '43.4027;1.4369', false);

        // === CANONICAL ===
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', currentUrl);

    }, [title, description, fullTitle, currentUrl, fullImageUrl, type, siteInfo.name, siteInfo.locale, siteInfo.author]);

    // Ce composant ne rend rien visuellement
    return null;
}

export default SEO;