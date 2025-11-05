import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Admin from './pages/Admin';
import RGPD from './pages/RGPD';

function App() {
    return (
        <BrowserRouter>
            <Header />
            <main style={{ minHeight: '80vh', paddingTop: '2rem' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/rgpd" element={<RGPD />} />
                </Routes>
            </main>
            <Footer />
        </BrowserRouter>
    );
}

export default App;