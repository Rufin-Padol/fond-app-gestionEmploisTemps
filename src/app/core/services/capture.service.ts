import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {

async captureElementAsImage(element: HTMLElement): Promise<string> {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '0';
    iframe.style.width = '800px';  // largeur fixe pour le rendu
    iframe.style.height = '600px'; // hauteur fixe pour le rendu
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Impossible de créer l’iframe');

    // Cloner l’élément dans l’iframe avec le style Tailwind
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <link href="tailwind.css" rel="stylesheet" />
          <style>
            body { margin: 0; padding: 0; }
            #clone { width: 100%; }
          </style>
        </head>
        <body>
          <div id="clone">${element.innerHTML}</div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Attendre que l’iframe ait fini de charger le contenu
    await new Promise(resolve => setTimeout(resolve, 300));

    const clonedElement = iframeDoc.getElementById('clone');
    if (!clonedElement) {
      document.body.removeChild(iframe);
      throw new Error('Impossible de trouver l’élément cloné dans l’iframe');
    }

    // Capture avec html2canvas, options corrigées
    const canvas = await html2canvas(clonedElement, {
      useCORS: true,
    });

    document.body.removeChild(iframe);

    return canvas.toDataURL('image/png');
  }
}
