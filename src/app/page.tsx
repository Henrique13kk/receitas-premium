"use client"

import { useState } from "react"
import { Star, Clock, Users, ChefHat, ShoppingCart, MapPin, Plus, Minus, X } from "lucide-react"
import Link from "next/link"
import { useCart, CartItem } from "../contexts/CartContext"

interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  image: string
  rating: number
  prepTime: string
  ingredients: string[]
  extras: { name: string; price: number }[]
}

export default function MenuPage() {
  const { cart, addToCart, getTotalItems } = useCart()
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [cep, setCep] = useState("")
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null)
  const [isCheckingCep, setIsCheckingCep] = useState(false)

  // Estados do modal de personalização
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([])
  const [observations, setObservations] = useState("")
  const [quantity, setQuantity] = useState(1)

  const menuCategories = [
    {
      id: "entradas",
      name: "Entradas",
      icon: <ChefHat className="w-6 h-6" />,
      items: [
        {
          id: 1,
          name: "Bruschetta Artesanal",
          description: "Pão italiano tostado com tomates frescos, manjericão, alho e azeite extra virgem",
          price: "R$ 28,00",
          image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop",
          rating: 4.8,
          prepTime: "10 min",
          ingredients: ["Pão italiano", "Tomates frescos", "Manjericão", "Alho", "Azeite extra virgem"],
          extras: [
            { name: "Queijo brie", price: 8 },
            { name: "Presunto parma", price: 12 },
            { name: "Rúcula", price: 4 }
          ]
        },
        {
          id: 2,
          name: "Carpaccio de Salmão",
          description: "Fatias finas de salmão fresco com alcaparras, rúcula e molho de mostarda e mel",
          price: "R$ 42,00",
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
          rating: 4.9,
          prepTime: "15 min",
          ingredients: ["Salmão fresco", "Alcaparras", "Rúcula", "Molho de mostarda e mel"],
          extras: [
            { name: "Cream cheese", price: 6 },
            { name: "Torrada extra", price: 5 },
            { name: "Limão siciliano", price: 3 }
          ]
        },
        {
          id: 3,
          name: "Coxinha Gourmet de Camarão",
          description: "Coxinha artesanal recheada com camarão ao catupiry e ervas finas",
          price: "R$ 35,00",
          image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          rating: 4.7,
          prepTime: "12 min",
          ingredients: ["Massa de mandioca", "Camarão", "Catupiry", "Ervas finas"],
          extras: [
            { name: "Molho picante", price: 3 },
            { name: "Coxinha extra", price: 15 },
            { name: "Molho tártaro", price: 4 }
          ]
        }
      ]
    },
    {
      id: "principais",
      name: "Pratos Principais",
      icon: <ChefHat className="w-6 h-6" />,
      items: [
        {
          id: 4,
          name: "Salmão Grelhado com Quinoa",
          description: "Filé de salmão grelhado acompanhado de quinoa tricolor, legumes salteados e molho de ervas",
          price: "R$ 68,00",
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
          rating: 4.9,
          prepTime: "25 min",
          ingredients: ["Filé de salmão", "Quinoa tricolor", "Legumes salteados", "Molho de ervas"],
          extras: [
            { name: "Batata rústica", price: 8 },
            { name: "Aspargos grelhados", price: 12 },
            { name: "Molho hollandaise", price: 6 }
          ]
        },
        {
          id: 5,
          name: "Risotto de Cogumelos Selvagens",
          description: "Arroz arbóreo cremoso com mix de cogumelos, parmesão envelhecido e trufa negra",
          price: "R$ 58,00",
          image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
          rating: 4.8,
          prepTime: "30 min",
          ingredients: ["Arroz arbóreo", "Mix de cogumelos", "Parmesão envelhecido", "Trufa negra"],
          extras: [
            { name: "Cogumelos extras", price: 10 },
            { name: "Parmesão extra", price: 8 },
            { name: "Vinho branco", price: 15 }
          ]
        },
        {
          id: 6,
          name: "Picanha Premium na Brasa",
          description: "Picanha argentina grelhada na brasa, acompanha batatas rústicas e vinagrete especial",
          price: "R$ 89,00",
          image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
          rating: 4.9,
          prepTime: "35 min",
          ingredients: ["Picanha argentina", "Batatas rústicas", "Vinagrete especial", "Sal grosso"],
          extras: [
            { name: "Farofa especial", price: 8 },
            { name: "Queijo coalho", price: 12 },
            { name: "Molho chimichurri", price: 6 }
          ]
        }
      ]
    },
    {
      id: "sobremesas",
      name: "Sobremesas",
      icon: <ChefHat className="w-6 h-6" />,
      items: [
        {
          id: 8,
          name: "Tiramisù da Casa",
          description: "Clássico italiano com café espresso, mascarpone, cacau e biscoitos savoiardi",
          price: "R$ 32,00",
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
          rating: 4.8,
          prepTime: "5 min",
          ingredients: ["Café espresso", "Mascarpone", "Cacau", "Biscoitos savoiardi"],
          extras: [
            { name: "Sorvete de baunilha", price: 8 },
            { name: "Calda de chocolate", price: 5 },
            { name: "Chantilly", price: 4 }
          ]
        },
        {
          id: 9,
          name: "Petit Gâteau de Chocolate Belga",
          description: "Bolinho quente de chocolate com centro cremoso, acompanha sorvete de baunilha",
          price: "R$ 28,00",
          image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
          rating: 4.9,
          prepTime: "15 min",
          ingredients: ["Chocolate belga", "Farinha", "Ovos", "Sorvete de baunilha"],
          extras: [
            { name: "Sorvete extra", price: 6 },
            { name: "Calda de frutas vermelhas", price: 5 },
            { name: "Castanhas", price: 4 }
          ]
        },
        {
          id: 10,
          name: "Cheesecake de Frutas Vermelhas",
          description: "Cheesecake cremoso com calda de frutas vermelhas e base de biscoito graham",
          price: "R$ 26,00",
          image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop",
          rating: 4.7,
          prepTime: "5 min",
          ingredients: ["Cream cheese", "Frutas vermelhas", "Biscoito graham", "Açúcar"],
          extras: [
            { name: "Frutas frescas extras", price: 6 },
            { name: "Chantilly", price: 4 },
            { name: "Calda extra", price: 3 }
          ]
        }
      ]
    },
    {
      id: "bebidas",
      name: "Bebidas",
      icon: <ChefHat className="w-6 h-6" />,
      items: [
        {
          id: 11,
          name: "Vinho Tinto Reserva",
          description: "Cabernet Sauvignon argentino, corpo médio com notas de frutas vermelhas",
          price: "R$ 45,00",
          image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
          rating: 4.8,
          prepTime: "Imediato",
          ingredients: ["Cabernet Sauvignon"],
          extras: [
            { name: "Taça extra", price: 45 },
            { name: "Queijos especiais", price: 25 },
            { name: "Tábua de frios", price: 35 }
          ]
        },
        {
          id: 12,
          name: "Caipirinha Premium",
          description: "Cachaça artesanal com limão tahiti, açúcar demerara e gelo cristal",
          price: "R$ 22,00",
          image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
          rating: 4.6,
          prepTime: "3 min",
          ingredients: ["Cachaça artesanal", "Limão tahiti", "Açúcar demerara", "Gelo cristal"],
          extras: [
            { name: "Dose dupla", price: 12 },
            { name: "Frutas variadas", price: 6 },
            { name: "Caipirinha extra", price: 22 }
          ]
        },
        {
          id: 13,
          name: "Suco Natural Detox",
          description: "Couve, maçã verde, gengibre, limão e hortelã - rico em vitaminas",
          price: "R$ 18,00",
          image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop",
          rating: 4.5,
          prepTime: "5 min",
          ingredients: ["Couve", "Maçã verde", "Gengibre", "Limão", "Hortelã"],
          extras: [
            { name: "Chia", price: 4 },
            { name: "Proteína whey", price: 8 },
            { name: "Copo extra", price: 18 }
          ]
        }
      ]
    }
  ]

  const checkCep = async () => {
    if (!cep || cep.length !== 8) return
    
    setIsCheckingCep(true)
    
    // Simula verificação de CEP
    setTimeout(() => {
      // CEPs que começam com 0, 1, 2, 3 têm entrega disponível
      const firstDigit = parseInt(cep[0])
      setDeliveryAvailable(firstDigit <= 3)
      setIsCheckingCep(false)
    }, 1500)
  }

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item)
    setSelectedExtras([])
    setRemovedIngredients([])
    setObservations("")
    setQuantity(1)
    setShowItemModal(true)
  }

  const closeItemModal = () => {
    setShowItemModal(false)
    setSelectedItem(null)
  }

  const toggleExtra = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) 
        ? prev.filter(e => e !== extraName)
        : [...prev, extraName]
    )
  }

  const toggleRemovedIngredient = (ingredient: string) => {
    setRemovedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    )
  }

  const handleAddToCart = () => {
    if (!selectedItem) return

    const cartItem: CartItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
      extras: selectedExtras,
      removedIngredients,
      observations
    }

    addToCart(cartItem)
    closeItemModal()
  }

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-geist-sans">
                Sabor & Arte
              </h1>
              <p className="text-lg opacity-90">
                Experiência gastronômica única
              </p>
            </div>
            
            {/* Carrinho */}
            <div className="relative">
              <Link 
                href="/carrinho"
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/30 transition-all"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="font-semibold">Carrinho</span>
                {getTotalItems() > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* CEP Verification */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 text-white mb-3">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Verificar entrega:</span>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Digite seu CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="flex-1 px-4 py-2 mx-2 rounded-lg text-gray-800 placeholder-white border-2 border-white/30"
              />
              <button
                onClick={checkCep}
                disabled={isCheckingCep || cep.length !== 8}
                className="bg-white text-amber-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingCep ? "Verificando..." : "Verificar"}
              </button>
            </div>
            
            {deliveryAvailable !== null && (
              <div className={`mt-3 p-3 rounded-lg ${deliveryAvailable ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                {deliveryAvailable 
                  ? "✅ Entregamos na sua região! Taxa de entrega: R$ 8,00"
                  : "❌ Infelizmente não entregamos na sua região. Você pode retirar no balcão!"
                }
              </div>
            )}
          </div>

          {/* Category Navigation */}
          <div className="flex flex-wrap gap-2 justify-center">
            {menuCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/30 transition-all"
              >
                {category.icon}
                <span className="font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Categories */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {menuCategories.map((category) => (
          <section key={category.id} id={category.id} className="mb-16">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                {category.icon}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-geist-sans">
                {category.name}
              </h2>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {/* Item Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-800">
                        {item.rating}
                      </span>
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 font-geist-sans">
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-amber-600">
                        {item.price}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{item.prepTime}</span>
                      </div>
                      <button 
                        onClick={() => openItemModal(item)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:shadow-lg"
                      >
                        Pedir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Item Customization Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">{selectedItem.name}</h3>
              <button
                onClick={closeItemModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Item Image and Info */}
              <div className="flex gap-4 mb-6">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedItem.price}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Quantidade</h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Extras */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Adicionais</h4>
                <div className="space-y-2">
                  {selectedItem.extras.map((extra) => (
                    <label key={extra.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(extra.name)}
                        onChange={() => toggleExtra(extra.name)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span className="flex-1">{extra.name}</span>
                      <span className="font-semibold text-amber-600">+R$ {extra.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remove Ingredients */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Retirar ingredientes</h4>
                <div className="space-y-2">
                  {selectedItem.ingredients.map((ingredient) => (
                    <label key={ingredient} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removedIngredients.includes(ingredient)}
                        onChange={() => toggleRemovedIngredient(ingredient)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <span className="flex-1">{ingredient}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Observations */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Observações</h4>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Alguma observação especial? (ex: ponto da carne, alergia, etc.)"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:shadow-lg"
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 font-geist-sans">Sabor & Arte</h3>
          <p className="text-gray-300 mb-6">
            Rua das Delícias, 123 - Centro | Tel: (11) 9999-8888
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <span>Delivery disponível</span>
            <span>•</span>
            <span>Reservas pelo WhatsApp</span>
            <span>•</span>
            <span>Estacionamento gratuito</span>
          </div>
        </div>
      </footer>
    </div>
  )
}