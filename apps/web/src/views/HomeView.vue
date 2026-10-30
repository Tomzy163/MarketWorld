<template>
  <main class="shell">
    <section class="card">
      <p class="eyebrow">MarketWorld</p>
      <h1>Seller-first marketplace operations</h1>
      <p>
        The app shell is wired and ready for storefront, customer, seller, and admin flows.
      </p>
      <ul>
        <li>Vue 3 + Router foundation</li>
        <li>Express backend with secure middleware</li>
        <li>PostgreSQL + RLS-ready architecture</li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f172a, #111827 30%, #1d4ed8);
  color: #e2e8f0;
}
.card {
  width: min(700px, calc(100vw - 2rem));
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.5);
}
.eyebrow {
  margin: 0 0 0.5rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: #93c5fd;
}
h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 4vw, 3.25rem);
}
ul {
  padding-left: 1.25rem;
  line-height: 1.8;
}
</style>
