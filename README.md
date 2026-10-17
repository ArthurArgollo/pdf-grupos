# Agrupador de PDFs

Aplicativo para organizar arquivos PDF em grupos e gerar um novo PDF para cada grupo.

Os arquivos são processados localmente no computador ou no navegador. Nenhum PDF é enviado para um servidor.

## Recursos

- Seleção de vários PDFs de uma vez.
- Arrastar arquivos para dentro do aplicativo.
- Organização por grupos.
- Renomeação e exclusão de grupos.
- Reordenação dos PDFs dentro de cada grupo.
- Identificação e bloqueio de arquivos duplicados.
- Desfazer a última alteração de organização.
- Progresso durante a combinação dos arquivos.
- Download de um grupo ou de todos os grupos.
- Persistência local dos arquivos usando IndexedDB.
- Tema claro e escuro.
- Interface “Sobre” com informações do aplicativo.

## Executar no navegador

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Depois, abra o endereço exibido pelo Vite no navegador.

## Testar e gerar o build web

```bash
npm test
npm run build
```

## Aplicativo Windows

O projeto Electron fica em `pdf-grupos-electron`.

```bash
cd pdf-grupos-electron
npm install
npm run dev
```

Para gerar o instalador e a versão portátil:

```bash
npm run dist
```

Os arquivos são gerados em `pdf-grupos-electron/release`:

- `PDF Grupos Setup 1.0.0.exe`: instalador do Windows.
- `PDF Grupos 1.0.0.exe`: versão portátil.

## Estrutura

```text
src/                    Interface web e lógica de agrupamento
test/                   Testes automatizados
pdf-grupos-electron/    Aplicativo desktop baseado em Electron
```

## Privacidade

Os PDFs permanecem no armazenamento local do aplicativo. A combinação é feita localmente usando `pdf-lib`.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
