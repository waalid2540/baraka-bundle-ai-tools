// DALL-E Backend Service - Routes image generation through backend
// This avoids exposing API keys in the frontend

import backendApiService from './backendApiService';

class DalleBackendService {
  constructor() {
    console.log('🎨 DALL-E Backend Service initialized');
    console.log('🔒 Using secure backend API for image generation');
  }

  // Generate book cover through backend
  async generateBookCover(storyTitle: string, theme: string, ageGroup: string): Promise<string> {
    console.log('🎨 Requesting book cover from backend for:', storyTitle);

    try {
      const response = await fetch('https://baraka-bundle-ai-tools.onrender.com/api/generate/dalle-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'book-cover',
          title: storyTitle,
          theme: theme,
          ageGroup: ageGroup
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        console.log('✅ Book cover generated via backend');
        return data.imageUrl;
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Book cover generation error:', error);
      // Return fallback
      return this.generateFallbackBookCover(storyTitle, theme);
    }
  }

  // Generate story scenes through backend
  async generateStoryScenes(storyTitle: string, storyContent: string, characterName: string, theme: string, ageGroup: string): Promise<string[]> {
    console.log('🎨 Requesting story scenes from backend for:', storyTitle);

    try {
      const pages = this.splitStoryIntoPages(storyContent);
      const illustrations: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        const response = await fetch('https://baraka-bundle-ai-tools.onrender.com/api/generate/dalle-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'story-scene',
            title: storyTitle,
            pageContent: pages[i],
            pageNumber: i + 1,
            totalPages: pages.length,
            theme: theme,
            ageGroup: ageGroup,
            characterName: characterName
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.imageUrl) {
            illustrations.push(data.imageUrl);
            console.log(`✅ Scene ${i + 1} generated via backend`);
          } else {
            illustrations.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme));
          }
        } else {
          illustrations.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme));
        }

        // Small delay between requests
        if (i < pages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return illustrations;
    } catch (error) {
      console.error('Story scenes generation error:', error);
      // Return fallback images
      const pages = this.splitStoryIntoPages(storyContent);
      const fallbacks: string[] = [];
      for (let i = 0; i < pages.length; i++) {
        fallbacks.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme));
      }
      return fallbacks;
    }
  }

  // Helper functions (same as original)
  private splitStoryIntoPages(storyContent: string, wordsPerPage: number = 80): string[] {
    const words = storyContent.split(' ');
    const pages: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageContent = words.slice(i, Math.min(i + wordsPerPage, words.length)).join(' ');
      if (pageContent.trim()) {
        pages.push(pageContent.trim());
      }
    }

    return pages.length > 0 ? pages : [storyContent];
  }

  private async generateFallbackBookCover(title: string, theme: string): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
    gradient.addColorStop(0, '#2D5A27');
    gradient.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 1000);

    // Border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, 720, 920);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title.substring(0, 30), 400, 200);

    // Islamic decoration
    ctx.font = '100px Arial';
    ctx.fillText('☪️', 400, 500);

    // Theme
    ctx.font = '32px Arial';
    ctx.fillText(theme, 400, 700);

    return canvas.toDataURL('image/png');
  }

  private async generateFallbackStoryImage(storyTitle: string, characterName: string, theme: string): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Colorful background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, '#E8F5E8');
    gradient.addColorStop(1, '#F0F8FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Border
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 924, 924);

    // Title
    ctx.fillStyle = '#2D5A27';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📚 Islamic Story', 512, 150);

    // Story title
    ctx.fillStyle = '#1F2937';
    ctx.font = '36px Arial';
    ctx.fillText(storyTitle.substring(0, 40), 512, 300);

    // Theme
    ctx.fillStyle = '#8B5CF6';
    ctx.font = '24px Arial';
    ctx.fillText(`Theme: ${theme}`, 512, 450);

    // Character
    ctx.fillStyle = '#059669';
    ctx.font = 'italic 28px Arial';
    ctx.fillText(`Featuring: ${characterName}`, 512, 550);

    // Islamic decoration
    ctx.fillStyle = '#D4AF37';
    ctx.font = '48px Arial';
    ctx.fillText('☪️', 512, 700);

    return canvas.toDataURL('image/png');
  }
}

export const dalleBackendService = new DalleBackendService();
export default dalleBackendService;