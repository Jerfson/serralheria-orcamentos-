import { EmpresaConfig, Orcamento } from '../types/orcamento';
import { Cliente } from '../types/cliente';
import { MaterialPerfil, InsumoConsumivel } from '../types/material';
import { CATALOGO_PERFIS_PADRAO } from '../data/catalogoPerfis';
import { CATALOGO_INSUMOS_PADRAO } from '../data/catalogoInsumos';

const DB_NAME = 'SerralheriaPro_DB';
const DB_VERSION = 2;

export const EMPRESA_CONFIG_PADRAO: EmpresaConfig = {
  id: 'default',
  nomeFantasia: 'Serralheria & Estruturas JRV',
  razaoSocial: 'JRV Esquadrias Metálicas e Serralheria Ltda',
  documento: '12.345.678/0001-90',
  telefoneWhatsApp: '11999998888',
  email: 'contato@serralheriajrv.com.br',
  endereco: 'Rua dos Ferroviários, 150 - Distrito Industrial',
  cidadeUf: 'São Paulo - SP',
  logoUrl: '',
  chavePix: '12345678000190',
  tipoChavePix: 'cnpj',
  taxaHoraOficina: 45.00,
  taxaHoraInstalacao: 55.00,
  margemLucroPadrao: 40.0,
  validadeDiasPadrao: 10,
  garantiaMesesPadrao: 12,
  termosCondicoesPadrao: '• Pagamento: 50% de sinal no fechamento do pedido e saldo na conclusão da instalação.\n• A garantia cobre defeitos de fabricação e solda estrutural, não cobrindo danos por mau uso ou intempéries anormais.\n• O local de instalação deve estar livre e desimpedido na data agendada.'
};

export class OfflineDatabase {
  private db: IDBDatabase | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  public async init(): Promise<IDBDatabase | null> {
    if (!this.isSupported) return null;
    if (this.db) return this.db;

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('empresa')) {
          db.createObjectStore('empresa', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('clientes')) {
          const clientStore = db.createObjectStore('clientes', { keyPath: 'id' });
          clientStore.createIndex('nome', 'nome', { unique: false });
        }
        if (!db.objectStoreNames.contains('materiais')) {
          db.createObjectStore('materiais', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('insumos')) {
          db.createObjectStore('insumos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orcamentos')) {
          const orcStore = db.createObjectStore('orcamentos', { keyPath: 'id' });
          orcStore.createIndex('numeroSequencial', 'numeroSequencial', { unique: false });
          orcStore.createIndex('clienteId', 'clienteId', { unique: false });
          orcStore.createIndex('status', 'status', { unique: false });
        } else {
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const orcStore = transaction.objectStore('orcamentos');
            if (orcStore.indexNames.contains('numeroSequencial')) {
              orcStore.deleteIndex('numeroSequencial');
            }
            orcStore.createIndex('numeroSequencial', 'numeroSequencial', { unique: false });
          }
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('Erro ao abrir IndexedDB, usando LocalStorage como fallback:', event);
        resolve(null);
      };
    });
  }

  private memoryStorage = new Map<string, string>();

  private getFallback(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // Ignorar e usar memória
    }
    return this.memoryStorage.get(key) || null;
  }

  private setFallback(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Ignorar e usar memória
    }
    this.memoryStorage.set(key, value);
  }

  public async getStore<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    if (!db) {
      const fallback = this.getFallback(`serralheria_${storeName}`);
      return fallback ? JSON.parse(fallback) : [];
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.init();
    if (!db) {
      const items = await this.getStore<any>(storeName);
      return items.find((i: any) => i.id === id) || null;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async save<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    const db = await this.init();
    if (!db) {
      const items = await this.getStore<any>(storeName);
      const index = items.findIndex((i: any) => i.id === item.id);
      if (index >= 0) {
        items[index] = item;
      } else {
        items.push(item);
      }
      this.setFallback(`serralheria_${storeName}`, JSON.stringify(items));
      return item;
    }

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve(item);
        request.onerror = (err) => {
          console.warn(`[offlineDB] Falha no store.put(${storeName}), salvando em fallback:`, err);
          try {
            const fallbackKey = `serralheria_${storeName}`;
            const fallback = this.getFallback(fallbackKey);
            const items = fallback ? JSON.parse(fallback) : [];
            const index = items.findIndex((i: any) => i.id === item.id);
            if (index >= 0) items[index] = item;
            else items.push(item);
            this.setFallback(fallbackKey, JSON.stringify(items));
          } catch {
            // Ignora
          }
          resolve(item);
        };
      } catch (err) {
        console.warn(`[offlineDB] Erro de transação em ${storeName}:`, err);
        resolve(item);
      }
    });
  }

  public async delete(storeName: string, id: string): Promise<void> {
    const db = await this.init();
    if (!db) {
      const items = await this.getStore<any>(storeName);
      const filtered = items.filter((i: any) => i.id !== id);
      this.setFallback(`serralheria_${storeName}`, JSON.stringify(filtered));
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDB = new OfflineDatabase();
