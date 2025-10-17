export const imprimirHTML = (contenido, titulo = "Documento") => {
  const ventana = window.open('', '', 'width=1000,height=700');
  ventana.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; margin-bottom: 20px; color: #333; }
          table { border-collapse: collapse; width: 100%; table-layout: fixed; }
          th, td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: left;
            word-wrap: break-word;
            font-size: 10pt;
          }
          th { background-color: #f5f5f5; }
          .badge {
            background-color: #0d6efd;
            color: white;
            padding: 3px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h2>${titulo}</h2>
        ${contenido}
      </body>
    </html>
  `);
  ventana.document.close();
  ventana.print();
  ventana.close();
};
