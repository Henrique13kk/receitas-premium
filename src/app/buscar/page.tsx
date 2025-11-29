'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, Star, Crown, ChefHat, Heart, BookOpen, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/custom/navbar';
import { categories } from '@/lib/data';
import { RecipeCategory } from '@/lib/types';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  prep_time: number;
  difficulty: string;
  rating: number;
  is_premium: boolean;
  ingredients: string[];
  instructions: string[];
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at: string;
}

export default function BuscarPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [maxPrepTime, setMaxPrepTime] = useState<number>(120);
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadRecipes();
    loadFavorites();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.recipe_id) || []));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (favorites.has(recipeId)) {
        const newFavorites = new Set(favorites);
        newFavorites.delete(recipeId);
        setFavorites(newFavorites);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, recipe_id: recipeId });

        if (error) throw error;
        setFavorites(new Set([...favorites, recipeId]));
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  // Filtrar receitas com busca avançada
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const matchesPrepTime = recipe.prep_time <= maxPrepTime;
    const matchesPremium = !showOnlyPremium || recipe.is_premium;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesPrepTime && matchesPremium;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setMaxPrepTime(120);
    setShowOnlyPremium(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00FF7F] mx-auto"></div>
          <p className="text-gray-400">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      <Navbar />

      {/* Header Section */}
      <section className="relative overflow-hidden border-b border-[#00FF7F]/10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF7F]/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 pb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00FF7F] transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar para Início</span>
          </Link>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF7F]/10 border border-[#00FF7F]/30 rounded-full text-[#00FF7F] text-sm font-semibold backdrop-blur-sm">
              <Search className="w-4 h-4" />
              <span>Busca Avançada</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
              Encontre sua Receita Perfeita
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-inter leading-relaxed">
              Use filtros avançados para encontrar exatamente o que você procura
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#00FF7F] transition-colors duration-300" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou ingredientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#00FF7F]/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF7F] focus:ring-2 focus:ring-[#00FF7F]/30 transition-all duration-300 shadow-lg shadow-black/20"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#00FF7F]/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-poppins flex items-center gap-2 text-gray-200">
              <Filter className="w-5 h-5 text-[#00FF7F]" />
              Filtros Avançados
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-[#252525] border border-[#00FF7F]/20 rounded-full text-sm text-gray-300 hover:text-[#00FF7F] hover:border-[#00FF7F]/40 transition-all duration-300"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </button>
            <button
              onClick={resetFilters}
              className="hidden md:block px-4 py-2 bg-[#252525] border border-[#00FF7F]/20 rounded-full text-sm text-gray-300 hover:text-[#00FF7F] hover:border-[#00FF7F]/40 transition-all duration-300"
            >
              Limpar Filtros
            </button>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden md:block'} space-y-6`}>
            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Categoria</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                    selectedCategory === 'all'
                      ? 'bg-[#00FF7F] text-[#0D0D0D] shadow-lg shadow-[#00FF7F]/40'
                      : 'bg-[#252525] text-gray-300 hover:bg-[#2A2A2A] border border-[#00FF7F]/10'
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as RecipeCategory)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
                      selectedCategory === cat.id
                        ? 'bg-[#00FF7F] text-[#0D0D0D] shadow-lg shadow-[#00FF7F]/40'
                        : 'bg-[#252525] text-gray-300 hover:bg-[#2A2A2A] border border-[#00FF7F]/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Dificuldade</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'fácil', 'médio', 'difícil'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                      selectedDifficulty === diff
                        ? 'bg-[#00FF7F] text-[#0D0D0D] shadow-lg shadow-[#00FF7F]/40'
                        : 'bg-[#252525] text-gray-300 hover:bg-[#2A2A2A] border border-[#00FF7F]/10'
                    }`}
                  >
                    {diff === 'all' ? 'Todas' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Prep Time Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Tempo de Preparo: até {maxPrepTime} minutos
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={maxPrepTime}
                onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                className="w-full h-2 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#00FF7F]"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>15 min</span>
                <span>120 min</span>
              </div>
            </div>

            {/* Premium Filter */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="premium"
                checked={showOnlyPremium}
                onChange={(e) => setShowOnlyPremium(e.target.checked)}
                className="w-5 h-5 rounded border-[#00FF7F]/30 bg-[#252525] text-[#00FF7F] focus:ring-[#00FF7F] focus:ring-offset-0"
              />
              <label htmlFor="premium" className="text-sm font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <Crown className="w-4 h-4 text-[#00FF7F]" />
                Mostrar apenas receitas Premium
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-poppins text-gray-100">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Receita Encontrada' : 'Receitas Encontradas'}
          </h2>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-xl text-gray-400 font-semibold">Nenhuma receita encontrada</p>
            <p className="text-gray-500 mt-2">Tente ajustar os filtros de busca</p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-2xl font-bold hover:bg-[#00CC66] transition-all duration-300"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="group bg-[#1A1A1A]/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#00FF7F]/10 hover:border-[#00FF7F]/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#00FF7F]/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {recipe.is_premium && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#00FF7F] text-[#0D0D0D] rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl shadow-[#00FF7F]/50">
                      <Crown className="w-3.5 h-3.5" />
                      <span>PREMIUM</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/10">
                    {categories.find(c => c.id === recipe.category)?.icon} {categories.find(c => c.id === recipe.category)?.label}
                  </div>

                  <button 
                    onClick={() => toggleFavorite(recipe.id)}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white shadow-lg"
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(recipe.id) ? 'fill-red-500 text-red-500' : 'text-[#0D0D0D]'}`} />
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  <h3 className="text-lg font-bold font-poppins text-white group-hover:text-[#00FF7F] transition-colors duration-300 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{recipe.prep_time}min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#00FF7F]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{recipe.rating}</span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      recipe.difficulty === 'fácil' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      recipe.difficulty === 'médio' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  <Link href={`/receita/${recipe.id}`}>
                    <button className="w-full mt-4 px-5 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-2xl font-bold hover:bg-[#00CC66] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#00FF7F]/40 flex items-center justify-center gap-2 group/btn">
                      <BookOpen className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span>Ver Receita</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
