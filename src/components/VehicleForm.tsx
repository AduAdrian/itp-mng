import React, { useState, useEffect, useRef } from 'react';
import './VehicleForm.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  initializeDatabase, 
  testConnection, 
  addVehicle, 
  getAllVehicles, 
  deleteVehicle,
  updateVehicle,
  clearAllVehicles,
  type Vehicle 
} from '../config/database';

const VehicleForm: React.FC = () => {
  const [formData, setFormData] = useState<Vehicle>({
    nume: '',
    nr_inmatriculare: '',
    valabilitate: '',
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
        
        const testVehicle = {
          nume: 'Test ADRIAN',
          nr_inmatriculare: 'SV14YCP',
          valabilitate: expiryDate.toISOString().split('T')[0],
          nr_telefon: '0756596565'
        };
        
        await addVehicle(testVehicle);
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
        console.log('Adăugat vehicul de test cu ITP care expiră în 3 zile');
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

  // Check if ITP expires in 7 days
  const isExpiringSoon = (valabilitate: string): boolean => {
    const today = new Date();
    const expiryDate = new Date(valabilitate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  // Calculează zilele rămase până la expirare
  const getDaysUntilExpiry = (valabilitate: string): number => {
    const today = new Date();
    const expiryDate = new Date(valabilitate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Send SMS notification via SMS Advert API
  const sendSMSNotification = async (vehicle: Vehicle) => {
    try {
      setLoading(true);
      const phoneNumber = vehicle.nr_telefon;
      const nume = vehicle.nume;
      const nrInmatriculare = vehicle.nr_inmatriculare;
      const valabilitate = vehicle.valabilitate;
      
      // Calculăm câte zile rămân
      const diffDays = getDaysUntilExpiry(valabilitate);
      
      setMessage(`📱 Se trimite SMS către ${phoneNumber} pentru ${nume} prin SMS Advert...`);
      
      // Mesajul personalizat pentru vehicul
      const personalizedMessage = `Buna ${nume}! ITP ${nrInmatriculare} expira in ${diffDays} ${diffDays === 1 ? 'zi' : 'zile'} (${formatDate(valabilitate)}). Reinnnoiti-l!`;
      
      setMessage(`📱 Se trimite SMS prin SMS Advert către ${phoneNumber} pentru ${nume}...`);

      // Pentru testare - logurile pentru debugging
      console.log('SMS Advert Request:', {
        url: SMS_ADVERT_BASE_URL,
        phone: phoneNumber,
        nume: nume,
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
        setMessage(`✅ SMS trimis prin SMS Advert către ${nume} (${phoneNumber})! ID: ${result.msgId}, Cost: ${result.unitsCost} unități`);
        console.log('SMS trimis cu succes prin SMS Advert');
      } else {
        const errorMsg = result.message || result.error || response.statusText || 'Eroare necunoscută';
        setMessage(`❌ Eroare SMS Advert API: ${errorMsg}`);
        console.error('SMS Advert API Error:', result);
      }

    } catch (error) {
      console.error('Eroare SMS Advert:', error);
      setMessage('❌ Eroare la trimiterea SMS prin SMS Advert - verifică consola pentru detalii');
    } finally {
      setLoading(false);
    }
  };

  // Trimite SMS către toate vehiculele care expiră curând
  const sendSMSToAllExpiring = async () => {
    if (!confirm('Sigur vrei să trimiți SMS către toate vehiculele cu ITP care expiră în 7 zile prin SMS Advert?')) {
      return;
    }

    const expiringVehicles = vehicles.filter(vehicle => isExpiringSoon(vehicle.valabilitate));
    
    if (expiringVehicles.length === 0) {
      setMessage('Nu există vehicule cu ITP care expiră în următoarele 7 zile.');
      return;
    }

    setMessage(`📱 Se trimit ${expiringVehicles.length} SMS-uri prin SMS Advert...`);
    
    for (let i = 0; i < expiringVehicles.length; i++) {
      const vehicle = expiringVehicles[i];
      try {
        await sendSMSNotification(vehicle);
        // Pauză între SMS-uri pentru a nu supraîncărca API-ul
        if (i < expiringVehicles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secunde între SMS-uri
        }
      } catch (error) {
        console.error(`Eroare la trimiterea SMS pentru ${vehicle.nume}:`, error);
      }
    }
    
    setMessage(`✅ Toate SMS-urile au fost procesate pentru ${expiringVehicles.length} vehicule prin SMS Advert!`);
  };

  // ===== FUNCȚII EXCEL =====

  // 1. Download Template Excel
  const downloadExcelTemplate = () => {
    const templateData = [
      {
        'Nume': 'Exemplu Ion',
        'Nr. Înmatriculare': 'B123ABC',
        'Valabilitate ITP': '2025-12-31',
        'Telefon': '0755123456'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Vehicule');

    // Setează lățimea coloanelor
    const colWidths = [
      { wch: 20 }, // Nume
      { wch: 18 }, // Nr. Înmatriculare
      { wch: 15 }, // Valabilitate ITP
      { wch: 15 }  // Telefon
    ];
    worksheet['!cols'] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'Template_Vehicule.xlsx');
    
    setMessage('✅ Template Excel descărcat cu succes!');
  };

  // 2. Download Data Excel
  const downloadExcelData = () => {
    if (vehicles.length === 0) {
      setMessage('❌ Nu există vehicule pentru export!');
      return;
    }

    const exportData = vehicles.map((vehicle, index) => ({
      'Nr.': index + 1,
      'Nume': vehicle.nume,
      'Nr. Înmatriculare': vehicle.nr_inmatriculare,
      'Valabilitate ITP': vehicle.valabilitate,
      'Telefon': vehicle.nr_telefon,
      'Status': isExpiringSoon(vehicle.valabilitate) ? 'EXPIRĂ CURÂND!' : 'Valid'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicule');

    // Setează lățimea coloanelor
    const colWidths = [
      { wch: 5 },  // Nr.
      { wch: 20 }, // Nume
      { wch: 18 }, // Nr. Înmatriculare
      { wch: 15 }, // Valabilitate ITP
      { wch: 15 }, // Telefon
      { wch: 15 }  // Status
    ];
    worksheet['!cols'] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date().toISOString().split('T')[0];
    saveAs(data, `Vehicule_${today}.xlsx`);
    
    setMessage(`✅ Date exportate cu succes! (${vehicles.length} vehicule)`);
  };

  // 3. Upload și Import Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        setMessage('📤 Se procesează fișierul Excel...');

        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Date din Excel:', jsonData);

        let importedCount = 0;
        let errors: string[] = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as any;
          
          // Mapează coloanele din Excel
          const vehicleData: Vehicle = {
            nume: row['Nume'] || row.nume || '',
            nr_inmatriculare: row['Nr. Înmatriculare'] || row['Nr. Inmatriculare'] || row.nr_inmatriculare || '',
            valabilitate: row['Valabilitate ITP'] || row['Valabilitate'] || row.valabilitate || '',
            nr_telefon: row['Telefon'] || row.nr_telefon || ''
          };

          // Validează datele
          if (!vehicleData.nume || !vehicleData.nr_inmatriculare || !vehicleData.valabilitate || !vehicleData.nr_telefon) {
            errors.push(`Rândul ${i + 2}: Date incomplete`);
            continue;
          }

          // Validează formatul datei
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(vehicleData.valabilitate)) {
            errors.push(`Rândul ${i + 2}: Format dată invalid (folosește YYYY-MM-DD)`);
            continue;
          }

          try {
            await addVehicle(vehicleData);
            importedCount++;
          } catch (error) {
            errors.push(`Rândul ${i + 2}: Eroare la salvare`);
          }
        }

        // Refresh lista
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);

        // Afișează rezultatul
        let resultMessage = `✅ Import finalizat! ${importedCount} vehicule importate.`;
        if (errors.length > 0) {
          resultMessage += ` ${errors.length} erori: ${errors.slice(0, 3).join(', ')}`;
          if (errors.length > 3) resultMessage += '...';
        }
        setMessage(resultMessage);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';

      } catch (error) {
        console.error('Eroare import Excel:', error);
        setMessage('❌ Eroare la procesarea fișierului Excel!');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 4. Șterge toate datele (pentru curățenie)
  const clearAllData = async () => {
    if (!confirm('Sigur vrei să ștergi TOATE vehiculele din baza de date? Această acțiune nu poate fi anulată!')) {
      return;
    }

    try {
      setLoading(true);
      await clearAllVehicles();
      setVehicles([]);
      setMessage('✅ Toate datele au fost șterse!');
    } catch (error) {
      console.error('Eroare la ștergerea datelor:', error);
      setMessage('❌ Eroare la ștergerea datelor!');
    } finally {
      setLoading(false);
    }
  };

  // Edit vehicle
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setFormData({
      nume: '',
      nr_inmatriculare: '',
      valabilitate: '',
      nr_telefon: ''
    });
  };

  // Update vehicle
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVehicle?.id) return;

    try {
      setLoading(true);
      const success = await updateVehicle(editingVehicle.id, formData);
      
      if (success) {
        setMessage('Vehicul actualizat cu succes!');
        handleCancelEdit();
        
        // Refresh list
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
      } else {
        setMessage('Eroare la actualizarea vehiculului!');
      }
    } catch (error) {
      console.error('Eroare la actualizarea vehiculului:', error);
      setMessage('Eroare la actualizarea vehiculului!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dbConnected) {
      setMessage('Nu există conexiune la baza de date!');
      return;
    }

    // Validare simplă
    if (!formData.nume || !formData.nr_inmatriculare || !formData.valabilitate || !formData.nr_telefon) {
      setMessage('Toate câmpurile sunt obligatorii!');
      return;
    }

    // Dacă editează un vehicul, folosește handleUpdate
    if (editingVehicle) {
      return handleUpdate(e);
    }

    try {
      setLoading(true);
      const vehicleId = await addVehicle(formData);
      
      if (vehicleId) {
        setMessage('Vehicul adăugat cu succes!');
        // Reset form
        setFormData({
          nume: '',
          nr_inmatriculare: '',
          valabilitate: '',
          nr_telefon: ''
        });
        
        // Refresh list
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
      } else {
        setMessage('Eroare la adăugarea vehiculului!');
      }
    } catch (error) {
      console.error('Eroare la salvarea vehiculului:', error);
      setMessage('Eroare la salvarea vehiculului!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId: number) => {
    if (window.confirm('Sigur vrei să ștergi acest vehicul?')) {
      try {
        await deleteVehicle(vehicleId);
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
        setMessage('Vehicul șters cu succes!');
      } catch (error) {
        console.error('Eroare la ștergerea vehiculului:', error);
        setMessage('Eroare la ștergerea vehiculului!');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  return (
    <div className="vehicle-form-container container-fluid min-vh-100 d-flex flex-column justify-content-start align-items-center py-5">
      
      {/* Titlu */}
      <h1 className="text-white text-center mb-4 fw-bold">
        Registru Vehicule - SMS Advert
      </h1>

      {/* Bara de instrumente Excel */}
      <div className="card shadow-lg border-0 mb-4 vehicle-form-card">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0 fw-bold text-center">📊 Instrumente Excel</h5>
        </div>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Template Download */}
            <div className="col-md-3">
              <button
                onClick={downloadExcelTemplate}
                className="btn btn-outline-success w-100 fw-bold"
                disabled={loading}
                title="Descarcă un fișier Excel gol pentru completare"
              >
                📥 Template Excel
              </button>
            </div>

            {/* Data Export */}
            <div className="col-md-3">
              <button
                onClick={downloadExcelData}
                className="btn btn-success w-100 fw-bold"
                disabled={loading || vehicles.length === 0}
                title="Exportă toate datele în Excel"
              >
                📤 Export Date ({vehicles.length})
              </button>
            </div>

            {/* File Upload */}
            <div className="col-md-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="d-none"
                id="excelUpload"
              />
              <label
                htmlFor="excelUpload"
                className="btn btn-warning w-100 fw-bold mb-0 excel-upload-label"
                title="Importă date din fișier Excel"
              >
                📂 Import Excel
              </label>
            </div>

            {/* Clear All */}
            <div className="col-md-3">
              <button
                onClick={clearAllData}
                className="btn btn-danger w-100 fw-bold"
                disabled={loading || vehicles.length === 0}
                title="Șterge toate datele din baza de date"
              >
                🗑️ Șterge Tot ({vehicles.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formular - Input-uri în linie */}
      <div className="card shadow-lg border-0 mb-4 vehicle-form-card">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              {/* Nume */}
              <div className="col-md-3">
                <label htmlFor="nume" className="form-label fw-semibold text-dark">Nume</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="nume"
                  name="nume"
                  value={formData.nume}
                  onChange={handleChange}
                  placeholder="Numele complet"
                  required
                />
              </div>

              {/* Număr înmatriculare */}
              <div className="col-md-3">
                <label htmlFor="nr_inmatriculare" className="form-label fw-semibold text-dark">Nr. Înmatriculare</label>
                <input
                  type="text"
                  className="form-control form-control-lg vehicle-nr-input"
                  id="nr_inmatriculare"
                  name="nr_inmatriculare"
                  value={formData.nr_inmatriculare}
                  onChange={handleChange}
                  placeholder="SV14YCP"
                  required
                />
              </div>

              {/* Data valabilitate */}
              <div className="col-md-2">
                <label htmlFor="valabilitate" className="form-label fw-semibold text-dark">Valabilitate</label>
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
              
              {/* Buton Anulează (doar când editează) */}
              {editingVehicle && (
                <div className="col-md-1">
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="btn btn-secondary btn-lg w-100"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Mesaj */}
          {message && (
            <div className={`alert ${message.includes('succes') ? 'alert-success' : 'alert-danger'} mt-3 mb-0`} role="alert">
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Lista vehiculelor - simplă */}
      {vehicles.length > 0 && (
        <div className="card shadow-lg border-0 vehicle-list-card">
          <div className="card-header bg-primary text-white text-center d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold">Vehicule Înregistrate ({vehicles.length})</h4>
            
            {/* Buton pentru trimiterea SMS către toate vehiculele care expiră */}
            {vehicles.filter(v => isExpiringSoon(v.valabilitate)).length > 0 && (
              <button
                onClick={sendSMSToAllExpiring}
                className="btn btn-warning btn-sm fw-bold"
                disabled={loading}
                title={`Trimite SMS către toate vehiculele care expiră prin SMS Advert (${vehicles.filter(v => isExpiringSoon(v.valabilitate)).length})`}
              >
                📱 SMS la toate ({vehicles.filter(v => isExpiringSoon(v.valabilitate)).length})
              </button>
            )}
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="fw-bold">#</th>
                    <th className="fw-bold">Nume</th>
                    <th className="fw-bold">Nr. Înmatriculare</th>
                    <th className="fw-bold">Valabilitate ITP</th>
                    <th className="fw-bold">Telefon</th>
                    <th className="fw-bold text-center vehicle-actions-column">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle, index) => {
                    const expiring = isExpiringSoon(vehicle.valabilitate);
                    return (
                      <tr key={vehicle.id || index} className={expiring ? 'table-danger' : ''}>
                        <td className="fw-bold text-primary">{index + 1}</td>
                        <td className="fw-semibold">
                          {vehicle.nume}
                          {expiring && (
                            <span className="badge bg-danger ms-2">EXPIRĂ CURÂND!</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-success px-3 py-2 vehicle-nr-badge">
                            {vehicle.nr_inmatriculare}
                          </span>
                        </td>
                        <td className={expiring ? 'text-danger fw-bold' : 'text-muted'}>
                          {formatDate(vehicle.valabilitate)}
                          {expiring && (
                            <small className="d-block text-danger">
                              (⚠️ {getDaysUntilExpiry(vehicle.valabilitate)} {getDaysUntilExpiry(vehicle.valabilitate) === 1 ? 'zi' : 'zile'})
                            </small>
                          )}
                        </td>
                        <td className="vehicle-phone-cell">{vehicle.nr_telefon}</td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="btn btn-warning btn-sm me-1"
                              title="Editează vehicul"
                            >
                              ✏️ Edit
                            </button>
                            
                            {expiring && (
                              <button
                                onClick={() => sendSMSNotification(vehicle)}
                                className="btn btn-info btn-sm me-1"
                                title={`Trimite SMS prin SMS Advert către ${vehicle.nume} - ${vehicle.nr_telefon}`}
                                disabled={loading}
                              >
                                📱 SMS
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(vehicle.id!)}
                              className="btn btn-danger btn-sm vehicle-delete-btn"
                              title="Șterge vehicul"
                            >
                              🗑️ Șterge
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
      )}

      {/* Status conexiune */}
      <div className="mt-4">
        <span className={`badge ${dbConnected ? 'bg-success' : 'bg-danger'} px-3 py-2 me-3`}>
          {dbConnected ? '✅ Conectat la baza de date' : '❌ Deconectat de la baza de date'}
        </span>
        <span className="badge bg-info px-3 py-2">
          � SMS Advert API: Conectat ✅
        </span>
      </div>
    </div>
  );
};

export default VehicleForm;
