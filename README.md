# Explorador de Nomes do Brasil

**Integrantes:** Lucas Matheus de Siqueira Ribeiro da Silva e Larissa Alves da Cunha

Aplicação web (Next.js + React) para consultar os nomes mais frequentes do Brasil, ver a evolução de um nome por década, comparar nomes e manter uma lista de nomes salvos com avaliação e comentário.

## Funcionalidades
- Ranking de nomes com filtros por UF, década e sexo.
- Detalhe do nome (`/names/[name]`): série histórica, total de registros, década de pico e variação percentual.
- Comparação de 2 a 4 nomes, com décadas alinhadas (zero onde não há registro).
- Nomes salvos (CRUD) persistidos em SQLite.

## API externa
IBGE — API de Nomes: `https://servicodados.ibge.gov.br/api/v2/censos/nomes` ([documentação](https://servicodados.ibge.gov.br/api/docs/nomes)). Acessada somente pelo backend; envia o cabeçalho `User-Agent: ExploradorNomesBR/1.0`.

## Endpoints do backend
| Método | Rota | Finalidade |
|---|---|---|
| GET | `/api/names/ranking?uf=&decade=&sex=` | Ranking (uf: sigla; decade: 1930–2010; sex: M ou F; todos opcionais) |
| GET | `/api/names/[name]` | Série histórica e indicadores de um nome (404 se sem registros) |
| GET | `/api/names/compare?names=a,b,c` | Compara 2 a 4 nomes (400 fora do limite) |
| GET | `/api/saved-names` | Lista nomes salvos |
| POST | `/api/saved-names` | Cria (`name`, `rating`, `note?`); 409 se duplicado |
| PATCH | `/api/saved-names/[id]` | Atualiza apenas `rating` e `note` (`id` local) |
| DELETE | `/api/saved-names/[id]` | Remove (204) |

Erros: `{ "error": "mensagem" }` com 400, 404, 409, 502 ou 500.

## Banco de dados
Arquivo `data/app.db` (criado automaticamente, fora do Git, journal padrão DELETE, sem WAL).

`saved_names(id INTEGER PK, name TEXT UNIQUE NOCASE, rating INTEGER 1–5, note TEXT ≤500 NULL, created_at TEXT)`

Registros iniciais (em `lib/db.ts`, inseridos só na criação): Maria (5, com nota), João (4), Ana (5, com nota), Lucas (3), Beatriz (4, com nota). Para restaurar, apague `data/app.db` e reinicie.

## Tecnologias
Next.js (App Router), React, TypeScript (strict), CSS, better-sqlite3. Node.js 20 ou superior (testar com a versão LTS instalada e anotar aqui).

## Execução
```
npm install
npm run dev
```
Acesse http://localhost:3000.
