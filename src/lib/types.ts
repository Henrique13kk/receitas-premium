// Types para o app Receitas Premium

export type RecipeCategory = 'massas' | 'carnes' | 'sobremesas' | 'vegetariano' | 'fitness' | 'bebidas';

export type UserRole = 'user' | 'admin';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  image: string;
  prepTime: number; // em minutos
  difficulty: 'fácil' | 'médio' | 'difícil';
  isPremium: boolean;
  rating: number;
  ingredients: string[];
  instructions: string[];
  author: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  avatar?: string;
}
