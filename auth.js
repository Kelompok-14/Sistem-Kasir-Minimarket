/* ===== Autentikasi & Role (Inheritance + Polymorphism) ===== */

class User {
  constructor(username, name, role) { this.username = username; this.name = name; this.role = role; }
  /** Dioverride oleh subclass. */
  get permissions() { return []; }
  can(action) { return this.permissions.includes(action); }
  get roleLabel() { return this.role; }
}

class Admin extends User {
  constructor(username, name) { super(username, name, "admin"); }
  get permissions() { return ["sell", "view_history", "add_product", "delete_product", "restock", "reset_data"]; }
  get roleLabel() { return "Admin"; }
}

class Cashier extends User {
  constructor(username, name) { super(username, name, "kasir"); }
  get permissions() { return ["sell", "view_history"]; }
  get roleLabel() { return "Kasir"; }
}

class AuthService {
  static SESSION_KEY = "pos_session";
  // Akun uji coba (data demo untuk penilaian). Password disimpan sebagai hash SHA-256.
  static ACCOUNTS = [
    { username: "admin", name: "Administrator", role: "admin",
      hash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" },
    { username: "kasir", name: "Mendy", role: "kasir",
      hash: "f02b7c1e519e4fa436147f7e1399974f9510aa9c8e0cb8be29151eb540f9d214" }
  ];

  static async sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  static build(acc) {
    return acc.role === "admin" ? new Admin(acc.username, acc.name) : new Cashier(acc.username, acc.name);
  }

  static async login(username, password) {
    const acc = this.ACCOUNTS.find(a => a.username === username.trim().toLowerCase());
    if (!acc || acc.hash !== await this.sha256(password)) throw new Error("Username atau password salah!");
    const user = this.build(acc);
    sessionStorage.setItem(this.SESSION_KEY, acc.username);
    return user;
  }

  static restore() {
    const acc = this.ACCOUNTS.find(a => a.username === sessionStorage.getItem(this.SESSION_KEY));
    return acc ? this.build(acc) : null;
  }

  static logout() { sessionStorage.removeItem(this.SESSION_KEY); }
}
