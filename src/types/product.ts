export interface Product {
  id: string;
  type: 'suit' | 'shirt' | 'trousers' | 'dress' | string;
  name: string;
  description: string;
  basePrice: number;
  currency: 'USD' | 'THB';
  imageUrls: string[];
  available: boolean;
  featured: boolean;
  season: string[];
  gender: 'male' | 'female' | 'unisex';
  customizationOptions: {
    // For suits
    lapelStyles?: string[];
    ventStyles?: string[];
    pocketStyles?: string[];
    buttonOptions?: string[];
    liningOptions?: string[];

    // For shirts
    collarStyles?: string[];
    cuffStyles?: string[];
    placketStyles?: string[];

    // For trousers
    waistbandStyles?: string[];
    pleats?: string[];
    backPocketStyles?: string[];
    frontPocketStyles?: string[];

    // Shared
    monogramOptions?: boolean;
    specialInstructions?: boolean;
  };
}

export interface Fabric {
  id: string;
  name: string;
  mill: string;
  composition: {
    material: string;
    percentage: number;
  }[];
  weight: number; // g/m²
  colors: string[];
  patterns: string[];
  season: string[];
  imageUrls: string[];
  swatchUrl: string;
  available: boolean;
  stockLevel: number;
  price: number; // additional cost
  currency: 'USD' | 'THB';
  characteristics: string[]; // e.g., 'breathable', 'wrinkle-resistant'
  compatibleProducts: string[]; // references to product.id
}