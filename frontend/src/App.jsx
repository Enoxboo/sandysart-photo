import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Admin from './pages/Admin';
import RGPD from './pages/RGPD';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
    return (
        <BrowserRouter>
            <a href="#main-content" className="skip-link">Aller au contenu principal</a>
            <Header/>
            <main id="main-content">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/gallery" element={<Gallery/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/admin" element={<Admin/>}/>
                    <Route path="/rgpd" element={<RGPD/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </main>
            <Footer/>
        </BrowserRouter>
    );
}

export default App;