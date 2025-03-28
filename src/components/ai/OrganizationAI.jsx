import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export class OrganizationAI {
  static async categorizeContent(items) {
    try {
      // Load the Universal Sentence Encoder model
      const model = await use.load();
      
      // Generate embeddings for content
      const embeddings = await this.generateEmbeddings(items, model);
      
      // Cluster similar content
      const clusters = await this.clusterContent(embeddings, items);
      
      // Generate smart tags
      const tags = this.generateTags(items, clusters);
      
      // Generate collection suggestions
      const suggestions = this.generateCollectionSuggestions(clusters);
      
      return {
        categories: clusters,
        tags,
        suggestions,
        status: 'success'
      };
    } catch (error) {
      console.error('Content organization failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  static async generateEmbeddings(items, model) {
    const textContent = items.map(item => {
      if (item.type === 'document') {
        return item.text;
      } else if (item.type === 'object') {
        return item.detections.map(d => d.class).join(' ');
      }
      return '';
    });

    return await model.embed(textContent);
  }

  static async clusterContent(embeddings, items) {
    const numClusters = Math.min(5, Math.ceil(items.length / 3));
    const embeddingArray = await embeddings.array();
    
    // Initialize centroids
    const centroids = this.initializeCentroids(embeddingArray, numClusters);
    
    // Perform k-means clustering
    const clusters = new Array(numClusters).fill(null).map(() => ({
      items: [],
      centroid: null,
      name: ''
    }));

    // Assign items to clusters
    embeddingArray.forEach((embedding, index) => {
      const distances = centroids.map(centroid => 
        this.cosineDistance(embedding, centroid)
      );
      const clusterIndex = distances.indexOf(Math.min(...distances));
      clusters[clusterIndex].items.push(items[index]);
    });

    // Generate cluster names
    clusters.forEach(cluster => {
      cluster.name = this.generateClusterName(cluster.items);
    });

    return clusters;
  }

  static initializeCentroids(embeddings, numClusters) {
    const centroids = [];
    const step = Math.floor(embeddings.length / numClusters);
    
    for (let i = 0; i < numClusters; i++) {
      centroids.push(embeddings[i * step]);
    }
    
    return centroids;
  }

  static cosineDistance(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return 1 - (dotProduct / (norm1 * norm2));
  }

  static generateClusterName(items) {
    // Extract common terms or themes from items
    const terms = items.flatMap(item => {
      if (item.type === 'document') {
        return item.text.split(/\s+/).slice(0, 10);
      } else if (item.type === 'object') {
        return item.detections.map(d => d.class);
      }
      return [];
    });

    // Count term frequencies
    const frequencies = {};
    terms.forEach(term => {
      frequencies[term] = (frequencies[term] || 0) + 1;
    });

    // Get most frequent terms
    const [mostFrequent] = Object.entries(frequencies)
      .sort(([,a], [,b]) => b - a);

    return mostFrequent ? `${mostFrequent[0]} Collection` : 'Untitled Collection';
  }

  static generateTags(items, clusters) {
    const tags = new Set();
    
    // Add tags from document content
    items.forEach(item => {
      if (item.type === 'document') {
        // Extract key terms from text
        const terms = item.text.toLowerCase()
          .split(/\s+/)
          .filter(term => term.length > 3)
          .slice(0, 5);
        terms.forEach(term => tags.add(term));
      } else if (item.type === 'object') {
        // Add object classes as tags
        item.detections.forEach(detection => {
          tags.add(detection.class);
        });
      }
    });

    // Add cluster names as tags
    clusters.forEach(cluster => {
      tags.add(cluster.name.replace(' Collection', '').toLowerCase());
    });

    return Array.from(tags);
  }

  static generateCollectionSuggestions(clusters) {
    return clusters.map(cluster => ({
      name: cluster.name,
      description: this.generateCollectionDescription(cluster.items),
      itemCount: cluster.items.length,
      previewItems: cluster.items.slice(0, 3)
    }));
  }

  static generateCollectionDescription(items) {
    const types = new Set(items.map(item => item.type));
    const typeStr = Array.from(types).join(' and ');
    return `A collection of ${items.length} ${typeStr} items with similar content and themes.`;
  }
} 