# 📊 Ghid de utilizare Excel pentru Registrul de Vehicule

## 🔧 Funcționalități disponibile

### 1. 📥 **Template Excel**
- **Ce face**: Descarcă un fișier Excel gol cu structura corectă
- **Când să-l folosești**: Când vrei să adaugi vehicule noi prin Excel
- **Fișier rezultat**: `Template_Vehicule.xlsx`
- **Conține**: Un exemplu cu structura corectă a datelor

### 2. 📤 **Export Date**
- **Ce face**: Exportă toate vehiculele din baza de date în Excel
- **Când să-l folosești**: Pentru backup sau pentru a lucra offline cu datele
- **Fișier rezultat**: `Vehicule_[DATA].xlsx` (ex: `Vehicule_2025-08-31.xlsx`)
- **Conține**: Toate vehiculele cu statusul de expirare

### 3. 📂 **Import Excel**
- **Ce face**: Importă vehicule din fișier Excel în baza de date
- **Când să-l folosești**: Pentru a adăuga multiple vehicule dintr-o dată
- **Fișiere acceptate**: `.xlsx`, `.xls`
- **Validare automată**: Verifică formatul datelor

### 4. 🗑️ **Șterge Tot**
- **Ce face**: Șterge toate vehiculele din baza de date
- **Când să-l folosești**: Pentru a reseta aplicația sau pentru curățenie
- **⚠️ ATENȚIE**: Acțiune ireversibilă!

## 📋 Structura fișierului Excel

### Coloane obligatorii:
| Coloană | Tip | Format | Exemplu |
|---------|-----|--------|---------|
| **Nume** | Text | Numele complet | `Ion Popescu` |
| **Nr. Înmatriculare** | Text | Format înmatriculare | `B123ABC` |
| **Valabilitate ITP** | Data | YYYY-MM-DD | `2025-12-31` |
| **Telefon** | Text | Format telefon | `0755123456` |

### ✅ Exemple corecte:
```
Nume                | Nr. Înmatriculare | Valabilitate ITP | Telefon
Ion Popescu        | B123ABC          | 2025-12-31      | 0755123456
Maria Ionescu      | SV14YCP          | 2025-09-15      | 0766789012
Gheorghe Marinescu | CJ99XYZ          | 2026-01-20      | 0734567890
```

### ❌ Erori comune:
- **Data incorectă**: `31/12/2025` ❌ → `2025-12-31` ✅
- **Telefon incomplet**: `755123` ❌ → `0755123456` ✅
- **Înmatriculare incorectă**: `B 123 ABC` ❌ → `B123ABC` ✅
- **Câmpuri goale**: Toate câmpurile sunt obligatorii

## 🚀 Cum să folosești funcțiile:

### Pentru import masiv:
1. 📥 **Descarcă template-ul** pentru a avea structura corectă
2. ✏️ **Completează datele** în Excel
3. 💾 **Salvează fișierul**
4. 📂 **Importă fișierul** în aplicație
5. ✅ **Verifică rezultatul** - aplicația va afișa câte vehicule au fost importate

### Pentru backup:
1. 📤 **Exportă datele** curente
2. 💾 **Salvează fișierul** într-un loc sigur
3. 🔄 **Restaurează** când este necesar prin import

## 🔍 Validare și erori

### Aplicația verifică automat:
- ✅ Toate câmpurile sunt completate
- ✅ Formatul datei este corect (YYYY-MM-DD)
- ✅ Datele sunt valide

### Mesaje de eroare:
- `Date incomplete` - Lipsesc informații obligatorii
- `Format dată invalid` - Data nu este în format YYYY-MM-DD
- `Eroare la salvare` - Problemă tehnică la salvarea în baza de date

## 💡 Sfaturi utile:

1. **Folosește template-ul** pentru a evita erorile de format
2. **Verifică datele** înainte de import
3. **Fă backup regulat** cu funcția de export
4. **Testează cu puține înregistrări** înainte de import masiv
5. **Păstrează fișierele Excel** ca backup secundar

## 🆘 Suport tehnic:

- **Format data**: Folosește exclusiv `YYYY-MM-DD` (ex: `2025-12-31`)
- **Encoding**: Salvează în UTF-8 pentru caractere românești
- **Dimensiune**: Nu există limită la numărul de vehicule
- **Performanță**: Import-ul se face progresiv pentru stabilitate
