import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export class DocumentAI {
  static async analyzeDocument(text) {
    try {
      // Enhanced text preprocessing
      const cleanedText = this.preprocessText(text);
      
      // Load the Universal Sentence Encoder model
      const model = await use.load();
      
      // Generate embeddings for the text
      const embeddings = await model.embed([cleanedText]);
      
      // Extract key points
      const keyPoints = await this.extractKeyPoints(cleanedText, model);
      
      // Classify document type
      const documentType = this.classifyDocument(cleanedText);
      
      // Generate summary
      const summary = await this.generateSummary(cleanedText, model);
      
      // Calculate reading time
      const readingTime = this.estimateReadingTime(cleanedText);
      
      return {
        keyPoints,
        documentType,
        summary,
        readingTime,
        status: 'success'
      };
    } catch (error) {
      console.error('Document analysis failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  static preprocessText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim();
  }

  static async extractKeyPoints(text, model) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const embeddings = await model.embed(sentences);
    const scores = await this.calculateSentenceScores(embeddings);
    
    return sentences
      .map((sentence, i) => ({ sentence, score: scores[i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.sentence.trim());
  }

  static classifyDocument(text) {
    const categories = {
      academic: ['research', 'study', 'analysis', 'methodology', 'conclusion'],
      technical: ['code', 'software', 'system', 'data', 'implementation'],
      creative: ['story', 'design', 'art', 'creative', 'innovative'],
      business: ['market', 'strategy', 'business', 'company', 'financial']
    };

    const wordCounts = {};
    Object.keys(categories).forEach(category => {
      wordCounts[category] = categories[category].reduce((count, word) => 
        count + (text.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
      );
    });

    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  static async generateSummary(text, model) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const embeddings = await model.embed(sentences);
    const scores = await this.calculateSentenceScores(embeddings);
    
    return sentences
      .map((sentence, i) => ({ sentence, score: scores[i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence.trim())
      .join(' ');
  }

  static async calculateSentenceScores(embeddings) {
    const embeddingArray = await embeddings.array();
    const scores = [];

    for (let i = 0; i < embeddingArray.length; i++) {
      let score = 0;
      for (let j = 0; j < embeddingArray.length; j++) {
        if (i !== j) {
          score += this.cosineSimilarity(embeddingArray[i], embeddingArray[j]);
        }
      }
      scores.push(score / (embeddingArray.length - 1));
    }

    return scores;
  }

  static cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }

  static estimateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
} 