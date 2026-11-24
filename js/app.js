/* ===== Controller / View: PosApp ===== */

const $ = id => document.getElementById(id);
const rp = n => "Rp " + Math.round(n).toLocaleString("id-ID");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

class PosApp {
  static CATEGORIES = ["Semua", "Makanan", "Minuman", "Sembako", "Kebersihan", "Camilan"];

  constructor() {
    this.productRepo = new ProductRepository();
    this.txRepo = new TransactionRepository();
    this.products = this.productRepo.load();
    this.history = this.txRepo.load();
    this.cart = new Cart();
    this.category = "Semua";
    this.user = null;
    document.addEventListener("DOMContentLoaded", () => this.init());
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") ["add-product-modal", "receipt-modal", "history-modal"].forEach(id => !$(id).classList.contains("hidden") && this.closeModal(id));
    });
  }

  init() {
    this.tickClock(); setInterval(() => this.tickClock(), 1000);
    const u = AuthService.restore();
    u ? this.enter(u) : this.showLogin();
  }

  /* ---------- Auth ---------- */
  showLogin() { $("login-screen").classList.remove("hidden"); $("app-root").classList.add("hidden"); $("login-user").focus(); }

  async login(e) {
    e.preventDefault();
    try {
      this.enter(await AuthService.login($("login-user").value, $("login-pass").value));
      $("login-error").classList.add("hidden");
    } catch (err) {
      $("login-error").textContent = err.message;
      $("login-error").classList.remove("hidden");
    }
  }

  fillDemo(username, password) { $("login-user").value = username; $("login-pass").value = password; }

  enter(user) {
    this.user = user;
    $("login-screen").classList.add("hidden");
    $("app-root").classList.remove("hidden");
    $("user-label").textContent = `${user.roleLabel}: ${user.name}`;
    document.querySelectorAll("[data-perm]").forEach(el => el.classList.toggle("hidden", !user.can(el.dataset.perm)));
    this.renderCategories(); this.renderCatalog(); this.renderCart(); this.renderHistory();
    $("barcode-input").focus();
  }

  logout() { AuthService.logout(); this.cart.clear(); this.user = null; $("login-pass").value = ""; this.showLogin(); }

  /* ---------- UI helpers ---------- */
  tickClock() {
    const n = new Date();
    $("live-clock").textContent = n.toLocaleTimeString("id-ID", { hour12: false }) + " WITA";
    $("live-date").textContent = n.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "short", day: "numeric" });
  }
  openModal(id) { $(id).classList.remove("hidden"); $(id).classList.add("flex"); }
  closeModal(id) { $(id).classList.add("hidden"); $(id).classList.remove("flex"); $("barcode-input").focus(); }
  findProduct(code) { return this.products.find(p => p.code === code); }

  /* ---------- Katalog ---------- */
  renderCategories() {
    $("category-tabs").innerHTML = PosApp.CATEGORIES.map(c => `
      <button onclick="app.filterCategory('${c}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${this.category === c ? "bg-indigo-700 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}">${c}</button>`).join("");
  }
  filterCategory(c) { this.category = c; this.renderCategories(); this.renderCatalog(); }

  renderCatalog() {
    const q = $("search-input").value.toLowerCase().trim();
    const list = this.products.filter(p => (this.category === "Semua" || p.category === this.category) && (p.name.toLowerCase().includes(q) || p.code.includes(q)));
    const isAdmin = this.user && this.user.can("delete_product");
    $("product-grid").innerHTML = list.length ? list.map(p => `
      <div onclick="app.addToCart('${esc(p.code)}')" class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-pointer transition flex flex-col justify-between ${p.isAvailable ? "" : "opacity-50"}">
        <div>
          <div class="flex justify-between text-[10px] text-gray-400 font-mono mb-1"><span>#${esc(p.code)}</span><span class="${p.isLowStock ? "text-red-500 font-bold" : ""}">Stok: ${p.stock}</span></div>
          <h4 class="font-semibold text-xs text-gray-800 line-clamp-2 leading-snug">${esc(p.name)}</h4>
        </div>
        <div class="mt-2 flex justify-between items-center">
          <span class="text-xs font-bold text-indigo-900">${rp(p.price)}</span>
          <span class="flex gap-1">
            ${isAdmin ? `<button title="Tambah stok" onclick="event.stopPropagation();app.restock('${esc(p.code)}')" class="bg-emerald-50 text-emerald-700 px-1.5 rounded-md text-xs"><i class="fa-solid fa-boxes-stacked"></i></button>
            <button title="Hapus produk" onclick="event.stopPropagation();app.deleteProduct('${esc(p.code)}')" class="bg-red-50 text-red-600 px-1.5 rounded-md text-xs"><i class="fa-solid fa-trash"></i></button>` : ""}
            <span class="bg-indigo-50 text-indigo-600 p-1 rounded-md text-xs"><i class="fa-solid fa-plus"></i></span>
          </span>
        </div>
      </div>`).join("") : `<div class="col-span-full text-center py-12 text-gray-400">Produk tidak ditemukan</div>`;
  }

  /* ---------- Keranjang ---------- */
  guard(fn) { try { fn(); } catch (e) { alert(e.message); } }

  addToCart(code) {
    const p = this.findProduct(code);
    if (!p) return alert("Produk tidak ditemukan!");
    if (!p.isAvailable) return alert("Stok barang habis!");
    this.guard(() => { this.cart.add(p); this.renderCart(); });
    $("barcode-input").focus();
  }
  scan(e) {
    if (e.key !== "Enter") return;
    const code = e.target.value.trim();
    if (code) { this.addToCart(code); e.target.value = ""; }
  }
  changeQty(i, d) {
    const item = this.cart.items[i];
    this.guard(() => { this.cart.changeQty(i, d, this.findProduct(item.code)); this.renderCart(); });
  }
  removeItem(i) { this.cart.remove(i); this.renderCart(); }
  clearCart() { if (!this.cart.isEmpty && confirm("Yakin ingin mengosongkan keranjang?")) { this.cart.clear(); this.renderCart(); } }

  renderCart() {
    const items = this.cart.items;
    $("empty-cart-msg").classList.toggle("hidden", items.length > 0);
    $("cart-table-body").innerHTML = items.map((it, i) => `
      <tr class="border-b border-gray-100">
        <td class="py-2.5 font-medium text-gray-800 pr-2"><div class="line-clamp-1">${esc(it.name)}</div><div class="text-[10px] text-gray-400">${rp(it.price)}</div></td>
        <td class="py-2.5 text-center"><div class="flex items-center justify-center gap-1">
          <button onclick="app.changeQty(${i},-1)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold">−</button>
          <span class="w-7 text-center font-bold text-sm">${it.qty}</span>
          <button onclick="app.changeQty(${i},1)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold">+</button></div></td>
        <td class="py-2.5 text-right font-semibold text-gray-700">${rp(it.subtotal)}</td>
        <td class="py-2.5 text-center"><button onclick="app.removeItem(${i})" class="text-red-500 hover:text-red-700 p-1"><i class="fa-solid fa-trash-can"></i></button></td>
      </tr>`).join("");
    this.updateTotals();
  }

  totals() { return this.cart.calculate($("discount-input").value, $("tax-checkbox").checked); }

  updateTotals() {
    const t = this.totals();
    if (Number($("discount-input").value) > t.subtotal) $("discount-input").value = t.subtotal;
    const pay = Number($("pay-amount-input").value) || 0;
    $("summary-subtotal").textContent = rp(t.subtotal);
    $("summary-tax").textContent = rp(t.tax);
    $("summary-grand-total").textContent = rp(t.grandTotal);
    $("summary-change").textContent = rp(pay >= t.grandTotal ? pay - t.grandTotal : 0);
  }

  quickPay(v) {
    const g = this.totals().grandTotal;
    $("pay-amount-input").value = v === "exact" || v < g ? g : v;
    this.updateTotals();
  }

  /* ---------- Transaksi ---------- */
  checkout() {
    if (this.cart.isEmpty) return alert("Keranjang belanja masih kosong!");
    if (!this.user.can("sell")) return alert("Anda tidak punya akses transaksi.");
    const totals = this.totals();
    const pay = Number($("pay-amount-input").value) || 0;
    if (pay < totals.grandTotal) return alert("Jumlah pembayaran kurang!\nTotal: " + rp(totals.grandTotal));

    const items = this.cart.items;
    items.forEach(i => this.findProduct(i.code)?.reduceStock(i.qty));
    this.productRepo.saveAll(this.products);

    const tx = new Transaction({ items, totals, payAmount: pay, cashier: this.user.name });
    this.history.unshift(tx);
    this.history = this.history.slice(0, TransactionRepository.MAX);
    this.txRepo.save(this.history);

    this.fillReceipt(tx);
    this.openModal("receipt-modal");

    this.cart.clear();
    $("pay-amount-input").value = ""; $("discount-input").value = "0"; $("tax-checkbox").checked = false;
    this.renderCatalog(); this.renderCart(); this.renderHistory();
    $("barcode-input").focus();
  }

  fillReceipt(tx) {
    $("receipt-date").textContent = tx.date; $("receipt-time").textContent = tx.time;
    $("receipt-cashier").textContent = "Kasir: " + tx.cashier;
    $("receipt-subtotal").textContent = rp(tx.subtotal); $("receipt-discount").textContent = rp(tx.discount);
    $("receipt-tax").textContent = rp(tx.tax); $("receipt-total").textContent = rp(tx.grandTotal);
    $("receipt-pay").textContent = rp(tx.payAmount); $("receipt-change").textContent = rp(tx.change);
    $("receipt-items").innerHTML = tx.items.map(i => `
      <div><div class="flex justify-between"><span class="truncate max-w-[140px]">${esc(i.name)}</span><span>${(i.price * i.qty).toLocaleString("id-ID")}</span></div>
      <div class="text-[10px] text-gray-500 pl-1">${i.qty} x ${i.price.toLocaleString("id-ID")}</div></div>`).join("");
  }

  renderHistory() {
    $("empty-history-msg").classList.toggle("hidden", this.history.length > 0);
    $("history-table-body").innerHTML = this.history.map(h => `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="p-2"><div class="font-medium">${h.time}</div><div class="text-[10px] text-gray-400">${h.date}</div></td>
        <td class="p-2">${esc(h.cashier || "-")}</td>
        <td class="p-2 text-right font-bold">${rp(h.grandTotal)}</td>
        <td class="p-2 text-right">${rp(h.payAmount)}</td>
        <td class="p-2 text-right text-emerald-600 font-semibold">${rp(h.change)}</td>
      </tr>`).join("");
  }

  /* ---------- Manajemen produk (Admin) ---------- */
  saveProduct(e) {
    e.preventDefault();
    if (!this.user.can("add_product")) return alert("Hanya Admin yang boleh menambah produk.");
    const code = $("new-code").value.trim(), name = $("new-name").value.trim();
    const price = parseFloat($("new-price").value), stock = parseInt($("new-stock").value, 10);
    if (!code || !name) return alert("Kode dan nama produk wajib diisi!");
    if (this.findProduct(code)) return alert("Kode produk sudah ada!");
    if (!(price >= 0) || !(stock >= 0)) return alert("Harga dan stok tidak boleh negatif!");
    this.products.push(new Product({ code, name, category: $("new-category").value, price, stock }));
    this.productRepo.saveAll(this.products);
    this.renderCatalog(); this.closeModal("add-product-modal"); e.target.reset();
  }

  restock(code) {
    const n = parseInt(prompt("Tambah stok berapa unit?", "10"), 10);
    if (n > 0) { this.findProduct(code).restock(n); this.productRepo.saveAll(this.products); this.renderCatalog(); }
  }

  deleteProduct(code) {
    if (!this.user.can("delete_product") || !confirm("Hapus produk ini dari katalog?")) return;
    this.products = this.products.filter(p => p.code !== code);
    this.productRepo.saveAll(this.products);
    this.renderCatalog();
  }

  resetData() {
    if (!this.user.can("reset_data") || !confirm("Reset semua produk & riwayat ke data awal?")) return;
    this.productRepo.clear(); this.txRepo.clear();
    this.products = this.productRepo.load(); this.history = []; this.cart.clear();
    this.renderCatalog(); this.renderCart(); this.renderHistory();
  }
}

const app = new PosApp();
