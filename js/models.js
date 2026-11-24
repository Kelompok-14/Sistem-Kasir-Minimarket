/* ===== Model / Entity (OOP) ===== */

class Product {
  constructor({ code, name, category, price, stock }) {
    this.code = String(code);
    this.name = name;
    this.category = category;
    this.price = Number(price);
    this.stock = Number(stock);
  }
  get isAvailable() { return this.stock > 0; }
  get isLowStock() { return this.stock < 5; }
  reduceStock(qty) { this.stock = Math.max(0, this.stock - qty); }
  restock(qty) { this.stock += qty; }
}

class CartItem {
  constructor(product, qty = 1) {
    this.code = product.code;
    this.name = product.name;
    this.price = product.price;
    this.qty = qty;
  }
  get subtotal() { return this.price * this.qty; }
}

class Cart {
  static TAX_RATE = 0.11;
  #items = [];

  get items() { return [...this.#items]; }
  get isEmpty() { return this.#items.length === 0; }
  get subtotal() { return this.#items.reduce((s, i) => s + i.subtotal, 0); }

  /** Menambah 1 unit; melempar Error bila melebihi stok. */
  add(product) {
    const existing = this.#items.find(i => i.code === product.code);
    if (existing) {
      if (existing.qty + 1 > product.stock) throw new Error("Jumlah melebihi stok yang tersedia!");
      existing.qty++;
    } else {
      this.#items.push(new CartItem(product));
    }
  }

  changeQty(index, delta, product) {
    const item = this.#items[index];
    if (!item) return;
    if (delta > 0 && item.qty + 1 > product.stock) throw new Error("Stok barang tidak mencukupi!");
    item.qty += delta;
    if (item.qty <= 0) this.#items.splice(index, 1);
  }

  remove(index) { this.#items.splice(index, 1); }
  clear() { this.#items = []; }

  calculate(discountInput = 0, useTax = false) {
    const subtotal = this.subtotal;
    const discount = Math.min(Math.max(Number(discountInput) || 0, 0), subtotal);
    const taxable = subtotal - discount;
    const tax = useTax ? taxable * Cart.TAX_RATE : 0;
    return { subtotal, discount, tax: Math.round(tax), grandTotal: Math.round(taxable + tax) };
  }
}

class Transaction {
  constructor({ items, totals, payAmount, cashier, datetime }) {
    const d = datetime ? new Date(datetime) : new Date();
    this.datetime = d.toISOString();
    this.date = d.toLocaleDateString("id-ID");
    this.time = d.toLocaleTimeString("id-ID", { hour12: false });
    this.items = items.map(i => ({ code: i.code, name: i.name, price: i.price, qty: i.qty }));
    this.subtotal = totals.subtotal;
    this.discount = totals.discount;
    this.tax = totals.tax;
    this.grandTotal = totals.grandTotal;
    this.payAmount = payAmount;
    this.change = payAmount - totals.grandTotal;
    this.cashier = cashier;
  }
}
