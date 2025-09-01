import React, { useState, useEffect, useRef } from 'react';
import './VehicleForm.css';
import * as XLSX from 'xlsx';
import { 
  initializeDatabase, 
  testConnection, 
  addVehicle, 
  getAllVehicles, 
  deleteVehicle,
  updateVehicle,
  type Vehicle 
} from '../config/database';

const VehicleForm: React.FC = () => {
  // Funcție pentru calcularea datei automate pe baza perioadei
  const calculateExpiryDate = (period: '6_luni' | '1_an' | '2_ani'): string => {
    const today = new Date();
    let newDate = new Date(today);
    
    switch (period) {
      case '6_luni':
        newDate.setMonth(today.getMonth() + 6);
        break;
      case '1_an':
        newDate.setFullYear(today.getFullYear() + 1);
        break;
      case '2_ani':
        newDate.setFullYear(today.getFullYear() + 2);
        break;
    }
    
    return newDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Vehicle>({
    nr_inmatriculare: '',
    valabilitate: calculateExpiryDate('1_an'), // Calculează automat data pentru perioada default
    perioada_valabilitate: '1_an',
    nr_telefon: ''
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SMS Advert API Configuration - TESTED AND WORKING ✅
  const SMS_ADVERT_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGI0NTcwY2Y4MjkzYzRlM2Y2NmYzNWYifQ.4Jlpsb-Ure4i-x4y4nw8cff9p1A6LLMuJfIuIJg89N8';
  const SMS_ADVERT_BASE_URL = 'https://www.smsadvert.ro/api/sms/';

  useEffect(() => {
    initDatabase();
    // Adaugă date de test dacă nu există vehicule
    setTimeout(() => {
      addTestDataIfNeeded();
    }, 1000);
  }, []);

  // Adaugă date de test pentru demonstrație
  const addTestDataIfNeeded = async () => {
    try {
      const existingVehicles = await getAllVehicles();
      if (existingVehicles.length === 0) {
        // Adaugă un vehicul care expiră în 3 zile
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + 3);
        
        const testVehicle: Vehicle = {
          nr_inmatriculare: 'SV14YCP',
          valabilitate: expiryDate.toISOString().split('T')[0],
          perioada_valabilitate: '1_an' as const,
          nr_telefon: '0756596565'
        };
        
        await addVehicle(testVehicle);
        console.log('Vehicul de test adăugat cu succes');
      }
    } catch (error) {
      console.error('Eroare la adăugarea datelor de test:', error);
    }
  };

  const initDatabase = async () => {
    try {
      setLoading(true);
      await initializeDatabase();
      const connected = await testConnection();
      setDbConnected(connected);
      
      if (connected) {
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
      }
    } catch (error) {
      console.error('Eroare la inițializarea bazei de date:', error);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Send SMS notification via SMS Advert API
  const sendSMSNotification = async (vehicle: Vehicle) => {
    try {
      setLoading(true);
      const phoneNumber = vehicle.nr_telefon;
      const nrInmatriculare = vehicle.nr_inmatriculare;
      const valabilitate = vehicle.valabilitate;
      
      setMessage(`📱 Se trimite SMS către ${phoneNumber} pentru ${nrInmatriculare}...`);
      
      // Mesajul personalizat pentru vehicul - Template nou
      const personalizedMessage = `Buna ziua ! Expira ITP la autovehiculul cu numarul de inmatriculare ${nrInmatriculare} , in data de ${formatDate(valabilitate)}! Va asteptam pentru un nou ITP la adresa Izvoarelor 2C bis Radauti sau ne puteti contacta pentru o programare 0745025533- Vasile 0756596565- Adrian !`;
      
      setMessage(`📱 Se trimite SMS prin SMS Advert către ${phoneNumber} pentru ${nrInmatriculare}...`);

      // Pentru testare - logurile pentru debugging
      console.log('SMS Advert Request:', {
        url: SMS_ADVERT_BASE_URL,
        phone: phoneNumber,
        vehicul: nrInmatriculare,
        message: personalizedMessage,
        messageLength: personalizedMessage.length,
        token: SMS_ADVERT_API_TOKEN.substring(0, 20) + '...'
      });

      // Request către SMS Advert API - TESTED STRUCTURE ✅
      const response = await fetch(SMS_ADVERT_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': SMS_ADVERT_API_TOKEN
        },
        body: JSON.stringify({
          phone: phoneNumber,
          shortTextMessage: personalizedMessage,
          sendAsShort: true
        })
      });

      const result = await response.json();
      console.log('SMS Advert Response:', result);

      if (response.ok && result.successMessage) {
        setMessage(`✅ SMS trimis prin SMS Advert către ${phoneNumber}! ID: ${result.msgId}, Cost: ${result.unitsCost} unități`);
        console.log('SMS trimis cu succes prin SMS Advert');
      } else {
        const errorMsg = result.message || result.error || response.statusText || 'Eroare necunoscută';
        setMessage(`❌ Eroare SMS Advert API: ${errorMsg}`);
        console.error('SMS Advert API Error:', result);
      }

    } catch (error) {
      console.error('Eroare SMS Advert:', error);
      setMessage(`❌ Eroare la trimiterea SMS: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  const getDaysUntilExpiry = (dateString: string): number => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (dateString: string): 'expired' | 'warning' | 'ok' => {
    const daysUntilExpiry = getDaysUntilExpiry(dateString);
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'ok';
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      setLoading(true);
      setMessage('📊 Se generează fișierul Excel...');

      const exportData = vehicles.map((vehicle, index) => ({
        'Nr.': index + 1,
        'Nr. Înmatriculare': vehicle.nr_inmatriculare,
        'Valabilitate ITP': formatDate(vehicle.valabilitate),
        'Perioada Valabilitate': vehicle.perioada_valabilitate,
        'Telefon': vehicle.nr_telefon,
        'Status': getExpiryStatus(vehicle.valabilitate) === 'expired' ? 'EXPIRAT' : 
                 getExpiryStatus(vehicle.valabilitate) === 'warning' ? 'EXPIRA CURAND' : 'VALABIL',
        'Zile Rămase': getDaysUntilExpiry(vehicle.valabilitate)
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // Nr.
        { wch: 20 },  // Nr. Înmatriculare  
        { wch: 15 },  // Valabilitate ITP
        { wch: 18 },  // Perioada Valabilitate
        { wch: 15 },  // Telefon
        { wch: 15 },  // Status
        { wch: 12 }   // Zile Rămase
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Vehicule ITP');
      
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `vehicule_itp_${dateStr}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      setMessage(`✅ Fișier Excel generat: ${fileName}`);
    } catch (error) {
      console.error('Eroare la exportul Excel:', error);
      setMessage('❌ Eroare la generarea fișierului Excel');
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    try {
      setMessage('📥 Se descarcă șablonul Excel...');
      
      const templateData = [
        {
          'Nr. Inmatriculare': 'SV01ABC', 
          'Valabilitate': '2025-12-31',
          'Perioada Valabilitate': '1_an',
          'Telefon': '0755123456'
        },
        {
          'Nr. Inmatriculare': 'SV02DEF', 
          'Valabilitate': '2025-06-15',
          'Perioada Valabilitate': '6_luni',
          'Telefon': '0755654321'
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // Nr. Inmatriculare
        { wch: 15 }, // Valabilitate  
        { wch: 18 }, // Perioada Valabilitate
        { wch: 15 }  // Telefon
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, 'template_vehicule_itp.xlsx');
      setMessage('✅ Șablon Excel descărcat cu succes!');
    } catch (error) {
      console.error('Eroare la descărcarea șablonului:', error);
      setMessage('❌ Eroare la descărcarea șablonului');
    }
  };

  // Import from Excel
  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('📤 Se importă datele din Excel...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let importedCount = 0;
        let errorCount = 0;

        for (const row of jsonData as any[]) {
          try {
            const vehicle: Vehicle = {
              nr_inmatriculare: (row['Nr. Inmatriculare'] || row.nr_inmatriculare || '').toString().trim(),
              valabilitate: row['Valabilitate'] || row.valabilitate || '',
              perioada_valabilitate: (row['Perioada Valabilitate'] || row.perioada_valabilitate || '1_an') as '6_luni' | '1_an' | '2_ani',
              nr_telefon: (row['Telefon'] || row.nr_telefon || '').toString().trim()
            };

            if (vehicle.nr_inmatriculare && vehicle.valabilitate && vehicle.nr_telefon) {
              await addVehicle(vehicle);
              importedCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error('Eroare la importul rândului:', row, error);
            errorCount++;
          }
        }

        // Refresh vehicle list
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
        
        setMessage(`✅ Import finalizat: ${importedCount} vehicule importate${errorCount > 0 ? `, ${errorCount} erori` : ''}`);
      } catch (error) {
        console.error('Eroare la importul Excel:', error);
        setMessage('❌ Eroare la importul fișierului Excel');
      } finally {
        setLoading(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Edit vehicle
  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setFormData({
      nr_inmatriculare: '',
      valabilitate: calculateExpiryDate('1_an'), // Calculează automat data
      perioada_valabilitate: '1_an',
      nr_telefon: ''
    });
  };

  // Update vehicle
  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    try {
      setLoading(true);
      if (!updatedVehicle.id) {
        throw new Error('Vehicle ID is required for update');
      }
      await updateVehicle(updatedVehicle.id, updatedVehicle);
      
      // Refresh list
      const vehicleList = await getAllVehicles();
      setVehicles(vehicleList);
      
      setMessage('✅ Vehicul actualizat cu succes!');
      setEditingVehicle(null);
      setFormData({
        nr_inmatriculare: '',
        valabilitate: calculateExpiryDate('1_an'), // Calculează automat data
        perioada_valabilitate: '1_an',
        nr_telefon: ''
      });
    } catch (error) {
      console.error('Eroare la actualizarea vehiculului:', error);
      setMessage('❌ Eroare la actualizarea vehiculului');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Dacă se schimbă perioada, calculează automat data de valabilitate
    if (name === 'perioada_valabilitate') {
      const period = value as '6_luni' | '1_an' | '2_ani';
      const newExpiryDate = calculateExpiryDate(period);
      
      setFormData(prev => ({
        ...prev,
        perioada_valabilitate: period,
        valabilitate: newExpiryDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dbConnected) {
      setMessage('Nu există conexiune la baza de date!');
      return;
    }

    // Validare simplă
    if (!formData.nr_inmatriculare || !formData.valabilitate || !formData.nr_telefon) {
      setMessage('Te rog completează toate câmpurile!');
      return;
    }

    try {
      setLoading(true);
      
      if (editingVehicle && editingVehicle.id) {
        // Update existing vehicle
        const updatedVehicle = { ...formData, id: editingVehicle.id };
        await handleUpdateVehicle(updatedVehicle);
        return;
      }

      // Add new vehicle
      const vehicleId = await addVehicle(formData);
      
      if (vehicleId) {
        setMessage('Vehicul adăugat cu succes!');
        // Reset form
        setFormData({
          nr_inmatriculare: '',
          valabilitate: calculateExpiryDate('1_an'), // Calculează automat data
          perioada_valabilitate: '1_an',
          nr_telefon: ''
        });
        
        // Refresh list
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
      } else {
        setMessage('Eroare la adăugarea vehiculului!');
      }
    } catch (error) {
      console.error('Eroare la procesarea formularului:', error);
      setMessage('Eroare la procesarea datelor!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm('Sigur doriți să ștergeți acest vehicul?')) {
      try {
        setLoading(true);
        await deleteVehicle(vehicleId);
        
        // Refresh list
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
        
        setMessage('Vehicul șters cu succes!');
      } catch (error) {
        console.error('Eroare la ștergerea vehiculului:', error);
        setMessage('Eroare la ștergerea vehiculului!');
      } finally {
        setLoading(false);
      }
    }
  };

  const sendBulkSMS = async () => {
    if (vehicles.length === 0) {
      setMessage('Nu există vehicule în listă!');
      return;
    }

    const expiringVehicles = vehicles.filter(vehicle => {
      const daysUntilExpiry = getDaysUntilExpiry(vehicle.valabilitate);
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    });

    if (expiringVehicles.length === 0) {
      setMessage('Nu există vehicule care expiră în următoarele 30 de zile!');
      return;
    }

    if (!window.confirm(`Doriți să trimiteți SMS la ${expiringVehicles.length} vehicule care expiră în următoarele 30 de zile?`)) {
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const vehicle of expiringVehicles) {
        try {
          await sendSMSNotification(vehicle);
          successCount++;
          
          // Delay between SMS to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Eroare la trimiterea SMS pentru ${vehicle.nr_inmatriculare}:`, error);
          errorCount++;
        }
      }

      setMessage(`📱 SMS-uri trimise: ${successCount} succese, ${errorCount} erori`);
    } catch (error) {
      console.error('Eroare la trimiterea SMS-urilor în masă:', error);
      setMessage('❌ Eroare la trimiterea SMS-urilor în masă');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-form-container">
      <h1>🚗 Registru Vehicule - SMS Advert</h1>
      
      <div className="main-content">
        {/* Form Section */}
        <div className="vehicle-form-card">
          <h2>📝 Adaugă/Editează Vehicul</h2>
          
          <form onSubmit={handleSubmit} className="vehicle-form">
            <div className="row g-3">
              {/* Numărul de înmatriculare */}
              <div className="col-md-3">
                <label htmlFor="nr_inmatriculare" className="form-label fw-semibold text-dark">Nr. Înmatriculare</label>
                <input
                  type="text"
                  className="form-control form-control-lg vehicle-nr-input"
                  id="nr_inmatriculare"
                  name="nr_inmatriculare"
                  value={formData.nr_inmatriculare}
                  onChange={handleChange}
                  placeholder="SV01ABC"
                  required
                />
              </div>

              {/* Perioada Valabilitate */}
              <div className="col-md-2">
                <label htmlFor="perioada_valabilitate" className="form-label fw-semibold text-dark">Perioada</label>
                <select
                  className="form-control form-control-lg"
                  id="perioada_valabilitate"
                  name="perioada_valabilitate"
                  value={formData.perioada_valabilitate}
                  onChange={handleChange}
                  required
                >
                  <option value="6_luni">6 Luni</option>
                  <option value="1_an">1 An</option>
                  <option value="2_ani">2 Ani</option>
                </select>
              </div>

              {/* Data valabilitate */}
              <div className="col-md-3">
                <label htmlFor="valabilitate" className="form-label fw-semibold text-dark">Valabilitate ITP</label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  id="valabilitate"
                  name="valabilitate"
                  value={formData.valabilitate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Telefon */}
              <div className="col-md-2">
                <label htmlFor="nr_telefon" className="form-label fw-semibold text-dark">Telefon</label>
                <input
                  type="tel"
                  className="form-control form-control-lg vehicle-phone-input"
                  id="nr_telefon"
                  name="nr_telefon"
                  value={formData.nr_telefon}
                  onChange={handleChange}
                  placeholder="0755123456"
                  required
                />
              </div>

              {/* Buton Adaugă/Actualizează */}
              <div className="col-md-2">
                <button 
                  type="submit" 
                  className={`btn ${editingVehicle ? 'btn-warning' : 'btn-success'} btn-lg w-100 fw-bold vehicle-add-btn`}
                  disabled={loading}
                >
                  {loading ? (editingVehicle ? 'Actualizare...' : 'Adăugare...') : (editingVehicle ? 'ACTUALIZEAZĂ' : 'ADAUGĂ')}
                </button>
              </div>
            </div>
          </form>

          {editingVehicle && (
            <div className="mt-3">
              <button 
                type="button" 
                className="btn btn-secondary me-2"
                onClick={handleCancelEdit}
              >
                Anulează Editarea
              </button>
            </div>
          )}

          {/* Excel Tools Section */}
          <div className="mt-4">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">📊 Instrumente Excel</h5>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={downloadTemplate}
                      disabled={loading}
                    >
                      📥 Template Excel
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-success btn-sm w-100"
                      onClick={exportToExcel}
                      disabled={loading || vehicles.length === 0}
                    >
                      📤 Export Date ({vehicles.length})
                    </button>
                  </div>
                  <div className="col-md-4">
                    <label className="btn btn-warning btn-sm w-100" htmlFor="excel-import">
                      📂 Import Excel
                    </label>
                    <input
                      ref={fileInputRef}
                      id="excel-import"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={importFromExcel}
                      className="hidden-file-input"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="mt-4">
            <div className={`card ${dbConnected ? 'border-success' : 'border-danger'}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className={`badge ${dbConnected ? 'bg-success' : 'bg-danger'}`}>
                      {dbConnected ? '🟢 Conectat la baza de date' : '🔴 Deconectat de la baza de date'}
                    </small>
                    <small className="badge bg-info ms-2">📱 SMS Advert API: Conectat ✅</small>
                  </div>
                  <div>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={initDatabase}
                      disabled={loading}
                    >
                      🔄 Reconectare
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="mt-3">
              <div className={`alert ${message.includes('❌') ? 'alert-danger' : message.includes('✅') ? 'alert-success' : 'alert-info'} fade show`}>
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Vehicles List Section */}
        <div className="vehicle-list-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>🚙 Vehicule Înregistrate ({vehicles.length})</h2>
            <div>
              <button 
                className="btn btn-primary me-2"
                onClick={sendBulkSMS}
                disabled={loading || vehicles.length === 0}
              >
                📱 SMS LA TOATE ({vehicles.filter(v => getDaysUntilExpiry(v.valabilitate) <= 30 && getDaysUntilExpiry(v.valabilitate) >= 0).length})
              </button>
            </div>
          </div>

          <div className="vehicles-table-container">
            <table className="table table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Nr. Înmatriculare</th>
                  <th scope="col">Perioada</th>
                  <th scope="col">Valabilitate ITP</th>
                  <th scope="col">Telefon</th>
                  <th scope="col">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <em>Nu există vehicule înregistrate</em>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle, index) => {
                    const daysUntilExpiry = getDaysUntilExpiry(vehicle.valabilitate);
                    const status = getExpiryStatus(vehicle.valabilitate);
                    
                    return (
                      <tr key={vehicle.id || index} className={
                        status === 'expired' ? 'table-danger' : 
                        status === 'warning' ? 'table-warning' : ''
                      }>
                        <th scope="row">{index + 1}</th>
                        <td>
                          <span className="badge vehicle-nr-badge">{vehicle.nr_inmatriculare}</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {vehicle.perioada_valabilitate === '6_luni' && '6 Luni'}
                            {vehicle.perioada_valabilitate === '1_an' && '1 An'}
                            {vehicle.perioada_valabilitate === '2_ani' && '2 Ani'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <span>{formatDate(vehicle.valabilitate)}</span>
                            <small className={`text-${status === 'expired' ? 'danger' : status === 'warning' ? 'warning' : 'success'}`}>
                              {status === 'expired' && `⚠️ Expirat cu ${Math.abs(daysUntilExpiry)} zile`}
                              {status === 'warning' && `🔔 Expiră în ${daysUntilExpiry} zile`}
                              {status === 'ok' && `✅ Valabil ${daysUntilExpiry} zile`}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="vehicle-phone-cell">{vehicle.nr_telefon}</span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditVehicle(vehicle)}
                              disabled={loading}
                              title="Editează"
                            >
                              ✏️ EDIT
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => sendSMSNotification(vehicle)}
                              disabled={loading}
                              title="Trimite SMS"
                            >
                              📱 SMS
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => vehicle.id && handleDeleteVehicle(vehicle.id)}
                              disabled={loading}
                              title="Șterge"
                            >
                              🗑️ ȘTERGE
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
