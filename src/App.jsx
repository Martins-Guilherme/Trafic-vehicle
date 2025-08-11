import React, { useState, useEffect } from "react";
import {
  Car,
  Plus,
  DollarSign,
  BarChart3,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import "./App.css";

const FleetManagementApp = () => {
  const [currentView, setCurrentView] = useState("dashboard");

  // Função para carregar dados do localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
      return defaultValue;
    }
  };

  // Função para salvar dados no localStorage
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  // Dados iniciais (só serão usados se não houver dados salvos)
  const initialVehicles = [];

  const initialExpenses = [];

  // Estados com dados do localStorage
  const [vehicles, setVehicles] = useState(() =>
    loadFromStorage("fleet_vehicles", initialVehicles)
  );
  const [expenses, setExpenses] = useState(() =>
    loadFromStorage("fleet_expenses", initialExpenses)
  );

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Salvar automaticamente quando os dados mudarem
  useEffect(() => {
    saveToStorage("fleet_vehicles", vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveToStorage("fleet_expenses", expenses);
  }, [expenses]);

  const expenseTypes = {
    combustivel: "Combustível",
    manutencao: "Manutenção",
    seguro: "Seguro",
    ipva: "IPVA",
    multas: "Multas",
    outros: "Outros",
  };

  // Funções para calcular estatísticas
  const getStoreExpenses = (store) => {
    const storeVehicles = vehicles.filter((v) => v.store === store);
    return expenses
      .filter((e) => storeVehicles.some((v) => v.id === e.vehicleId))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const getExpensesByType = () => {
    const byType = {};
    expenses.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + e.amount;
    });
    return byType;
  };

  const getVehicleById = (id) => vehicles.find((v) => v.id === id);

  // Função para limpar todos os dados (útil para reset)
  const clearAllData = () => {
    if (
      // eslint-disable-next-line no-alert, no-restricted-globals
      confirm(
        "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita."
      )
    ) {
      localStorage.removeItem("fleet_vehicles");
      localStorage.removeItem("fleet_expenses");
      setVehicles(initialVehicles);
      setExpenses(initialExpenses);
    }
  };

  // Função para exportar dados
  const exportData = () => {
    const data = {
      vehicles,
      expenses,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frota-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para importar dados
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.vehicles && data.expenses) {
            setVehicles(data.vehicles);
            setExpenses(data.expenses);
            alert("Dados importados com sucesso!");
          } else {
            alert("Arquivo inválido. Verifique o formato dos dados.");
          }
        } catch (error) {
          alert(
            "Erro ao importar dados. Verifique se o arquivo está no formato correto."
          );
        }
      };
      reader.readAsText(file);
    }
  };

  // Componente Dashboard
  const Dashboard = () => {
    const store1Total = getStoreExpenses("Loja 1");
    const store2Total = getStoreExpenses("Loja 2");
    const totalExpenses = getTotalExpenses();
    const expensesByType = getExpensesByType();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Loja 1 - Total</p>
                <p className="text-3xl font-bold">
                  R$ {store1Total.toFixed(2)}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Loja 2 - Total</p>
                <p className="text-3xl font-bold">
                  R$ {store2Total.toFixed(2)}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Geral</p>
                <p className="text-3xl font-bold">
                  R$ {totalExpenses.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Gastos por Categoria
            </h3>
            <div className="space-y-3">
              {Object.entries(expensesByType).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600">{expenseTypes[type]}</span>
                  <span className="font-semibold text-gray-900">
                    R$ {amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Veículos por Loja
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Loja 1</span>
                <span className="font-semibold text-blue-600">
                  {vehicles.filter((v) => v.store === "Loja 1").length} veículos
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Loja 2</span>
                <span className="font-semibold text-green-600">
                  {vehicles.filter((v) => v.store === "Loja 2").length} veículos
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Últimos Gastos</h3>
            <div className="flex space-x-2">
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-2 py-2 rounded text-xs hover:bg-green-700"
              >
                Exportar Dados
              </button>
              <label className="bg-blue-600 text-white px-2 py-2 rounded text-xs hover:bg-blue-700 cursor-pointer">
                Importar Dados
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearAllData}
                className="bg-red-600 text-white px-2 py-2 rounded text-xs hover:bg-red-700"
              >
                Limpar Dados
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Data</th>
                  <th className="text-left py-2">Veículo</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Valor</th>
                  <th className="text-left py-2">Loja</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .slice(-5)
                  .reverse()
                  .map((expense) => {
                    const vehicle = getVehicleById(expense.vehicleId);
                    return (
                      <tr
                        key={expense.id}
                        className="border-b px-2 hover:bg-gray-50"
                      >
                        <td className="px-3">
                          {new Date(expense.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-2">{vehicle?.plate}</td>
                        <td className="px-2">{expenseTypes[expense.type]}</td>
                        <td className="px-2 font-semibold">
                          R$ {expense.amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-2 rounded text-left text-xs ${
                              vehicle?.store === "Loja 1"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {vehicle?.store}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Componente de Veículos
  const VehiclesView = () => {
    const handleAddVehicle = () => {
      setModalType("vehicle");
      setEditingItem(null);
      setShowModal(true);
    };

    const handleEditVehicle = (vehicle) => {
      setModalType("vehicle");
      setEditingItem(vehicle);
      setShowModal(true);
    };

    const handleDeleteVehicle = (id) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Tem certeza que deseja excluir este veículo?")) {
        setVehicles(vehicles.filter((v) => v.id !== id));
        setExpenses(expenses.filter((e) => e.vehicleId !== id));
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gerenciar Veículos</h2>
          <button
            onClick={handleAddVehicle}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const vehicleExpenses = expenses.filter(
              (e) => e.vehicleId === vehicle.id
            );
            const totalExpense = vehicleExpenses.reduce(
              (sum, e) => sum + e.amount,
              0
            );

            return (
              <div
                key={vehicle.id}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                    <p className="text-gray-600">
                      {vehicle.model} ({vehicle.year})
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      vehicle.store === "Loja 1"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {vehicle.store}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600">Total de gastos:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {totalExpense.toFixed(2)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente de Gastos
  const ExpensesView = () => {
    const [filterStore, setFilterStore] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const filteredExpenses = expenses.filter((expense) => {
      const vehicle = getVehicleById(expense.vehicleId);
      const storeMatch =
        filterStore === "all" || vehicle?.store === filterStore;
      const typeMatch = filterType === "all" || expense.type === filterType;
      return storeMatch && typeMatch;
    });

    const handleAddExpense = () => {
      setModalType("expense");
      setEditingItem(null);
      setShowModal(true);
    };

    const handleEditExpense = (expense) => {
      setModalType("expense");
      setEditingItem(expense);
      setShowModal(true);
    };

    const handleDeleteExpense = (id) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Tem certeza que deseja excluir este gasto?")) {
        setExpenses(expenses.filter((e) => e.id !== id));
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gerenciar Gastos</h2>
          <button
            onClick={handleAddExpense}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Gasto
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Loja
              </label>
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Todas as lojas</option>
                <option value="Loja 1">Loja 1</option>
                <option value="Loja 2">Loja 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Todos os tipos</option>
                {Object.entries(expenseTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Data</th>
                  <th className="text-left py-3">Veículo</th>
                  <th className="text-left py-3">Loja</th>
                  <th className="text-left py-3">Tipo</th>
                  <th className="text-left py-3">Descrição</th>
                  <th className="text-left py-3">Valor</th>
                  <th className="text-left py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const vehicle = getVehicleById(expense.vehicleId);
                  return (
                    <tr
                      key={expense.id}
                      className="border-b hover:bg-gray-50 text-center"
                    >
                      <td className="px-3 py-2">
                        {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-3 py-2">{vehicle?.plate}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-1 py-2 rounded text-xs ${
                            vehicle?.store === "Loja 1"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {vehicle?.store}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {expenseTypes[expense.type]}
                      </td>
                      <td className="px-3 py-2">{expense.description}</td>
                      <td className="px-5 py-2 font-semibold">
                        R$ {expense.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Modal Component
  const Modal = () => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
      if (editingItem) {
        setFormData(editingItem);
      } else {
        setFormData(
          modalType === "vehicle"
            ? {
                plate: "",
                model: "",
                store: "Loja 1",
                year: new Date().getFullYear(),
              }
            : {
                vehicleId: "",
                type: "combustivel",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                description: "",
              }
        );
      }
    }, []);

    const handleSubmit = () => {
      if (modalType === "vehicle") {
        if (editingItem) {
          setVehicles(
            vehicles.map((v) =>
              v.id === editingItem.id ? { ...formData, id: editingItem.id } : v
            )
          );
        } else {
          const newId = Math.max(...vehicles.map((v) => v.id), 0) + 1;
          setVehicles([...vehicles, { ...formData, id: newId }]);
        }
      } else {
        if (editingItem) {
          setExpenses(
            expenses.map((e) =>
              e.id === editingItem.id
                ? {
                    ...formData,
                    id: editingItem.id,
                    amount: parseFloat(formData.amount),
                  }
                : e
            )
          );
        } else {
          const newId = Math.max(...expenses.map((e) => e.id), 0) + 1;
          setExpenses([
            ...expenses,
            {
              ...formData,
              id: newId,
              vehicleId: parseInt(formData.vehicleId),
              amount: parseFloat(formData.amount),
            },
          ]);
        }
      }

      setShowModal(false);
      setEditingItem(null);
    };

    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? "Editar" : "Adicionar"}{" "}
            {modalType === "vehicle" ? "Veículo" : "Gasto"}
          </h3>

          <div className="space-y-4">
            {modalType === "vehicle" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={formData.plate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, plate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loja
                  </label>
                  <select
                    value={formData.store || "Loja 1"}
                    onChange={(e) =>
                      setFormData({ ...formData, store: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Loja 1">Loja 1</option>
                    <option value="Loja 2">Loja 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={formData.year || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veículo
                  </label>
                  <select
                    value={formData.vehicleId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleId: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.model} ({vehicle.store})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type || "combustivel"}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(expenseTypes).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {editingItem ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center ">
              <Car className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                Controle de Frota
              </h1>
            </div>
            <div className="mr-0 p-2 rounded-lg w-fill flex items-center">
              <img src="./logo.png" alt="Imagem da logo" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("vehicles")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === "vehicles"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Car className="h-4 w-4 inline mr-2" />
              Veículos
            </button>
            <button
              onClick={() => setCurrentView("expenses")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === "expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <DollarSign className="h-4 w-4 inline mr-2" />
              Gastos
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "vehicles" && <VehiclesView />}
        {currentView === "expenses" && <ExpensesView />}
      </main>

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default FleetManagementApp;
