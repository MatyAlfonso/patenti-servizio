<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="/logo.png" alt="Logo" class="navbar-logo" />
      <span class="navbar-brand">Patenti di servizio PCR/CFR</span>
    </div>

    <ul class="navbar-links">
      <li>
        <router-link to="/richieste">Richieste</router-link>
      </li>
      <li>
        <router-link to="/patenti">Patenti</router-link>
      </li>
      <li>
        <router-link to="/anagrafica_personale">Anagrafica del personale</router-link>
      </li>
      <li>
        <router-link to="/anagrafica_enti">Anagrafica degli enti</router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0067b1;
  padding: 0 2rem;
  height: 60px;
  color: #fff;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.4rem;
}

.navbar-links {
  display: flex;
  list-style: none;
  gap: 20px;
}

.navbar-links a {
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.navbar-links a:hover {
  opacity: 0.8;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.navbar-logo {
  height: 50px;
  width: auto;
  object-fit: contain;
}
.router-link-active {
  border-bottom: 2px solid #ff5900;
  padding-bottom: 5px;
}
</style>