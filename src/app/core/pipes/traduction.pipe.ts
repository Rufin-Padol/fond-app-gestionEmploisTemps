import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

interface TranslationResponse {
  translatedText: string;
}

@Pipe({
  name: 'traduction',
    pure: false
})
export class TraductionPipe implements PipeTransform {

  private cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  transform(value: string): Observable<string> {
    if (!value) {
      return of('');
    }

    if (this.cache.has(value)) {
      return of(this.cache.get(value)!);
    }

    const body = {
      q: value,
      source: 'fr',
      target: 'en',
      format: 'text'
    };

    return this.http.post<TranslationResponse>('https://libretranslate.de/translate', body).pipe(
      map(response => {
        this.cache.set(value, response.translatedText);
        return response.translatedText;
      }),
      catchError(() => of(value)) // en cas d'erreur on renvoie le texte original
    );
  }
}
