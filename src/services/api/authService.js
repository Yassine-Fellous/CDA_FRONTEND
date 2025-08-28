const API_BASE_URL = import.meta.env.VITE_API_URL;

// Mode de test - désactivé pour utiliser l'API réelle
let MOCK_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true';

class AuthService {
  async mockDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Login avec:', credentials);
      await this.mockDelay(1500);
      
      if (credentials.email === 'error@test.com') {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      return {
        token: 'mock_token_123',
        user: {
          id: 1,
          email: credentials.email,
          verified: true
        }
      };
    }

    // Appel API réel
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          throw new Error('Compte non validé. Vérifiez votre email.');
        } else if (response.status === 401) {
          throw new Error('Mot de passe incorrect');
        } else if (response.status === 404) {
          throw new Error('Aucun compte trouvé avec cet email');
        }
        
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const data = await response.json();
      console.log('✅ Connexion réussie:', data);
      
      return {
        token: data.token,
        user: {
          email: credentials.email,
          verified: true
        }
      };

    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }
  }

  async register(userData) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Register avec:', userData);
      await this.mockDelay(2000);
      
      if (userData.email === 'taken@test.com') {
        throw new Error('Cette adresse email est déjà utilisée');
      }
      
      return {
        message: 'Code envoyé par email'
      };
    }

    // Appel API réel
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 400) {
          throw new Error('Email et mot de passe requis');
        } else if (response.status === 409) {
          throw new Error('Cette adresse email est déjà utilisée');
        }
        
        throw new Error(errorData.error || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      console.log('✅ Inscription réussie:', data);
      
      return {
        message: data.message || 'Code envoyé par email'
      };

    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  async verifyEmail(code, email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Verify email:', { code, email });
      await this.mockDelay(1000);
      
      if (code !== '123456') {
        throw new Error('Code de vérification incorrect');
      }
      
      return {
        message: 'Compte validé',
        token: 'mock_token_123',
        user: {
          email: email,
          verified: true
        }
      };
    }

    // Appel API réel
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: code.trim(),
          email: email.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 400) {
          throw new Error('Code de vérification incorrect');
        } else if (response.status === 404) {
          throw new Error('Utilisateur non trouvé');
        }
        
        throw new Error(errorData.error || 'Erreur de vérification');
      }

      const data = await response.json();
      console.log('✅ Vérification réussie:', data);
      
      // Après vérification réussie, connecter automatiquement l'utilisateur
      // On peut soit faire un login automatique, soit retourner un token si l'API le fournit
      return {
        message: data.message || 'Compte validé',
        // Note: Votre API Django ne retourne pas de token après vérification
        // Vous pourriez vouloir modifier l'API pour en retourner un
        user: {
          email: email,
          verified: true
        }
      };

    } catch (error) {
      console.error('❌ Erreur vérification:', error);
      throw error;
    }
  }

  async resendVerificationCode(email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Resend code pour:', email);
      await this.mockDelay(1000);
      return { message: 'Code renvoyé avec succès' };
    }

    // Pour l'instant, on utilise le même endpoint que register
    // Vous pourriez vouloir créer un endpoint dédié au renvoi
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: 'temp_password' // Pas idéal, voir note ci-dessous
        }),
      });

      if (response.status === 409) {
        // Email déjà utilisé = compte existe, c'est normal pour un renvoi
        return { message: 'Code renvoyé avec succès' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du renvoi du code');
      }

      return { message: 'Code renvoyé avec succès' };
    } catch (error) {
      console.error('❌ Erreur renvoi code:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Forgot password pour:', email);
      await this.mockDelay(1500);
      return { message: 'Email de réinitialisation envoyé' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 404) {
          // Ne pas révéler si l'email existe ou non pour la sécurité
          return { message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation.' };
        }
        
        throw new Error(errorData.error || 'Erreur lors de la demande');
      }

      const data = await response.json();
      return { message: data.message || 'Lien de réinitialisation envoyé' };
    } catch (error) {
      console.error('❌ Erreur mot de passe oublié:', error);
      throw error;
    }
  }

  async resetPassword(token, password, email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Reset password');
      await this.mockDelay(1500);
      
      if (token === 'invalid-token') {
        throw new Error('Token invalide ou expiré');
      }
      
      return { message: 'Mot de passe réinitialisé avec succès' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          new_password: password,
          email: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 400) {
          throw new Error('Lien invalide ou expiré');
        }
        
        throw new Error(errorData.error || 'Erreur lors de la réinitialisation');
      }

      const data = await response.json();
      return { message: data.message || 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      throw error;
    }
  }

  logout() {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Logout');
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export { MOCK_MODE };