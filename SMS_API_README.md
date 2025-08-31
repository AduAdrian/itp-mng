# SMS API Integration Guide

## Configurare SMS API pentru smsadvert.ro

### Token JWT furnizat:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGI0NTcwY2Y4MjkzYzRlM2Y2NmYzNWYifQ.4Jlpsb-Ure4i-x4y4nw8cff9p1A6LLMuJfIuIJg89N8
```

### Pentru a activa API-ul real:

1. **În VehicleForm.tsx** găsește funcția `sendSMSNotification`
2. **Decomentează** codul din blocul `/* ... */`
3. **Comentează** partea de simulare
4. **Actualizează URL-ul API** cu endpoint-ul corect furnizat de smsadvert.ro

### URL-uri posibile pentru API:
- `https://api.smsadvert.ro/send`
- `https://www.smsadvert.ro/api/send`
- `https://smsadvert.ro/api/v1/send`

### Structura request-ului:
```json
{
  "number": "0756596565",
  "message": "Test ITP - Vehiculul dumneavoastra expira in curand!",
  "sender": "ITP Alert"
}
```

### Headers:
```
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]
Accept: application/json
```

## Status actual:
- ✅ **Simulare SMS** - funcționează pentru testare
- ⏳ **API real** - necesită endpoint URL corect de la furnizor
- ✅ **Identificare vehicule cu expirare** - complet implementat
- ✅ **Interface utilizator** - complet funcțional

## Pentru testare:
Aplicația detectează automat vehiculele cu ITP care expiră în următoarele 7 zile și afișează butonul SMS pentru acestea.
