const API_BASE_URL = import.meta.env.VITE_API_URL;

// Mode de test - changez cette variable pour activer/désactiver le mock
let MOCK_MODE = true;

// Données mock pour les tests
const MOCK_USER = {
  id: 1,
  username: 'testuser',
  name: 'Utilisateur Test',
  email: 'test@example.com',
  verified: true,
  created_at: new Date().toISOString()
};

const MOCK_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiZXhwIjoxNzM5NDgwMDAwfQ.mock_signature_for_testing';

class AuthService {
  // Simulation d'un délai réseau
  async mockDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Login avec:', credentials);
      
      // Simuler un délai réseau
      await this.mockDelay(1500);
      
      // Simuler différents scénarios selon l'email
      if (credentials.email === 'error@test.com') {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      if (credentials.email === 'slow@test.com') {
        await this.mockDelay(3000);
      }
      
      // Toujours retourner un succès pour les autres cas
      return {
        token: MOCK_TOKEN,
        user: {
          ...MOCK_USER,
          email: credentials.email // Utiliser l'email saisi
        }
      };
    }

    // Code normal pour la production
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur de connexion');
    }

    return response.json();
  }

  async register(userData) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Register avec:', userData);
      
      await this.mockDelay(2000);
      
      // Simuler erreur si username existe déjà
      if (userData.username === 'admin' || userData.username === 'test') {
        throw new Error('Ce nom d\'utilisateur existe déjà');
      }
      
      if (userData.email === 'taken@test.com') {
        throw new Error('Cette adresse email est déjà utilisée');
      }
      
      // Simuler succès
      return {
        message: 'Compte créé avec succès. Vérifiez votre email.',
        user: {
          ...MOCK_USER,
          username: userData.username,
          email: userData.email,
          verified: false
        }
      };
    }

    // Code normal pour la production
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'inscription');
    }

    return response.json();
  }

  async verifyEmail(code, email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Verify email:', { code, email });
      
      await this.mockDelay(1000);
      
      // Simuler erreur si code incorrect
      if (code !== '123456') {
        throw new Error('Code de vérification incorrect');
      }
      
      return {
        message: 'Email vérifié avec succès',
        token: MOCK_TOKEN,
        user: {
          ...MOCK_USER,
          email: email,
          verified: true
        }
      };
    }

    // Code normal pour la production
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur de vérification');
    }

    return response.json();
  }

  async forgotPassword(email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Forgot password pour:', email);
      
      await this.mockDelay(1500);
      
      // Simuler succès pour tous les emails
      return {
        message: 'Email de réinitialisation envoyé'
      };
    }

    // Code normal pour la production
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la demande');
    }

    return response.json();
  }

  async resetPassword(token, password) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Reset password avec token:', token);
      
      await this.mockDelay(1500);
      
      // Simuler token invalide
      if (token === 'invalid-token') {
        throw new Error('Token invalide ou expiré');
      }
      
      return {
        message: 'Mot de passe réinitialisé avec succès'
      };
    }

    // Code normal pour la production
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la réinitialisation');
    }

    return response.json();
  }

  async verifyResetToken(token) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Verify reset token:', token);
      
      await this.mockDelay(500);
      
      // Simuler token invalide pour certains cas
      return token !== 'invalid-token';
    }

    // Code normal pour la production
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return response.ok;
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

// Fonction pour basculer entre mode test et production
export const toggleMockMode = () => {
  MOCK_MODE = !MOCK_MODE;
  console.log(`🧪 Mode Mock ${MOCK_MODE ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  return MOCK_MODE;
};

// Export pour debug
export { MOCK_MODE, MOCK_USER, MOCK_TOKEN };