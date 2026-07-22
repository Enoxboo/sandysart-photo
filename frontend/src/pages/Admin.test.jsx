import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Admin from './Admin.jsx';
import * as api from '../services/api.js';

vi.mock('../services/api.js');

const emptyPhotosPage = {photos: [], pagination: {page: 1, limit: 1000, total: 0, totalPages: 1}};

beforeEach(() => {
    vi.resetAllMocks();
    api.getAllPhotos.mockResolvedValue(emptyPhotosPage);
});

describe('Admin login/logout flow', () => {
    it('shows the login form when there is no active session', async () => {
        api.verifyToken.mockRejectedValue(new Error('no session'));

        render(<Admin />);

        expect(await screen.findByRole('heading', {name: 'Admin'})).toBeInTheDocument();
        expect(screen.getByLabelText('Identifiant')).toBeInTheDocument();
    });

    it('shows the dashboard directly when a session cookie is already valid', async () => {
        api.verifyToken.mockResolvedValue({valid: true, username: 'sandy'});

        render(<Admin />);

        expect(await screen.findByRole('heading', {name: 'Dashboard'})).toBeInTheDocument();
        expect(api.getAllPhotos).toHaveBeenCalled();
    });

    it('logs in successfully and reveals the dashboard', async () => {
        const user = userEvent.setup();
        api.verifyToken.mockRejectedValue(new Error('no session'));
        api.login.mockResolvedValue({message: 'Login successful', username: 'sandy'});

        render(<Admin />);

        await screen.findByRole('heading', {name: 'Admin'});
        await user.type(screen.getByLabelText('Identifiant'), 'sandy');
        await user.type(screen.getByLabelText('Mot de passe'), 'correct-horse-battery-staple');
        await user.click(screen.getByRole('button', {name: 'Se connecter'}));

        expect(await screen.findByRole('heading', {name: 'Dashboard'})).toBeInTheDocument();
        expect(api.login).toHaveBeenCalledWith('sandy', 'correct-horse-battery-staple');
    });

    it('shows an error and stays on the login form on wrong credentials', async () => {
        const user = userEvent.setup();
        api.verifyToken.mockRejectedValue(new Error('no session'));
        api.login.mockRejectedValue(new Error('Invalid credentials'));

        render(<Admin />);

        await screen.findByRole('heading', {name: 'Admin'});
        await user.type(screen.getByLabelText('Identifiant'), 'sandy');
        await user.type(screen.getByLabelText('Mot de passe'), 'wrong-password');
        await user.click(screen.getByRole('button', {name: 'Se connecter'}));

        expect(await screen.findByText('Identifiants incorrects')).toBeInTheDocument();
        expect(screen.getByRole('heading', {name: 'Admin'})).toBeInTheDocument();
    });

    it('logs out and returns to the login form', async () => {
        const user = userEvent.setup();
        api.verifyToken.mockResolvedValue({valid: true, username: 'sandy'});
        api.logout.mockResolvedValue({ok: true});

        render(<Admin />);

        await screen.findByRole('heading', {name: 'Dashboard'});
        await user.click(screen.getByRole('button', {name: 'Déconnexion'}));

        await waitFor(() => expect(api.logout).toHaveBeenCalled());
        expect(await screen.findByRole('heading', {name: 'Admin'})).toBeInTheDocument();
    });
});
