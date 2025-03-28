import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class ObjectAI {
  static async analyzeImage(imageElement) {
    try {
      // Load the COCO-SSD model
      const model = await cocoSsd.load();
      
      // Detect objects in the image
      const predictions = await model.detect(imageElement);
      
      // Analyze the scene based on detected objects
      const sceneAnalysis = this.analyzeScene(predictions);
      
      // Count objects by class
      const objectCounts = this.countObjects(predictions);
      
      // Analyze spatial relationships between objects
      const relationships = this.analyzeRelationships(predictions);
      
      return {
        detections: predictions,
        sceneAnalysis,
        objectCounts,
        relationships,
        status: 'success'
      };
    } catch (error) {
      console.error('Object analysis failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  static analyzeScene(detections) {
    const objects = detections.map(d => d.class);
    
    // Define scene contexts
    const sceneContexts = {
      indoor: ['chair', 'table', 'tv', 'laptop', 'book', 'clock', 'vase'],
      outdoor: ['car', 'tree', 'person', 'bicycle', 'dog', 'bird'],
      office: ['laptop', 'keyboard', 'mouse', 'monitor', 'desk', 'chair'],
      nature: ['tree', 'flower', 'bird', 'grass', 'mountain', 'sky']
    };

    // Calculate scene scores
    const sceneScores = {};
    for (const [scene, indicators] of Object.entries(sceneContexts)) {
      sceneScores[scene] = indicators.reduce((score, obj) => 
        score + (objects.includes(obj) ? 1 : 0), 0
      );
    }

    // Get the most likely scene type
    const [mostLikelyScene] = Object.entries(sceneScores)
      .sort(([,a], [,b]) => b - a);

    return {
      type: mostLikelyScene[0],
      confidence: mostLikelyScene[1] / Math.max(...Object.values(sceneScores)),
      detectedObjects: objects
    };
  }

  static countObjects(detections) {
    const counts = {};
    detections.forEach(detection => {
      counts[detection.class] = (counts[detection.class] || 0) + 1;
    });
    return counts;
  }

  static analyzeRelationships(detections) {
    const relationships = [];

    for (let i = 0; i < detections.length; i++) {
      for (let j = i + 1; j < detections.length; j++) {
        const obj1 = detections[i];
        const obj2 = detections[j];

        // Calculate centers
        const center1 = {
          x: obj1.bbox[0] + obj1.bbox[2] / 2,
          y: obj1.bbox[1] + obj1.bbox[3] / 2
        };
        const center2 = {
          x: obj2.bbox[0] + obj2.bbox[2] / 2,
          y: obj2.bbox[1] + obj2.bbox[3] / 2
        };

        // Determine spatial relationship
        const relationship = {
          object1: obj1.class,
          object2: obj2.class,
          type: this.determineSpatialRelationship(center1, center2),
          confidence: (obj1.score + obj2.score) / 2
        };

        relationships.push(relationship);
      }
    }

    return relationships;
  }

  static determineSpatialRelationship(center1, center2) {
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const threshold = 50; // pixels

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return 'near';
    }

    if (Math.abs(dx) < threshold) {
      return dy < 0 ? 'above' : 'below';
    }

    if (Math.abs(dy) < threshold) {
      return dx < 0 ? 'left of' : 'right of';
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx < 0 ? 'left of' : 'right of';
    } else {
      return dy < 0 ? 'above' : 'below';
    }
  }
} 