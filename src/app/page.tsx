'use client';

import { useState, useMemo, useEffect } from 'react';
import { Filter, Clock, Star, Crown, ChefHat, Heart, BookOpen, LogOut } from 'lucide-react';
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
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Carregar usuário e receitas
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
        // Remover favorito (não podemos usar DELETE, então vamos apenas atualizar o estado local)
        const newFavorites = new Set(favorites);
        newFavorites.delete(recipeId);
        setFavorites(newFavorites);
      } else {
        // Adicionar favorito
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFavorites(new Set());
  };

  // Filtrar receitas
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      return matchesCategory;
    });
  }, [recipes, selectedCategory]);

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

      {/* Hero Section - Mais compacto e moderno */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF7F]/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF7F]/10 border border-[#00FF7F]/30 rounded-full text-[#00FF7F] text-sm font-semibold backdrop-blur-sm">
              <Crown className="w-4 h-4" />
              <span>Receitas de Alto Nível</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
              Culinária Premium
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto font-inter leading-relaxed">
              Descubra receitas exclusivas criadas por chefs renomados
            </p>

            {/* User Info */}
            {user && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="px-4 py-2 bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#00FF7F]/20 rounded-full text-sm text-gray-300">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters Section - Mais espaçado e clean */}
      <section className="border-y border-[#00FF7F]/10 bg-[#0D0D0D]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold font-poppins flex items-center gap-2 text-gray-200">
              <Filter className="w-4 h-4 text-[#00FF7F]" />
              Categorias
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-[#1A1A1A] border border-[#00FF7F]/20 rounded-full text-sm text-gray-300 hover:text-[#00FF7F] hover:border-[#00FF7F]/40 transition-all duration-300"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className={`${showFilters ? 'flex' : 'hidden md:flex'} flex-wrap gap-2.5`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 text-sm ${
                selectedCategory === 'all'
                  ? 'bg-[#00FF7F] text-[#0D0D0D] shadow-lg shadow-[#00FF7F]/40 scale-105'
                  : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] border border-[#00FF7F]/10 hover:border-[#00FF7F]/30'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as RecipeCategory)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
                  selectedCategory === cat.id
                    ? 'bg-[#00FF7F] text-[#0D0D0D] shadow-lg shadow-[#00FF7F]/40 scale-105'
                    : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] border border-[#00FF7F]/10 hover:border-[#00FF7F]/30'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipes Grid - Cards mais arredondados e espaçados */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-poppins text-gray-100">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Receita' : 'Receitas'}
          </h2>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-xl text-gray-400 font-semibold">Nenhuma receita encontrada</p>
            <p className="text-gray-500 mt-2">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="group bg-[#1A1A1A]/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#00FF7F]/10 hover:border-[#00FF7F]/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#00FF7F]/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image - Mais arredondado */}
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

                  {/* Favorite Button - Aparece no hover */}
                  <button 
                    onClick={() => toggleFavorite(recipe.id)}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white shadow-lg"
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(recipe.id) ? 'fill-red-500 text-red-500' : 'text-[#0D0D0D]'}`} />
                  </button>
                </div>

                {/* Content - Mais espaçado */}
                <div className="p-5 space-y-3.5">
                  <h3 className="text-lg font-bold font-poppins text-white group-hover:text-[#00FF7F] transition-colors duration-300 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Meta Info - Mais espaçado */}
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

                  {/* Difficulty Badge */}
                  <div className="pt-3">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      recipe.difficulty === 'fácil' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      recipe.difficulty === 'médio' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* CTA Button - Mais arredondado */}
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

      {/* Footer - Mais compacto */}
      <footer className="border-t border-[#00FF7F]/10 mt-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm space-y-1">
            <p>© 2024 Receitas Premium. Todos os direitos reservados.</p>
            <p className="flex items-center justify-center gap-1">
              Criado com <Heart className="w-3 h-3 text-[#00FF7F] fill-current inline" /> para amantes da gastronomia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
