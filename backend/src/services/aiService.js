const logger = require('../utils/logger');

class AIService {
  static async analyzeImage(imageUrl) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock results
      const mockResults = this.generateMockResults();

      return {
        categories: mockResults.categories,
        labels: mockResults.labels,
        objects: mockResults.objects,
        text: mockResults.text,
        safeSearch: mockResults.safeSearch
      };
    } catch (error) {
      logger.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  static generateMockResults() {
    // Randomly select categories
    const allCategories = ['medical', 'document', 'personal', 'food', 'product'];
    const numCategories = Math.floor(Math.random() * 3) + 1; // 1-3 categories
    const categories = this.getRandomElements(allCategories, numCategories);

    // Generate mock labels
    const labels = this.generateMockLabels(categories);

    // Generate mock objects
    const objects = this.generateMockObjects(categories);

    // Generate mock text
    const text = this.generateMockText(categories);

    // Generate mock safe search results
    const safeSearch = {
      adult: 'UNLIKELY',
      violence: 'UNLIKELY',
      racy: 'UNLIKELY',
      medical: categories.includes('medical') ? 'LIKELY' : 'UNLIKELY',
      spoof: 'UNLIKELY'
    };

    return {
      categories,
      labels,
      objects,
      text,
      safeSearch
    };
  }

  static generateMockLabels(categories) {
    const labelPool = {
      medical: [
        { description: 'Medical Document', score: 0.95 },
        { description: 'Prescription', score: 0.92 },
        { description: 'Doctor', score: 0.88 },
        { description: 'Hospital', score: 0.85 }
      ],
      document: [
        { description: 'Document', score: 0.94 },
        { description: 'Paper', score: 0.91 },
        { description: 'Text', score: 0.89 },
        { description: 'Form', score: 0.86 }
      ],
      personal: [
        { description: 'Person', score: 0.93 },
        { description: 'Portrait', score: 0.90 },
        { description: 'Face', score: 0.87 },
        { description: 'Selfie', score: 0.84 }
      ],
      food: [
        { description: 'Food', score: 0.92 },
        { description: 'Meal', score: 0.89 },
        { description: 'Dish', score: 0.86 },
        { description: 'Cuisine', score: 0.83 }
      ],
      product: [
        { description: 'Product', score: 0.91 },
        { description: 'Package', score: 0.88 },
        { description: 'Item', score: 0.85 },
        { description: 'Goods', score: 0.82 }
      ]
    };

    const labels = [];
    categories.forEach(category => {
      const categoryLabels = labelPool[category];
      const numLabels = Math.floor(Math.random() * 2) + 1; // 1-2 labels per category
      labels.push(...this.getRandomElements(categoryLabels, numLabels));
    });

    return labels;
  }

  static generateMockObjects(categories) {
    const objectPool = {
      medical: [
        { name: 'Medical equipment', score: 0.95 },
        { name: 'Medicine bottle', score: 0.92 },
        { name: 'Pill', score: 0.89 }
      ],
      document: [
        { name: 'Document', score: 0.94 },
        { name: 'Paper', score: 0.91 },
        { name: 'Book', score: 0.88 }
      ],
      personal: [
        { name: 'Person', score: 0.93 },
        { name: 'Face', score: 0.90 },
        { name: 'Portrait', score: 0.87 }
      ],
      food: [
        { name: 'Food', score: 0.92 },
        { name: 'Dish', score: 0.89 },
        { name: 'Meal', score: 0.86 }
      ],
      product: [
        { name: 'Product', score: 0.91 },
        { name: 'Package', score: 0.88 },
        { name: 'Item', score: 0.85 }
      ]
    };

    const objects = [];
    categories.forEach(category => {
      const categoryObjects = objectPool[category];
      const numObjects = Math.floor(Math.random() * 2) + 1; // 1-2 objects per category
      objects.push(...this.getRandomElements(categoryObjects, numObjects));
    });

    return objects;
  }

  static generateMockText(categories) {
    const textPool = {
      medical: [
        'Patient: John Doe\nDate: 2024-03-15\nPrescription: Amoxicillin 500mg\nDosage: 1 tablet twice daily',
        'Medical Report\nPatient ID: 12345\nDate: March 15, 2024\nDiagnosis: Common cold',
        'Doctor: Dr. Smith\nDepartment: Internal Medicine\nAppointment: March 20, 2024'
      ],
      document: [
        'Official Document\nReference: DOC-2024-001\nDate: March 15, 2024',
        'Certificate of Completion\nIssued to: Jane Smith\nDate: March 15, 2024',
        'Form ID: F-2024-123\nDate: March 15, 2024\nStatus: Completed'
      ],
      personal: [
        'Name: John Doe\nAddress: 123 Main St\nPhone: (555) 123-4567',
        'ID: 12345\nDOB: 01/01/1990\nGender: M\nAddress: 456 Oak Ave',
        'Contact: Jane Smith\nEmail: jane@example.com\nPhone: (555) 987-6543'
      ],
      food: [
        'Menu Item: Grilled Salmon\nPrice: $24.99\nDescription: Fresh Atlantic salmon with seasonal vegetables',
        'Recipe: Pasta Carbonara\nIngredients: Pasta, eggs, pecorino, guanciale\nInstructions: Cook pasta...',
        'Food Label: Organic Brown Rice\nNet Weight: 1kg\nBest Before: 2024-12-31'
      ],
      product: [
        'Product: Smart Watch\nModel: SW-2024\nPrice: $199.99\nFeatures: Heart rate, GPS',
        'Item: Wireless Headphones\nBrand: SoundPro\nColor: Black\nWarranty: 1 year',
        'Package: Smartphone\nModel: SP-2024\nColor: Silver\nStorage: 128GB'
      ]
    };

    const texts = [];
    categories.forEach(category => {
      const categoryTexts = textPool[category];
      const numTexts = Math.floor(Math.random() * 2) + 1; // 1-2 texts per category
      texts.push(...this.getRandomElements(categoryTexts, numTexts));
    });

    return texts.join('\n\n');
  }

  static getRandomElements(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static processResults(labels, objects, text, safeSearch) {
    const categories = new Set();

    // Process labels
    labels.forEach(label => {
      if (label.score > 0.7) {
        const category = this.mapLabelToCategory(label.description);
        if (category) categories.add(category);
      }
    });

    // Process objects
    objects.forEach(obj => {
      if (obj.score > 0.7) {
        const category = this.mapObjectToCategory(obj.name);
        if (category) categories.add(category);
      }
    });

    // Process text content
    if (text) {
      const textCategories = this.analyzeTextContent(text);
      textCategories.forEach(cat => categories.add(cat));
    }

    // Check safe search
    if (safeSearch) {
      if (safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY') {
        categories.add('sensitive');
      }
    }

    return Array.from(categories);
  }

  static mapLabelToCategory(label) {
    const labelToCategory = {
      // Medical categories
      'Medical': 'medical',
      'Doctor': 'medical',
      'Hospital': 'medical',
      'Medicine': 'medical',
      'Prescription': 'medical',
      'X-ray': 'medical',
      'MRI': 'medical',
      'CT scan': 'medical',
      'Ultrasound': 'medical',
      'Blood test': 'medical',
      
      // Document categories
      'Document': 'document',
      'Paper': 'document',
      'Text': 'document',
      'Letter': 'document',
      'Form': 'document',
      'Certificate': 'document',
      'ID card': 'document',
      'Passport': 'document',
      'License': 'document',
      
      // Personal categories
      'Person': 'personal',
      'Portrait': 'personal',
      'Selfie': 'personal',
      'Face': 'personal',
      
      // Other categories
      'Food': 'food',
      'Receipt': 'receipt',
      'Product': 'product',
      'Package': 'product',
      'Medicine bottle': 'medical',
      'Pill': 'medical',
      'Medical equipment': 'medical'
    };

    return labelToCategory[label] || null;
  }

  static mapObjectToCategory(object) {
    const objectToCategory = {
      'Person': 'personal',
      'Medical equipment': 'medical',
      'Document': 'document',
      'Food': 'food',
      'Product': 'product'
    };

    return objectToCategory[object] || null;
  }

  static analyzeTextContent(text) {
    const categories = new Set();
    const textLower = text.toLowerCase();

    // Medical terms
    const medicalTerms = ['prescription', 'doctor', 'hospital', 'clinic', 'medicine', 'diagnosis', 'treatment', 'patient', 'medical', 'health', 'disease', 'symptoms'];
    if (medicalTerms.some(term => textLower.includes(term))) {
      categories.add('medical');
    }

    // Document terms
    const documentTerms = ['document', 'form', 'certificate', 'license', 'passport', 'id', 'signature', 'date', 'reference'];
    if (documentTerms.some(term => textLower.includes(term))) {
      categories.add('document');
    }

    // Personal terms
    const personalTerms = ['name', 'address', 'phone', 'email', 'dob', 'gender'];
    if (personalTerms.some(term => textLower.includes(term))) {
      categories.add('personal');
    }

    return Array.from(categories);
  }
}

module.exports = AIService; 