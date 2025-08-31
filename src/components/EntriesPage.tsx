import React, { useState, useEffect } from 'react';
import './EntriesPage.css';

// Tipul pentru Entry
interface Entry {
  id: number;
  name: string;
  description: string;
}

// Mock data pentru demonstrație
const mockEntries: Entry[] = [
  {
    id: 1,
    name: "Prima Intrare",
    description: "Aceasta este o descriere detaliată pentru prima intrare din baza de date. Conține informații importante despre acest element."
  },
  {
    id: 2,
    name: "A Doua Intrare",
    description: "O altă intrare cu o descriere mai scurtă dar la fel de relevantă pentru demonstrația noastră."
  },
  {
    id: 3,
    name: "Intrarea cu Numele Lung",
    description: "Această intrare are un nume mai lung pentru a demonstra cum se comportă cardurile cu conținut variabil. Descrierea este și ea mai detaliată."
  },
  {
    id: 4,
    name: "Intrare Simplă",
    description: "Descriere minimală."
  },
  {
    id: 5,
    name: "Ultima Intrare de Test",
    description: "Aceasta este ultima intrare din setul nostru de teste, cu o descriere care demonstrează flexibilitatea layout-ului nostru responsive."
  }
];

const EntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulează încărcarea datelor din API
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      // Simulează delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEntries(mockEntries);
      setLoading(false);
    };

    loadEntries();
  }, []);

  // Handler pentru crearea unei intrări noi
  const handleNew = () => {
    console.log('🆕 Creating new entry...');
    // TODO: Implementează logica pentru crearea unei intrări noi
    // Exemplu: deschide modal sau navighează la pagină de creare
  };

  // Handler pentru editarea unei intrări
  const handleEdit = (entry: Entry) => {
    console.log('✏️ Editing entry:', entry);
    // TODO: Implementează logica pentru editarea intrării
    // Exemplu: deschide modal de editare sau navighează la pagină de editare
  };

  // Handler pentru actualizarea unei intrări
  const handleUpdate = (entry: Entry) => {
    console.log('🔄 Updating entry:', entry);
    // TODO: Implementează logica pentru actualizarea intrării
    // Exemplu: trimite request PUT la API
  };

  // Handler pentru ștergerea unei intrări
  const handleDelete = (entry: Entry) => {
    console.log('🗑️ Deleting entry:', entry);
    // TODO: Implementează logica pentru ștergerea intrării
    // Exemplu: afișează dialog de confirmare apoi trimite request DELETE
    
    // Simulare ștergere din state (pentru demonstrație)
    const confirmDelete = window.confirm(`Sigur vrei să ștergi intrarea "${entry.name}"?`);
    if (confirmDelete) {
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      console.log(`✅ Entry "${entry.name}" deleted successfully`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header cu titlu și buton New */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Database Entries
              </h1>
              <p className="mt-2 text-slate-600">
                Gestionează toate intrările din baza de date
              </p>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Conținutul principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading state
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Se încarcă intrările...</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Nicio intrare găsită
            </h3>
            <p className="mt-2 text-slate-500">
              Începe prin a crea prima intrare din baza de date.
            </p>
            <button
              onClick={handleNew}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Creează Prima Intrare
            </button>
          </div>
        ) : (
          // Grid cu entries
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight entry-title">
                      {entry.name}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
                      #{entry.id}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-6">
                  <p className="text-slate-600 text-sm leading-relaxed entry-description">
                    {entry.description}
                  </p>
                </div>

                {/* Card Footer cu butoane */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(entry)}
                      className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>

                    {/* Update Button */}
                    <button
                      onClick={() => handleUpdate(entry)}
                      className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(entry)}
                      title={`Șterge intrarea ${entry.name}`}
                      className="inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer cu informații */}
      <div className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
            <p>
              Total intrări: <span className="font-medium text-slate-700">{entries.length}</span>
            </p>
            <p className="mt-2 sm:mt-0">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntriesPage;
