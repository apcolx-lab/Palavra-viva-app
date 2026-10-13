# Palavra Viva — PWA Estático e Offline

O **Palavra Viva** é um aplicativo PWA 100% estático, offline e gratuito para ensino da Palavra de Deus em português do Brasil.

## Estrutura do Repositório

- `index.html`: Shell principal da aplicação em HTML5/CSS/JS simples sem frameworks pesados.
- `app.js` & `storage.js`: Lógica do leitor PWA e gerenciamento de armazenamento local IndexedDB (`pv4-reader-db`).
- `sw.js`: Service Worker com cache offline e estratégia de atualização sem `skipWaiting` automático.
- `manifest.json`: Manifesto Web App do PWA.
- `content-manifest.json`: Manifesto oficial de conteúdo declarando pacotes, geração, hashes SHA-256 e lista de revogações.
- `schemas/`: Esquemas JSON Schema (`draft-07`) para validação rigorosa de cada tipo de arquivo.
- `biblia/`: Pacotes JSON por livro e capítulo contendo o texto bíblico (Bíblia Livre N4).
- `camada1/`: Referências cruzadas, introduções de livros e a trilha do evangelho.
- `camada2/`: Estudos de ensino por passagem (perícopes).
- `camada3/`: Estudos de versículos-chave.
- `scripts/validate-content.mjs`: Script validador de integridade e esquemas (executado via Node.js).
- `tests/`: Suíte de testes automatizados com `node --test`.
- `.github/workflows/`: Workflows do GitHub Actions para CI (`ci.yml`) e publicação no GitHub Pages (`pages.yml`).
- `docs/`: Documentação e especificações de planejamento.

## Como Adicionar Pacotes de Conteúdo

1. Crie o arquivo JSON correspondente na pasta da camada apropriada (`biblia/`, `camada1/`, `camada2/` ou `camada3/`).
2. O nome do arquivo DEVE seguir o padrão `nome.SHA256.json`, onde `SHA256` é o hash SHA-256 exato do conteúdo do arquivo.
3. Adicione a entrada correspondente no array `packages` em `content-manifest.json` com o `id`, `path`, `hash`, `size` e `type`.
4. Incremente o número de `generation` em `content-manifest.json`.
5. Execute o validador para garantir integridade antes do commit:
   ```bash
   node scripts/validate-content.mjs
   node --test tests/*.test.mjs
   ```

## Como Fazer Rollback de Conteúdo

Em caso de necessidade de remover ou reverter pacotes de conteúdo já distribuídos aos leitores:

1. Edite `content-manifest.json` criando um novo commit no repositório.
2. Atualize o caminho (`path`) do pacote para a versão anterior desejada ou remova o pacote da lista `packages`.
3. Adicione o `id` ou o hash do pacote incorreto ao array `revoked` em `content-manifest.json`.
4. **Incremente o número de `generation`** em `content-manifest.json` (ex: de `1` para `2`). O app aceita manifestos com geração maior e remove automaticamente do cache e do dispositivo do leitor qualquer pacote revogado ou ausente.
5. Faça o commit e envie para a branch principal (`main`). O GitHub Actions rodará a validação e publicará a atualização automaticamente.
