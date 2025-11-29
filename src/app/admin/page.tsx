'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  Tag, 
  Bell,
  X,
  Save,
  Crown,
  Lock,
  Unlock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  prep_time: number;
  is_premium: boolean;
  image_url: string;
  ingredients: any;
  instructions: any;
  nutritional_info: any;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  is_premium: boolean;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ContentUpdate {
  id: string;
  title: string;
  description: string;
  type: string;
  published: boolean;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('recipes');
  
  // States para dados
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [updates, setUpdates] = useState<ContentUpdate[]>([]);
  
  // States para modais
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    description: '',
    category: '',
    prep_time: 30,
    is_premium: false,
    image_url: '',
    ingredients: '',
    instructions: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📁'
  });
  
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    type: 'feature',
    published: false
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Verificar se usuário está na tabela admin_users
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single();

      if (!adminCheck) {
        alert('Acesso negado! Você não tem permissão de administrador.');
        router.push('/');
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadRecipes(),
      loadUsers(),
      loadCategories(),
      loadUpdates()
    ]);
  };

  const loadRecipes = async () => {
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRecipes(data);
  };

  const loadUsers = async () => {
    // Carregar profiles e verificar quais são admins
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profiles) {
      // Buscar lista de admins
      const { data: admins } = await supabase
        .from('admin_users')
        .select('user_id');
      
      const adminIds = new Set(admins?.map(a => a.user_id) || []);
      
      // Adicionar flag is_admin aos profiles
      const usersWithAdmin = profiles.map(profile => ({
        ...profile,
        is_admin: adminIds.has(profile.id)
      }));
      
      setUsers(usersWithAdmin);
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const loadUpdates = async () => {
    const { data } = await supabase
      .from('content_updates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUpdates(data);
  };

  // CRUD Receitas
  const handleSaveRecipe = async () => {
    try {
      const recipeData = {
        title: recipeForm.title,
        description: recipeForm.description,
        category: recipeForm.category,
        prep_time: recipeForm.prep_time,
        is_premium: recipeForm.is_premium,
        image_url: recipeForm.image_url,
        ingredients: recipeForm.ingredients.split('\n').filter(i => i.trim()),
        instructions: recipeForm.instructions.split('\n').filter(i => i.trim()),
        nutritional_info: {
          calories: recipeForm.calories,
          protein: recipeForm.protein,
          carbs: recipeForm.carbs,
          fat: recipeForm.fat
        }
      };

      if (editingItem) {
        await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', editingItem.id);
      } else {
        await supabase
          .from('recipes')
          .insert([recipeData]);
      }

      setShowRecipeModal(false);
      setEditingItem(null);
      resetRecipeForm();
      loadRecipes();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita!');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    
    await supabase.from('recipes').delete().eq('id', id);
    loadRecipes();
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingItem(recipe);
    setRecipeForm({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      prep_time: recipe.prep_time,
      is_premium: recipe.is_premium,
      image_url: recipe.image_url,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : '',
      calories: recipe.nutritional_info?.calories || 0,
      protein: recipe.nutritional_info?.protein || 0,
      carbs: recipe.nutritional_info?.carbs || 0,
      fat: recipe.nutritional_info?.fat || 0
    });
    setShowRecipeModal(true);
  };

  const resetRecipeForm = () => {
    setRecipeForm({
      title: '',
      description: '',
      category: '',
      prep_time: 30,
      is_premium: false,
      image_url: '',
      ingredients: '',
      instructions: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  };

  // CRUD Categorias
  const handleSaveCategory = async () => {
    try {
      if (editingItem) {
        await supabase
          .from('categories')
          .update(categoryForm)
          .eq('id', editingItem.id);
      } else {
        await supabase
          .from('categories')
          .insert([categoryForm]);
      }

      setShowCategoryModal(false);
      setEditingItem(null);
      setCategoryForm({ name: '', description: '', icon: '📁' });
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria!');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  };

  const handleEditCategory = (category: Category) => {
    setEditingItem(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon
    });
    setShowCategoryModal(true);
  };

  // Gerenciar Usuários
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);
    loadUsers();
  };

  // CRUD Atualizações
  const handleSaveUpdate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const updateData = {
        ...updateForm,
        created_by: session?.user.id
      };

      if (editingItem) {
        await supabase
          .from('content_updates')
          .update(updateData)
          .eq('id', editingItem.id);
      } else {
        await supabase
          .from('content_updates')
          .insert([updateData]);
      }

      setShowUpdateModal(false);
      setEditingItem(null);
      setUpdateForm({ title: '', description: '', type: 'feature', published: false });
      loadUpdates();
    } catch (error) {
      console.error('Erro ao salvar atualização:', error);
      alert('Erro ao salvar atualização!');
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atualização?')) return;
    
    await supabase.from('content_updates').delete().eq('id', id);
    loadUpdates();
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('content_updates')
      .update({ published: !currentStatus })
      .eq('id', id);
    loadUpdates();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-[#00FF7F] mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00FF7F] to-[#00CC66] py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-[#0D0D0D]" />
            <h1 className="text-3xl font-bold text-[#0D0D0D]">Painel Administrativo</h1>
          </div>
          <p className="text-[#0D0D0D]/80 text-sm">Gerencie todo o conteúdo da plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1A1A1A] border-b border-[#252525] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'recipes'
                  ? 'bg-[#00FF7F] text-[#0D0D0D]'
                  : 'bg-[#252525] text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Receitas
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-[#00FF7F] text-[#0D0D0D]'
                  : 'bg-[#252525] text-gray-400 hover:text-white'
              }`}
            >
              <Tag className="w-5 h-5" />
              Categorias
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-[#00FF7F] text-[#0D0D0D]'
                  : 'bg-[#252525] text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === 'updates'
                  ? 'bg-[#00FF7F] text-[#0D0D0D]'
                  : 'bg-[#252525] text-gray-400 hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
              Atualizações
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Receitas */}
        {activeTab === 'recipes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Gerenciar Receitas</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetRecipeForm();
                  setShowRecipeModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-xl font-bold hover:bg-[#00CC66] transition-all"
              >
                <Plus className="w-5 h-5" />
                Nova Receita
              </button>
            </div>

            <div className="grid gap-4">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#252525]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {recipe.image_url && (
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
                          {recipe.is_premium && (
                            <Crown className="w-5 h-5 text-[#FFD700]" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{recipe.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>⏱️ {recipe.prep_time} min</span>
                          <span>📁 {recipe.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRecipe(recipe)}
                        className="p-2 bg-[#252525] text-[#00FF7F] rounded-lg hover:bg-[#2A2A2A] transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="p-2 bg-[#252525] text-red-500 rounded-lg hover:bg-[#2A2A2A] transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorias */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Gerenciar Categorias</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setCategoryForm({ name: '', description: '', icon: '📁' });
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-xl font-bold hover:bg-[#00CC66] transition-all"
              >
                <Plus className="w-5 h-5" />
                Nova Categoria
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#252525]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 bg-[#252525] text-[#00FF7F] rounded-lg hover:bg-[#2A2A2A] transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 bg-[#252525] text-red-500 rounded-lg hover:bg-[#2A2A2A] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-gray-400 text-sm">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usuários */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Gerenciar Usuários</h2>
            <div className="bg-[#1A1A1A] rounded-2xl border border-[#252525] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#252525]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nome</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Premium</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Admin</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#252525]/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{user.full_name || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          {user.is_premium ? (
                            <Crown className="w-5 h-5 text-[#FFD700] mx-auto" />
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user.is_admin ? (
                            <CheckCircle className="w-5 h-5 text-[#00FF7F] mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_active 
                              ? 'bg-[#00FF7F]/20 text-[#00FF7F]' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={`p-2 rounded-lg transition-all ${
                              user.is_active
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                : 'bg-[#00FF7F]/20 text-[#00FF7F] hover:bg-[#00FF7F]/30'
                            }`}
                          >
                            {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Atualizações */}
        {activeTab === 'updates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Atualizações de Conteúdo</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setUpdateForm({ title: '', description: '', type: 'feature', published: false });
                  setShowUpdateModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-xl font-bold hover:bg-[#00CC66] transition-all"
              >
                <Plus className="w-5 h-5" />
                Nova Atualização
              </button>
            </div>

            <div className="grid gap-4">
              {updates.map((update) => (
                <div key={update.id} className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#252525]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{update.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          update.type === 'feature' ? 'bg-blue-500/20 text-blue-400' :
                          update.type === 'improvement' ? 'bg-green-500/20 text-green-400' :
                          update.type === 'bugfix' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {update.type}
                        </span>
                        {update.published && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00FF7F]/20 text-[#00FF7F]">
                            Publicado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{update.description}</p>
                      <p className="text-gray-600 text-xs">
                        {new Date(update.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(update.id, update.published)}
                        className={`p-2 rounded-lg transition-all ${
                          update.published
                            ? 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A]'
                            : 'bg-[#00FF7F]/20 text-[#00FF7F] hover:bg-[#00FF7F]/30'
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="p-2 bg-[#252525] text-red-500 rounded-lg hover:bg-[#2A2A2A] transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Receita */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#252525] p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {editingItem ? 'Editar Receita' : 'Nova Receita'}
              </h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="p-2 hover:bg-[#252525] rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Título</label>
                <input
                  type="text"
                  value={recipeForm.title}
                  onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  placeholder="Nome da receita"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição</label>
                <textarea
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none h-24 resize-none"
                  placeholder="Descrição breve da receita"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Categoria</label>
                  <select
                    value={recipeForm.category}
                    onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Tempo (min)</label>
                  <input
                    type="number"
                    value={recipeForm.prep_time}
                    onChange={(e) => setRecipeForm({ ...recipeForm, prep_time: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">URL da Imagem</label>
                <input
                  type="text"
                  value={recipeForm.image_url}
                  onChange={(e) => setRecipeForm({ ...recipeForm, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Ingredientes (um por linha)</label>
                <textarea
                  value={recipeForm.ingredients}
                  onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none h-32 resize-none font-mono text-sm"
                  placeholder="2 xícaras de farinha&#10;1 xícara de açúcar&#10;3 ovos"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Modo de Preparo (um passo por linha)</label>
                <textarea
                  value={recipeForm.instructions}
                  onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none h-32 resize-none font-mono text-sm"
                  placeholder="Misture os ingredientes secos&#10;Adicione os ovos&#10;Asse por 30 minutos"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Calorias</label>
                  <input
                    type="number"
                    value={recipeForm.calories}
                    onChange={(e) => setRecipeForm({ ...recipeForm, calories: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Proteínas (g)</label>
                  <input
                    type="number"
                    value={recipeForm.protein}
                    onChange={(e) => setRecipeForm({ ...recipeForm, protein: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Carboidratos (g)</label>
                  <input
                    type="number"
                    value={recipeForm.carbs}
                    onChange={(e) => setRecipeForm({ ...recipeForm, carbs: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Gorduras (g)</label>
                  <input
                    type="number"
                    value={recipeForm.fat}
                    onChange={(e) => setRecipeForm({ ...recipeForm, fat: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#252525] rounded-xl">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={recipeForm.is_premium}
                  onChange={(e) => setRecipeForm({ ...recipeForm, is_premium: e.target.checked })}
                  className="w-5 h-5 rounded border-[#2A2A2A] text-[#00FF7F] focus:ring-[#00FF7F]"
                />
                <label htmlFor="is_premium" className="text-white font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#FFD700]" />
                  Receita Premium
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="flex-1 px-6 py-3 bg-[#252525] text-white rounded-xl font-bold hover:bg-[#2A2A2A] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRecipe}
                  className="flex-1 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-xl font-bold hover:bg-[#00CC66] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl max-w-md w-full">
            <div className="border-b border-[#252525] p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {editingItem ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-[#252525] rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Nome</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none h-24 resize-none"
                  placeholder="Descrição da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Ícone (emoji)</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none text-center text-4xl"
                  placeholder="📁"
                  maxLength={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-6 py-3 bg-[#252525] text-white rounded-xl font-bold hover:bg-[#2A2A2A] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-xl font-bold hover:bg-[#00CC66] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atualização */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl max-w-md w-full">
            <div className="border-b border-[#252525] p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {editingItem ? 'Editar Atualização' : 'Nova Atualização'}
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 hover:bg-[#252525] rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Título</label>
                <input
                  type="text"
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                  placeholder="Título da atualização"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Descrição</label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none h-32 resize-none"
                  placeholder="Descrição detalhada"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tipo</label>
                <select
                  value={updateForm.type}
                  onChange={(e) => setUpdateForm({ ...updateForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-xl border border-[#2A2A2A] focus:border-[#00FF7F] focus:outline-none"
                >
                  <option value="feature">Nova Funcionalidade</option>
                  <option value="improvement">Melhoria</option>
                  <option value="bugfix">Correção de Bug</option>
                  <option value="announcement">Anúncio</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#252525] rounded-xl">
                <input
                  type="checkbox"
                  id="published"
                  checked={updateForm.published}
                  onChange={(e) => setUpdateForm({ ...updateForm, published: e.target.checked })}
                  className="w-5 h-5 rounded border-[#2A2A2A] text-[#00FF7F] focus:ring-[#00FF7F]"
                />
                <label htmlFor="published" className="text-white font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#00FF7F]" />
                  Publicar Imediatamente
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-6 py-3 bg-[#252525] text-white rounded-xl font-bold hover:bg-[#2A2A2A] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUpdate}
                  className="flex-1 px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-xl font-bold hover:bg-[#00CC66] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
