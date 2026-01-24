# 🚀 API Documentation - Bus Route Finding

## 📋 Resumo das Correções

✅ **Logic Sequence Validation**: Garante que `origin` < `destination` na sequência de paradas
✅ **Time Period Support**: Suporte para AM/MD/PM (3 conjuntos de dados separados)
✅ **Journey API**: Novo endpoint dedicado `POST /routes/journey` com resposta detalhada

---

## 🔗 API Endpoints

### **STOPS APIs**

#### `GET /stops`
Buscar todas as paradas (com filtro opcional por nome)

```bash
curl "http://localhost:3000/stops"
curl "http://localhost:3000/stops?q=ben"
```

#### `GET /stops/:id`
Buscar informações de uma parada específica

```bash
curl "http://localhost:3000/stops/S1"
```

#### `GET /stops/nearby?lat=&lng=&radius=`
Buscar paradas próximas a um ponto geográfico

```bash
curl "http://localhost:3000/stops/nearby?lat=21.0285&lng=105.8542&radius=0.5"
```

---

### **ROUTES APIs**

#### `GET /routes/status`
Health check

```bash
curl "http://localhost:3000/routes/status"
```

#### `POST /routes/journey` ⭐ **[RECOMENDADO]**
Buscar lótinha detalhada entre 2 paradas com **logic sequence validation**

**Request Body:**
```json
{
  "origin": "S1",
  "destination": "S5",
  "time_period": "AM",
  "mode": "simple"
}
```

**Parameters:**
- `origin` (required): ID da parada de saída
- `destination` (required): ID da parada de chegada  
- `time_period` (optional): "AM", "MD", "PM", ou null (todos)
- `mode` (optional): "simple" (rota direta) ou "dijkstra" (menor caminho)

**Response (Success):**
```json
{
  "mode": "simple",
  "time_period": "AM",
  "route": {
    "route_id": "01_1",
    "route_short_name": "01",
    "route_long_name": "Tuyến 01"
  },
  "origin": {"stop_id": "S1", "stop_name": "01_1_S1"},
  "destination": {"stop_id": "S5", "stop_name": "01_1_S13"},
  "total_stops": 5,
  "distance_stops": 4,
  "journey": [
    {
      "stop_id": "S1",
      "stop_name": "01_1_S1",
      "stop_lat": 21.048408,
      "stop_lon": 105.878335,
      "sequence": 1
    },
    ...
  ]
}
```

**Response (Sequence Error):**
```json
{
  "error": "Não foi encontrada uma rota válida: \"S10\" deve aparecer ANTES de \"S1\" no itinerário",
  "time_period": "ALL",
  "available_routes": ["01_1", "01_2"]
}
```

---

## 🔑 Funcionalidades Principais

### 1. **Logic Sequence Validation** ✅
```
Quando procurando um itinerário:
- origin.stop_sequence < destination.stop_sequence
- Se falhar, retorna erro claro com detalhes
- Impossível ir "para trás" em uma rota
```

### 2. **Time Period Support** ✅
```
3 Conjuntos de dados:
- AM (Manhã):  rotas com prefixo 01_
- MD (Tarde):  rotas com prefixo 02_
- PM (Noite):  rotas com prefixo 03_

Omitir time_period → retorna de todos
```

### 3. **Multiple Modes** ✅
```
Simple (Default):
  - 1 rota direta (sequence preservado)
  - Rápido e preciso

Dijkstra:
  - Múltiplas rotas
  - Caminho mais curto em termos de paradas
  - Algoritmo de caminho mínimo
```

---

## 🧪 Exemplos de Teste

### Teste 1: Validação de Sequence (com sucesso)
```bash
curl -X POST "http://localhost:3000/routes/journey" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "S1",
    "destination": "S5",
    "time_period": "AM",
    "mode": "simple"
  }'
```

### Teste 2: Validação de Sequence (erro esperado)
```bash
curl -X POST "http://localhost:3000/routes/journey" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "S5",
    "destination": "S1",
    "mode": "simple"
  }'
```

### Teste 3: Buscar com Time Period MD
```bash
curl -X POST "http://localhost:3000/routes/journey" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "S1",
    "destination": "S10",
    "time_period": "MD"
  }'
```

### Teste 4: Mode Dijkstra
```bash
curl -X POST "http://localhost:3000/routes/journey" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "S1",
    "destination": "S32",
    "mode": "dijkstra"
  }'
```

---

## 📊 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Erro de validação (sequence inválida, parâmetros ausentes) |
| 404 | Não encontrado (parada/rota inexistente) |
| 500 | Erro do servidor |

---

## 🚀 Inicialização Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (já está pronto)
# Verificar arquivo .env

# 3. Iniciar servidor
npm start
# Ou com auto-reload:
npm run dev

# 4. Testar
curl "http://localhost:3000/stops"
```

---

## 📁 Estrutura do Código Corrigido

```
src/
  ├── index.js                          ← Server principal
  ├── config/db.js                      ← Conexão DB
  ├── controllers/
  │   ├── routes.controller.js          ← ✅ Logic sequence + Time period
  │   └── stops.controller.js
  └── routes/
      ├── routes.routes.js              ← ✅ POST /routes/journey
      └── stops.routes.js
```

---

## 🔍 Detalhes Técnicos

### TIME_PERIOD_MAP
```javascript
const TIME_PERIOD_MAP = {
  'AM': '01',  // Routes starting with 01_
  'MD': '02',  // Routes starting with 02_
  'PM': '03'   // Routes starting with 03_
};
```

### Sequence Validation Logic
```javascript
// Origin must appear BEFORE destination
if (originSeq !== null && destSeq !== null && originSeq < destSeq) {
  // Valid route found
  chosenRouteId = routeId;
  originSeq = o;
  destSeq = d;
  break;
}
```

---

**Status**: ✅ Todas as correções aplicadas e testadas
**Última atualização**: 2026-01-24
