"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, MapPin, CreditCard, Clock, User, Phone, Home, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "../../contexts/CartContext"

interface CustomerInfo {
  name: string
  phone: string
  paymentMethod: 'pix' | 'card' | 'cash'
  changeAmount?: string
  address: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    cep: string
    reference: string
  }
}

export default function CarrinhoPage() {
  const { cart, updateQuantity, removeItem, getTotalItems, getSubtotal } = useCart()
  const router = useRouter()
  const [cep, setCep] = useState("")
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null)
  const [isCheckingCep, setIsCheckingCep] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery')
  const [errors, setErrors] = useState<string[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    paymentMethod: 'pix',
    changeAmount: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      cep: '',
      reference: ''
    }
  })

  const checkCep = async () => {
    if (!cep || cep.length !== 8) return
    
    setIsCheckingCep(true)
    
    // Simula verificação de CEP
    setTimeout(() => {
      // CEPs que começam com 0, 1, 2, 3 têm entrega disponível
      const firstDigit = parseInt(cep[0])
      setDeliveryAvailable(firstDigit <= 3)
      setIsCheckingCep(false)
      
      // Se CEP válido, preenche automaticamente alguns campos
      if (firstDigit <= 3) {
        setCustomerInfo(prev => ({
          ...prev,
          address: {
            ...prev.address,
            cep: cep,
            city: 'São Paulo',
            neighborhood: 'Centro'
          }
        }))
      }
    }, 1500)
  }

  const getItemPrice = (priceString: string) => {
    return parseFloat(priceString.replace('R$ ', '').replace(',', '.'))
  }

  const getItemTotal = (item: any) => {
    const basePrice = getItemPrice(item.price)
    // Calcular preço dos extras baseado nos dados reais
    const extrasPrice = item.extras.length * 8 // Preço médio dos extras
    return (basePrice + extrasPrice) * item.quantity
  }

  const getDeliveryFee = () => {
    return deliveryOption === 'delivery' && deliveryAvailable ? 8.00 : 0
  }

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee()
  }

  const validateForm = () => {
    const newErrors: string[] = []

    // Validar dados básicos
    if (!customerInfo.name.trim()) {
      newErrors.push('Nome completo é obrigatório')
    }

    if (!customerInfo.phone.trim()) {
      newErrors.push('Telefone é obrigatório')
    }

    // Validar entrega
    if (deliveryOption === 'delivery') {
      if (!deliveryAvailable) {
        newErrors.push('Verifique se entregamos na sua região')
      }
      
      if (!customerInfo.address.street.trim()) {
        newErrors.push('Endereço (rua) é obrigatório para entrega')
      }
      
      if (!customerInfo.address.number.trim()) {
        newErrors.push('Número do endereço é obrigatório para entrega')
      }
      
      if (!customerInfo.address.neighborhood.trim()) {
        newErrors.push('Bairro é obrigatório para entrega')
      }
      
      if (!customerInfo.address.city.trim()) {
        newErrors.push('Cidade é obrigatória para entrega')
      }
      
      if (!customerInfo.address.cep.trim()) {
        newErrors.push('CEP é obrigatório para entrega')
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleFinalizePedido = () => {
    if (!validateForm()) {
      // Scroll para o topo para mostrar os erros
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Criar dados do pedido para passar para a página de acompanhamento
    const orderData = {
      id: Date.now().toString(),
      items: cart,
      customer: customerInfo,
      delivery: {
        option: deliveryOption,
        fee: getDeliveryFee()
      },
      totals: {
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        total: getTotal()
      },
      estimatedTime: deliveryOption === 'delivery' ? '45-60 min' : '25-35 min',
      status: 'confirmed',
      timestamp: new Date().toISOString()
    }

    // Salvar no localStorage para acessar na página de acompanhamento
    localStorage.setItem('currentOrder', JSON.stringify(orderData))
    
    // Redirecionar para página de acompanhamento
    router.push('/pedido')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-geist-sans">
                Seu Carrinho
              </h1>
              <p className="text-lg opacity-90">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} selecionados
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Erros de Validação */}
      {errors.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-4">
            <h4 className="font-bold mb-2">Por favor, corrija os seguintes erros:</h4>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          // Carrinho Vazio
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Carrinho vazio</h2>
              <p className="text-gray-600 mb-6">
                Adicione alguns pratos deliciosos ao seu carrinho!
              </p>
              <Link 
                href="/"
                className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
              >
                Ver Cardápio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Items do Carrinho */}
            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Itens do Pedido</h2>
              
              {cart.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-lg font-semibold text-amber-600">{item.price}</p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Extras */}
                  {item.extras.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Adicionais:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.extras.map((extra, i) => (
                          <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            + {extra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredientes Removidos */}
                  {item.removedIngredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Sem:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.removedIngredients.map((ingredient, i) => (
                          <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            - {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {item.observations && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Observações:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        {item.observations}
                      </p>
                    </div>
                  )}

                  {/* Quantidade e Total */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">
                        R$ {getItemTotal(item).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar - Informações e Resumo */}
            <div className="space-y-6">
              {/* Dados do Cliente */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  Seus Dados
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite seu nome"
                      className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 ${
                        errors.some(error => error.includes('Nome')) 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-200 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefone/WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 ${
                        errors.some(error => error.includes('Telefone')) 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-gray-200 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Opção de Entrega */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Forma de Recebimento
                </h3>
                
                <div className="space-y-4 mb-6">
                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={deliveryOption === 'delivery'}
                      onChange={(e) => setDeliveryOption(e.target.value as 'delivery')}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                    />
                    <MapPin className="w-6 h-6 text-amber-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Entrega</p>
                      <p className="text-sm text-gray-600">Receba em casa</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryOption === 'pickup'}
                      onChange={(e) => setDeliveryOption(e.target.value as 'pickup')}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                    />
                    <Clock className="w-6 h-6 text-amber-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Retirada</p>
                      <p className="text-sm text-gray-600">Retire no balcão</p>
                    </div>
                  </label>
                </div>

                {/* Verificação de CEP e Endereço para entrega */}
                {deliveryOption === 'delivery' && (
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Digite seu CEP (apenas números)"
                        value={cep}
                        onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                      />
                      <button
                        onClick={checkCep}
                        disabled={isCheckingCep || cep.length !== 8}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingCep ? "..." : "OK"}
                      </button>
                    </div>
                    
                    {deliveryAvailable !== null && (
                      <div className={`p-4 rounded-xl text-sm font-medium ${deliveryAvailable ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {deliveryAvailable 
                          ? "✅ Entregamos na sua região!"
                          : "❌ Não entregamos na sua região. Escolha retirada no balcão."
                        }
                      </div>
                    )}

                    {/* Campos de Endereço */}
                    {deliveryAvailable && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Endereço de Entrega
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Rua/Avenida *"
                            value={customerInfo.address.street}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              address: { ...prev.address, street: e.target.value }
                            }))}
                            className={`col-span-2 px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 ${
                              errors.some(error => error.includes('rua')) 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-gray-200 focus:border-amber-500'
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Nº *"
                            value={customerInfo.address.number}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              address: { ...prev.address, number: e.target.value }
                            }))}
                            className={`px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 ${
                              errors.some(error => error.includes('Número')) 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-gray-200 focus:border-amber-500'
                            }`}
                          />
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Complemento (apto, bloco, etc.)"
                          value={customerInfo.address.complement}
                          onChange={(e) => setCustomerInfo(prev => ({
                            ...prev,
                            address: { ...prev.address, complement: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Bairro *"
                            value={customerInfo.address.neighborhood}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              address: { ...prev.address, neighborhood: e.target.value }
                            }))}
                            className={`px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 ${
                              errors.some(error => error.includes('Bairro')) 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-gray-200 focus:border-amber-500'
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Cidade *"
                            value={customerInfo.address.city}
                            onChange={(e) => setCustomerInfo(prev => ({
                              ...prev,
                              address: { ...prev.address, city: e.target.value }
                            }))}
                            className={`px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 ${
                              errors.some(error => error.includes('Cidade')) 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-gray-200 focus:border-amber-500'
                            }`}
                          />
                        </div>
                        
                        <textarea
                          placeholder="Ponto de referência (ex: próximo ao mercado, portão azul, etc.)"
                          value={customerInfo.address.reference}
                          onChange={(e) => setCustomerInfo(prev => ({
                            ...prev,
                            address: { ...prev.address, reference: e.target.value }
                          }))}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  Forma de Pagamento
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={customerInfo.paymentMethod === 'pix'}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as 'pix' }))}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">PIX</p>
                      <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={customerInfo.paymentMethod === 'card'}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as 'card' }))}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Cartão</p>
                      <p className="text-sm text-gray-600">Débito ou crédito</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={customerInfo.paymentMethod === 'cash'}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' }))}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Dinheiro</p>
                      <p className="text-sm text-gray-600">Pagamento na entrega/retirada</p>
                    </div>
                  </label>

                  {/* Campo de Troco - aparece apenas quando "Dinheiro" é selecionado */}
                  {customerInfo.paymentMethod === 'cash' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Troco para:
                      </label>
                      <input
                        type="text"
                        value={customerInfo.changeAmount}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, changeAmount: e.target.value }))}
                        placeholder="Ex: R$ 50,00 (deixe vazio se não precisar de troco)"
                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                      />
                      <p className="text-xs text-amber-700 mt-2">
                        Informe o valor para o entregador levar o troco
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo de Valores */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo do Pedido</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} itens)</span>
                    <span className="font-semibold">R$ {getSubtotal().toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {deliveryOption === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de entrega</span>
                      <span className="font-semibold">
                        {deliveryAvailable === false ? 'N/A' : `R$ ${getDeliveryFee().toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-amber-600">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                {/* Tempo estimado */}
                <div className="bg-amber-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Tempo estimado: {deliveryOption === 'delivery' ? '45-60 min' : '25-35 min'}
                    </span>
                  </div>
                </div>

                {/* Botão Finalizar */}
                <button 
                  onClick={handleFinalizePedido}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2 font-geist-sans">Sabor & Arte</h3>
          <p className="text-gray-300 text-sm">
            Rua das Delícias, 123 - Centro | Tel: (11) 9999-8888
          </p>
        </div>
      </footer>
    </div>
  )
}