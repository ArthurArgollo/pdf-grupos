# PDF Groups

PDF Groups is a small desktop and web application for organizing PDF files into groups and creating a separate PDF for each group.

I built it to solve a practical problem: when several documents need to be combined in different ways, simply merging everything into one file is not enough. With PDF Groups, you can arrange files into named groups, reorder them, and download the results individually or all at once.

> **Português:** [Leia o README em português](README.pt-BR.md)

## Features

- Select multiple PDF files at once.
- Drag and drop files into the application.
- Organize files into named groups.
- Rename and delete groups.
- Reorder PDFs within each group.
- Detect and block duplicate files.
- Undo the latest organization change.
- Track progress while combining files.
- Download one group or all groups at once.
- Store files locally using IndexedDB.
- Light and dark themes.
- Web version and Windows desktop version.

## Privacy

PDF files stay on your computer. They are not uploaded to a server. PDF creation happens locally with `pdf-lib`.

## Tech stack

- React
- Vite
- Electron
- pdf-lib
- IndexedDB

## Run in the browser

Requirements: Node.js 18 or later.

```bash
npm install
npm run dev
```

Then open the address shown by Vite in your browser.

## Test and build the web version

```bash
npm test
npm run build
```

## Windows application

The Electron project is located in `pdf-grupos-electron`.

```bash
cd pdf-grupos-electron
npm install
npm run dev
```

To generate the installer and portable version:

```bash
npm run dist
```

The generated files are placed in `pdf-grupos-electron/release`:

- `PDF Grupos Setup 1.0.0.exe`: Windows installer.
- `PDF Grupos 1.0.0.exe`: portable version.

## Project structure

```text
src/                    Web interface and grouping logic
test/                   Automated tests
pdf-grupos-electron/    Electron desktop application
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
