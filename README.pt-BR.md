# PDF Grupos

O PDF Grupos é uma aplicação web e desktop para organizar arquivos PDF em grupos e gerar um PDF separado para cada grupo.

Eu criei o projeto para resolver um problema prático: quando vários documentos precisam ser combinados de maneiras diferentes, simplesmente juntar tudo em um único arquivo não é suficiente. Com o PDF Grupos, é possível organizar os arquivos em grupos nomeados, reordená-los e baixar os resultados individualmente ou todos de uma vez.

> **English:** [Read the README in English](README.md)

## Recursos

- Seleção de vários arquivos PDF de uma vez.
- Arrastar e soltar arquivos dentro do aplicativo.
- Organização dos arquivos em grupos nomeados.
- Renomeação e exclusão de grupos.
- Reordenação dos PDFs dentro de cada grupo.
- Identificação e bloqueio de arquivos duplicados.
- Desfazer a última alteração de organização.
- Acompanhamento do progresso durante a combinação dos arquivos.
- Download de um grupo ou de todos os grupos.
- Armazenamento local dos arquivos usando IndexedDB.
- Temas claro e escuro.
- Versão web e aplicativo para Windows.

## Privacidade

Os arquivos PDF permanecem no computador do usuário. Eles não são enviados para um servidor. A criação dos PDFs acontece localmente usando `pdf-lib`.

## Tecnologias

- React
- Vite
- Electron
- pdf-lib
- IndexedDB

## Executar no navegador

Requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Depois, abra no navegador o endereço exibido pelo Vite.

## Testar e gerar o build web

```bash
npm test
npm run build
```

## Aplicativo para Windows

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

## Estrutura do projeto

```text
src/                    Interface web e lógica de agrupamento
test/                   Testes automatizados
pdf-grupos-electron/    Aplicativo desktop baseado em Electron
```

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
