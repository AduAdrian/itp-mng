# Vehicle Registry - Aplicație React cu LocalStorage (Demo)

O aplicație React TypeScript pentru gestionarea unui registru de vehicule, cu stocare locală în browser folosind LocalStorage.

## 🚀 Funcționalități

- **Formular de înregistrare vehicule** cu următoarele câmpuri:
  - Nume
  - Număr înmatriculare
  - Valabilitate
  - Data înregistrare
  - Număr telefon

- **Stocare LocalStorage** (Demo Mode):
  - Datele sunt salvate în browser-ul local
  - Simulează operațiile de bază de date
  - User: `Adrian` (pentru consistență cu cerințele)

- **Vizualizare vehicule** înregistrate în format card
- **Verificare status conexiune** la "baza de date"
- **Interface responsive** și modernă

## 📋 Prerequisite

Pentru a rula aplicația, aveți nevoie doar de:

1. **Node.js** (versiunea 18+)
2. **Browser modern** cu suport LocalStorage

## 🚀 Instalare și Rulare

1. **Clonați/Descărcați proiectul**
2. **Instalați dependențele**:
   ```bash
   npm install
   ```

3. **Pornește serverul de dezvoltare**:
   ```bash
   npm run dev
   ```

4. **Deschideți browser-ul** la `http://localhost:5173`

## 🗃️ Stocare Date

Aplicația folosește **LocalStorage** pentru a simula o bază de date:
- Datele sunt stocate local în browser
- Datele persistă între sesiuni
- Pentru a șterge datele, folosiți Developer Tools > Application > Local Storage

## � Upgrade la MySQL

Pentru a folosi MySQL real, urmați acești pași:

1. **Instalați MySQL Server**
2. **Creați utilizatorul**:
   ```sql
   CREATE USER 'Adrian'@'localhost' IDENTIFIED BY 'Adrian';
   GRANT ALL PRIVILEGES ON *.* TO 'Adrian'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. **Înlocuiți** `src/config/database.ts` cu implementarea MySQL
4. **Instalați** mysql2: `npm install mysql2`

## 📁 Structura Proiectului

```
src/
├── components/
│   ├── VehicleForm.tsx    # Componenta principală
│   └── VehicleForm.css    # Stiluri pentru formular
├── config/
│   └── database.ts        # Configurare și operații MySQL
├── App.tsx               # Componenta root
└── main.tsx             # Entry point
```

## 🗃️ Schema Bazei de Date

Aplicația creează automat baza de date `vehicle_registry` cu următoarea structură:

```sql
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nume VARCHAR(255) NOT NULL,
  nr_inmatriculare VARCHAR(50) NOT NULL UNIQUE,
  valabilitate DATE NOT NULL,
  data_inregistrare DATE NOT NULL,
  nr_telefon VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Operații Disponibile

- ✅ **Adăugare vehicul nou**
- ✅ **Vizualizare toate vehiculele**
- ✅ **Verificare conexiune baza de date**
- ✅ **Validare formulare**
- ✅ **Interface responsive**

## 🎨 Tehnologii Utilizate

- **React 18** cu TypeScript
- **Vite** pentru build și dezvoltare
- **MySQL2** pentru conexiunea la baza de date
- **CSS3** cu Grid și Flexbox
- **ES6+** features

## 🔍 Troubleshooting

### Problemă: Nu se poate conecta la MySQL
**Soluție**: Verificați că:
- MySQL Server rulează
- Credențialele sunt corecte
- Portul 3306 este disponibil

### Problemă: Eroare la crearea bazei de date
**Soluție**: Asigurați-vă că utilizatorul 'Adrian' are permisiuni de creare baze de date

### Problemă: Formular nu salvează
**Soluție**: Verificați consola browser-ului pentru erori și conexiunea la baza de date

## 📝 Comenzi Disponibile

- `npm run dev` - Pornește serverul de dezvoltare
- `npm run build` - Construiește aplicația pentru producție
- `npm run preview` - Previzualizează build-ul de producție
- `npm run lint` - Rulează ESLint pentru verificarea codului

## 🤝 Contribuții

Pentru îmbunătățiri sau bug-uri, creați un issue sau pull request.

---

**Aplicație dezvoltată cu React + TypeScript + Vite + MySQL**
