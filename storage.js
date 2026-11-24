/* ===== Repository: lapisan penyimpanan data (localStorage) ===== */

class Repository {
  constructor(key, factory) { this.key = key; this.factory = factory; }
  findAll() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.key));
      return Array.isArray(raw) ? raw.map(r => this.factory(r)) : null;
    } catch { return null; }
  }
  saveAll(list) {
    try { localStorage.setItem(this.key, JSON.stringify(list)); } catch (e) { console.error(e); }
  }
  clear() { localStorage.removeItem(this.key); }
}

class ProductRepository extends Repository {
  static DEFAULTS = [
    { code: "101", name: "Indomie Goreng 85g", category: "Makanan", price: 3500, stock: 50 },
    { code: "102", name: "Minyak Goreng Sania 2L", category: "Sembako", price: 38000, stock: 20 },
    { code: "103", name: "Susu Ultra Milk 1L", category: "Minuman", price: 19500, stock: 15 },
    { code: "104", name: "Roti Tawar Sari Roti", category: "Makanan", price: 16000, stock: 12 },
    { code: "105", name: "Aqua Botol 600ml", category: "Minuman", price: 4000, stock: 100 },
    { code: "106", name: "Sabun Lifebuoy 110g", category: "Kebersihan", price: 5500, stock: 30 },
    { code: "107", name: "Chitato Sapi Panggang 68g", category: "Camilan", price: 10000, stock: 25 },
    { code: "108", name: "Teh Botol Sosro 350ml", category: "Minuman", price: 4500, stock: 40 }
  ];
  constructor() { super("pos_products", r => new Product(r)); }
  load() { return this.findAll() || ProductRepository.DEFAULTS.map(p => new Product(p)); }
}

class TransactionRepository extends Repository {
  static MAX = 100;
  constructor() { super("pos_history", r => Object.assign(Object.create(Transaction.prototype), r)); }
  load() { return this.findAll() || []; }
  save(list) { this.saveAll(list.slice(0, TransactionRepository.MAX)); }
}
