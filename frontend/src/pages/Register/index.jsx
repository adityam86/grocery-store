import React from 'react';
import LoginPage from '../Login';

/**
 * RegisterPage
 * Renders the same LoginPage UI but defaults to the Sign Up tab.
 * All logic (form handling, dispatch, offline fallback) lives in LoginPage.
 */
const RegisterPage = () => <LoginPage defaultTab="register" />;

export default RegisterPage;
