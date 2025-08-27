const API_BASE_URL = import.meta.env.VITE_API_URL;

// Mode de test - changez cette variable pour activer/désactiver le mock
const MOCK_MODE = true;

class ReportService {
  // Simulation d'un délai réseau
  async mockDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async submitReport(reportData) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Submit report avec:', reportData);
      
      // Simuler un délai réseau
      await this.mockDelay(2000);
      
      // Simuler différents scénarios selon le type de problème
      if (reportData.type === 'Problème de sécurité') {
        // Simuler une erreur pour ce type
        throw new Error('Erreur lors de l\'envoi du signalement de sécurité');
      }
      
      if (reportData.message.includes('erreur')) {
        throw new Error('Message invalide détecté');
      }
      
      // Simuler succès
      const mockResponse = {
        id: Math.floor(Math.random() * 1000) + 1,
        message: reportData.message,
        type: reportData.type,
        etat: 'Nouveau',
        images_url: reportData.images_url,
        installation: reportData.installation,
        utilisateur: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Signalement créé avec succès:', mockResponse);
      return mockResponse;
    }

    // Code normal pour la production
    try {
      const response = await fetch(`${API_BASE_URL}/signalements/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(reportData)
      });

      // Vérifier le content-type de la réponse
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        // Essayer de parser le JSON d'erreur si possible
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || 'Erreur lors de l\'envoi du signalement');
          } catch (jsonError) {
            // Si le parsing JSON échoue, utiliser le status text
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
        } else {
          // Réponse non-JSON
          const textResponse = await response.text();
          throw new Error(`Erreur ${response.status}: ${textResponse || response.statusText}`);
        }
      }

      // Vérifier si la réponse contient du JSON
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Si pas de JSON, retourner un objet de succès basique
        return {
          success: true,
          message: 'Signalement envoyé avec succès'
        };
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du signalement:', error);
      throw error;
    }
  }

  async uploadImages(images) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Upload images:', images.length, 'images');
      
      await this.mockDelay(1500);
      
      // Simuler succès avec URLs mockées
      const mockUrls = images.map((_, index) => 
        `https://mock-storage.example.com/reports/image_${Date.now()}_${index}.jpg`
      );
      
      console.log('✅ Images uploadées:', mockUrls);
      return mockUrls;
    }

    if (images.length === 0) return null;

    try {
      // Créer FormData pour l'upload des images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image.file);
      });

      const response = await fetch(`${API_BASE_URL}/upload-images/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload des images');
      }

      const data = await response.json();
      return data.images_url || data.url;
      
    } catch (error) {
      console.error('Erreur upload images:', error);
      // En cas d'erreur, continuer sans images
      return null;
    }
  }
}

export const reportService = new ReportService();
export { MOCK_MODE };